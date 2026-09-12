# capacitor-foldable

Fold-state and dual-display APIs for foldable devices in Capacitor apps.

Reports whether the device is flat or half-opened, which way the hinge runs, and
which part of the window the hinge covers, so a Capacitor app can lay itself out
around the fold instead of underneath it.

## Platform support

| Platform | Status | Backed by |
| -------- | ------ | --------- |
| Android  | Implemented | [`androidx.window`](https://developer.android.com/jetpack/androidx/releases/window) `WindowInfoTracker` |
| iOS      | Stub | Placeholder pending Apple's foldable APIs. `getFoldState()` always resolves to `{ state: 'flat' }` and `foldStateChange` never fires. |
| Web      | Stub | No fold API exists. `getFoldState()` always resolves to `{ state: 'flat' }` and `foldStateChange` never fires. |

iOS support is a placeholder pending Apple's foldable APIs. Nothing here reads
private or unreleased Apple SDKs; the iOS source is marked with `TODO`s and will
be filled in once public APIs ship.

Because every platform resolves `getFoldState()` and no platform throws
`Unimplemented`, you can call it unconditionally and treat `'flat'` as the
"nothing to work around" case.

## Install

```bash
npm install capacitor-foldable
npx cap sync
```

Android requires `compileSdk` 34 or newer and Android Gradle Plugin 8.1.1 or newer
(`androidx.window:window:1.5.1` declares `minCompileSdk=34`). Capacitor 8 projects already
exceed both.

### Configuration changes

The Capacitor app template already declares the config changes a fold produces:

```xml
android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
```

so folding does not recreate your activity. Do not remove those values.

Switching between the cover and inner display is a different matter: that moves the activity to
another `Display`, so it is genuinely stopped and restarted. The plugin re-subscribes on restart and
re-emits the current state, which means you can see a repeated `foldStateChange` with the same
payload after a display switch. Treat the event as the current state rather than a transition.

## Usage

```typescript
import { Foldable } from 'capacitor-foldable';

// Decide once whether any fold-aware work is worth doing.
const { foldable } = await Foldable.isDeviceFoldable();
if (!foldable) return;

const { state, hingeOrientation, occludedBounds } = await Foldable.getFoldState();

if (state === 'half-opened' && hingeOrientation === 'vertical') {
  // Book posture: put the list on one side of the hinge and the detail on the other.
}

const handle = await Foldable.addListener('foldStateChange', (fold) => {
  document.body.classList.toggle('is-folded', fold.state === 'half-opened');

  if (fold.occludedBounds) {
    // Keep content out of the hinge. Bounds are CSS pixels, window-relative.
    content.style.paddingBottom = `${fold.occludedBounds.height}px`;
  }
});

// Later
await handle.remove();
```

### Notes on the Android behaviour

- `isDeviceFoldable()` reads `WindowInfoTracker.supportedPostures`, falling back to the
  `FEATURE_SENSOR_HINGE_ANGLE` system feature on API 30+. You need it because a fold state of
  `'flat'` is ambiguous: an ordinary phone and a foldable shut on its cover display produce the
  same payload.
- `hingeOrientation` is relative to the **window**, not the device. The hinge does not move when
  you rotate, but the window does, so the same physical posture reports `vertical` in portrait and
  `horizontal` in landscape. That is what you want: a half-opened device is a book layout in portrait
  and a tabletop layout in landscape. `foldStateChange` does not fire on rotation, so re-read with
  `getFoldState()` from a `screen.orientation` change handler if your layout depends on it.
- `occludedBounds` is only present when the hinge physically covers part of the
  display (`FoldingFeature.OcclusionType.FULL`). Devices with a seamless folding
  screen report a fold state and orientation but no occluded bounds.
- Bounds are converted from device pixels to CSS pixels so they line up with
  layout coordinates without further conversion on your side.
- `'closed'` is in the type for completeness but is never emitted. Android stops
  publishing a folding feature once the inner display is off, so a folded-shut
  device reports `'flat'` for whichever display the app is running on.
- Events are collected only while the activity is started, and collection resumes
  automatically when the app returns to the foreground.

### Testing on an emulator

Create an AVD from one of the bundled foldable profiles: `pixel_9_pro_fold`,
`pixel_fold`, `7.6in Foldable`, or `8in Foldable`.

```bash
avdmanager create avd -n Fold -d pixel_9_pro_fold \
  -k "system-images;android-36;google_apis_playstore;arm64-v8a"
```

Change posture with the fold buttons in the emulator's side toolbar, or from the
command line:

```bash
adb emu posture 1   # closed
adb emu posture 2   # half-opened
adb emu posture 3   # opened
adb shell cmd device_state print-state   # confirm it actually landed
```

The console command is unreliable: on a Pixel 9 Pro Fold AVD, `posture 2` sometimes
resolves to closed instead of half-opened, and repeating the same command can produce
different states. Always confirm with `print-state` rather than trusting the command.
The toolbar buttons are more dependable.

Note that the emulator's hinge is seamless (`hw.sensor.hinge.areas` has width 0), so
`occludedBounds` is never populated there.

## API

<docgen-index>

* [`isDeviceFoldable()`](#isdevicefoldable)
* [`getFoldState()`](#getfoldstate)
* [`addListener('foldStateChange', ...)`](#addlistenerfoldstatechange-)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### isDeviceFoldable()

```typescript
isDeviceFoldable() => Promise<{ foldable: boolean; }>
```

Whether this device has a fold at all.

Use it to decide once, at startup, whether any fold-aware layout work is
worth doing. A fold state of `'flat'` cannot answer this on its own: an
ordinary phone and a foldable shut on its cover display both report
`{ state: 'flat' }`.

Always `false` on iOS and web.

**Returns:** <code>Promise&lt;{ foldable: boolean; }&gt;</code>

**Since:** 0.0.1

--------------------


### getFoldState()

```typescript
getFoldState() => Promise<FoldState>
```

Read the current fold state of the device.

Resolves with `{ state: 'flat' }` on devices and platforms that expose no
fold information.

**Returns:** <code>Promise&lt;<a href="#foldstate">FoldState</a>&gt;</code>

**Since:** 0.0.1

--------------------


### addListener('foldStateChange', ...)

```typescript
addListener(eventName: 'foldStateChange', listenerFunc: (state: FoldState) => void) => Promise<PluginListenerHandle>
```

Listen for changes to the fold state, such as the user opening, closing, or
partially folding the device, or rotating it so the hinge changes orientation.

| Param              | Type                                                                |
| ------------------ | ------------------------------------------------------------------- |
| **`eventName`**    | <code>'foldStateChange'</code>                                      |
| **`listenerFunc`** | <code>(state: <a href="#foldstate">FoldState</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 0.0.1

--------------------


### Interfaces


#### FoldState

| Prop                   | Type                                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Since |
| ---------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`state`**            | <code>'flat' \| 'half-opened' \| 'closed'</code>                      | The posture of the device's fold. `'flat'` means the device is fully unfolded (or is not a foldable at all). `'half-opened'` means the two halves are at a meaningful angle to each other, for example a laptop-style or book-style posture. `'closed'` is part of the API for completeness, but no platform currently reports it: Android's `WindowLayoutInfo` stops publishing a folding feature once the inner display is off, so a folded-shut device reports `'flat'` for whichever display the app is running on. | 0.0.1 |
| **`hingeOrientation`** | <code>'horizontal' \| 'vertical'</code>                               | Orientation of the hinge relative to the window. `'horizontal'` means the hinge runs left-to-right, splitting the window into a top and a bottom half. `'vertical'` means it runs top-to-bottom, splitting the window into a left and a right half. Omitted when the device reports no folding feature.                                                                                                                                                                                                                 | 0.0.1 |
| **`occludedBounds`**   | <code>{ x: number; y: number; width: number; height: number; }</code> | The region of the window that the hinge fully occludes, in CSS pixels relative to the top-left of the window, so it can be compared directly against layout coordinates. Only present when the hinge physically covers part of the display (Android's `OcclusionType.FULL`). A seamless folding display reports no occluded bounds even while it is half-opened.                                                                                                                                                        | 0.0.1 |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

</docgen-api>
