# Android foldables

Backed by Jetpack WindowManager, so the fold comes from whatever the device reports: Pixel Fold, Galaxy Z Fold and Flip, and the foldable emulators.

## Postures

`getFoldState()` reports `posture` as `flat`, `tabletop` or `book`, and `foldStateChange` fires as the device moves. Tabletop is half open with a horizontal hinge, which is the laptop pose: content above the crease, controls below. Book is half open with a vertical hinge.

`isSeparating` says whether the fold actually splits the window into two areas. A flat *foldable* still reports `hingeBounds`, which is what lets a layout line up with the crease before anyone folds it. A device with no fold reports `posture: 'flat'` and no `hingeBounds`, which is the difference worth testing for. It still reports `cameraBounds` from the display cutouts.

`hingeMargins`, `activeDisplay` and the hinge `status` are iOS only and never appear here. `cameraBounds` and `occludedBounds` do: the cutouts, and the fold's own bounds when it fully occludes content. To tell the cover screen from the inner one, lean on `getSizeClass()`, where the outer display shows up as a compact width, keeping in mind it describes the window rather than the panel, so rotation and multi-window move it too.

## The hinge angle

Only devices with a hinge sensor report an angle, and only on Android 11 and later; everything else answers `null`, and the fold state still works, since it comes from WindowManager rather than the sensor. The plugin registers at the normal sensor rate, so it needs no permission and is nowhere near the 200 Hz threshold that would require `HIGH_SAMPLING_RATE_SENSORS`.

## Rear display: move the app to the outer screen

```typescript
const { rearDisplay } = await Foldable.getDisplayModes();
if (rearDisplay === 'available') await Foldable.startRearDisplay();
await Foldable.stopRearDisplay();
```

Statuses are `active`, `available`, `unavailable` and `unsupported`. The classic use is a selfie with the main camera, previewing on the outer screen. The system asks the user to confirm before the app moves.

The status the `start` methods check comes from a background collector rather than from `getDisplayModes()`, so immediately after launch a positive check can still be rejected. Listen for `displayModeChange` before offering the button, or retry.

## Dual screen: a second window on the other display

```typescript
await Foldable.startDualScreen({ url: 'cover.html' });
await Foldable.stopDualScreen();
```

The URL is loaded in a second web view on the other display, and a relative path resolves against the app's own URL, so the page has to be part of the web build. A `data:` URL is often easier for dynamic content, and is what the plugin's own example app uses.

Treat it as a presentation surface: a plain web view with no Capacitor bridge, so no plugin API inside it. Anything it needs goes in the URL, though the page is served through the app's own local server, so same-origin storage is readable there too. Calling `startDualScreen` again rebuilds the page rather than messaging it.

Both modes share one window area behind the scenes, and both stop when the activity goes away.

Both modes report through `displayModeChange`, and both are Android only. On iOS and web they read `unsupported`, and the `start` methods reject.

Emulators do not offer dual screen at all, and a Z Flip only in Flex mode, so `unsupported` there is the emulator rather than a bug in your app.

## Permissions

None. The plugin's manifest is empty and adds nothing to your app.

## Quality guidelines

Google's adaptive app quality guidelines make posture support a Tier 1 check and adaptive layouts driven by window size classes a Tier 2 one. Keeping controls and text off the fold is separate fold-aware design guidance rather than a quality check: "Don't place UI controls too close to a fold or hinge when `isSeparating` is true." `posture`, `getSizeClass()` and the fold variables are what all three ask for.
