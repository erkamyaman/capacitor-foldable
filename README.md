<h1 align="center">Capacitor Foldable</h1>
<p align="center"><strong><code>capacitor-foldable</code></strong></p>
<p align="center">
Fold state, hinge orientation and hinge angle for foldable devices in Capacitor apps.
</p>

```typescript
const { state, hingeOrientation } = await Foldable.getFoldState();
// { state: 'half-opened', hingeOrientation: 'horizontal' }
```

### Versions

| Capacitor | Plugin |
| --------- | ------ |
| v8.x      | v0.0.1 |

### Supported Platforms

| Platform | Status | Minimum |
| -------- | ------ | ------- |
| Android  | Supported | API 24, `compileSdk` 34 |
| iOS      | Size classes only; fold data waits on Apple's iPhone Duo SDK | iOS 15 |
| Web      | Stub, returns `flat` | |

## Do you need this plugin?

Web views already resize with the window, so a responsive layout that pads with every safe-area inset adapts to foldables without a plugin. Use this one when your app needs to know what CSS can't tell it:

- **Where the fold is**, and whether it splits the screen.
- **How the device is held**: flat, tabletop or book.
- **The hinge angle**, for effects and interactions.
- **Outer or inner display**, and Material window size classes.
- **The outer display on Android foldables**: rear display and dual screen.

## Installation

```bash
npm install capacitor-foldable
npx cap sync
```

## Usage

```typescript
import { Foldable } from 'capacitor-foldable';

const { posture } = await Foldable.getFoldState(); // 'flat' | 'tabletop' | 'book'

Foldable.addListener('foldStateChange', ({ posture }) => {
  document.documentElement.dataset.posture = posture;
});
```

More in [Examples](docs/examples.md).

## Web standard APIs

Chrome ships the [Device Posture API](https://developer.mozilla.org/docs/Web/API/Device_Posture_API) and the [Viewport Segments API](https://developer.mozilla.org/docs/Web/API/Viewport_Segments_API), but Android's WebView has both turned off. `installFoldablePolyfill()` fills them in from the native fold state, and mirrors the CSS features as classes and variables on `<html>`:

```typescript
import { installFoldablePolyfill } from 'capacitor-foldable';

await installFoldablePolyfill();

navigator.devicePosture.type; // 'continuous' | 'folded'
window.viewport.segments; // two DOMRects when the fold splits the web view
```

| Standard CSS | With the polyfill |
| --- | --- |
| `@media (device-posture: folded)` | `.device-posture-folded` |
| `@media (horizontal-viewport-segments: 2)` | `.horizontal-viewport-segments-2` |
| `@media (vertical-viewport-segments: 2)` | `.vertical-viewport-segments-2` |
| `env(viewport-segment-width 0 0)` | `var(--viewport-segment-width-0-0)` |

## Guides

- [Examples](docs/examples.md)
- [Layout tips](docs/layout-tips.md)
- [Testing on Android](docs/testing-android.md)
- [Roadmap: iPhone Duo](docs/roadmap-iphone-duo.md)

## API

<docgen-index>

* [`isDeviceFoldable()`](#isdevicefoldable)
* [`getFoldState()`](#getfoldstate)
* [`getHingeAngle()`](#gethingeangle)
* [`getSizeClass()`](#getsizeclass)
* [`getDisplayModes()`](#getdisplaymodes)
* [`startRearDisplay()`](#startreardisplay)
* [`stopRearDisplay()`](#stopreardisplay)
* [`startDualScreen(...)`](#startdualscreen)
* [`stopDualScreen()`](#stopdualscreen)
* [`addListener('foldStateChange', ...)`](#addlistenerfoldstatechange-)
* [`addListener('hingeAngleChange', ...)`](#addlistenerhingeanglechange-)
* [`addListener('sizeClassChange', ...)`](#addlistenersizeclasschange-)
* [`addListener('displayModeChange', ...)`](#addlistenerdisplaymodechange-)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### isDeviceFoldable()

```typescript
isDeviceFoldable() => Promise<{ foldable: boolean; supportsTabletop: boolean; }>
```

Whether the device has a fold at all, and whether it can be propped half
open like a laptop. Both `false` on iOS and web.

**Returns:** <code>Promise&lt;{ foldable: boolean; supportsTabletop: boolean; }&gt;</code>

**Since:** 0.0.1

--------------------


### getFoldState()

```typescript
getFoldState() => Promise<FoldState>
```

Read the current fold state. Resolves to
`{ state: 'flat', isSeparating: false, posture: 'flat' }` when there is no
fold information.

**Returns:** <code>Promise&lt;<a href="#foldstate">FoldState</a>&gt;</code>

**Since:** 0.0.1

--------------------


### getHingeAngle()

```typescript
getHingeAngle() => Promise<{ angle: number | null; }>
```

Read the angle between the two halves of the device, in degrees: `0` when
closed, `180` when flat. Resolves to `{ angle: null }` on devices without a
hinge angle sensor, and always on iOS and web.

**Returns:** <code>Promise&lt;{ angle: number | null; }&gt;</code>

**Since:** 0.0.1

--------------------


### getSizeClass()

```typescript
getSizeClass() => Promise<SizeClass>
```

Read the window's size classes: Apple's compact and regular, the signal its
iPhone Duo guidelines recommend for telling the outer display from the inner
one, and Material's width and height classes. On iOS `horizontal` and
`vertical` are UIKit's size classes; everything else comes from the window
size.

**Returns:** <code>Promise&lt;<a href="#sizeclass">SizeClass</a>&gt;</code>

**Since:** 0.0.1

--------------------


### getDisplayModes()

```typescript
getDisplayModes() => Promise<DisplayModes>
```

Read which of the foldable display modes the device offers right now. Both
are `'unsupported'` on iOS and web.

**Returns:** <code>Promise&lt;<a href="#displaymodes">DisplayModes</a>&gt;</code>

**Since:** 0.0.1

--------------------


### startRearDisplay()

```typescript
startRearDisplay() => Promise<void>
```

Move the app to the outer display. Android asks the user to confirm first,
and the promise resolves once the app has moved. Rejects when rear display
mode is not `'available'`. Only on Android.

**Since:** 0.0.1

--------------------


### stopRearDisplay()

```typescript
stopRearDisplay() => Promise<void>
```

Move the app back to the inner display.

**Since:** 0.0.1

--------------------


### startDualScreen(...)

```typescript
startDualScreen(options: { url: string; }) => Promise<void>
```

Show a page on the outer display while the app stays on the inner one. A
relative `url` resolves against the app's own URL, so `'cover.html'` loads a
page bundled with the app. The page runs in its own web view without access
to Capacitor plugins. Calling this again while dual-screen mode is active
replaces the page. Only on Android.

| Param         | Type                          |
| ------------- | ----------------------------- |
| **`options`** | <code>{ url: string; }</code> |

**Since:** 0.0.1

--------------------


### stopDualScreen()

```typescript
stopDualScreen() => Promise<void>
```

Close the page on the outer display.

**Since:** 0.0.1

--------------------


### addListener('foldStateChange', ...)

```typescript
addListener(eventName: 'foldStateChange', listenerFunc: (state: FoldState) => void) => Promise<PluginListenerHandle>
```

Listen for fold state changes. On a foldable this also fires when the
device rotates, because `hingeOrientation` and `hingeBounds` rotate with
the window.

| Param              | Type                                                                |
| ------------------ | ------------------------------------------------------------------- |
| **`eventName`**    | <code>'foldStateChange'</code>                                      |
| **`listenerFunc`** | <code>(state: <a href="#foldstate">FoldState</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 0.0.1

--------------------


### addListener('hingeAngleChange', ...)

```typescript
addListener(eventName: 'hingeAngleChange', listenerFunc: (event: { angle: number; }) => void) => Promise<PluginListenerHandle>
```

Listen for hinge angle changes. The hinge sensor only runs while at least
one of these listeners is registered. Never fires on iOS and web.

| Param              | Type                                                |
| ------------------ | --------------------------------------------------- |
| **`eventName`**    | <code>'hingeAngleChange'</code>                     |
| **`listenerFunc`** | <code>(event: { angle: number; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 0.0.1

--------------------


### addListener('sizeClassChange', ...)

```typescript
addListener(eventName: 'sizeClassChange', listenerFunc: (sizeClass: SizeClass) => void) => Promise<PluginListenerHandle>
```

Listen for size class changes, such as unfolding the device, rotating it or
resizing the window. On iOS this fires when UIKit's size classes change
(iOS 17 or later) or the device rotates, so a resize that keeps the same
size classes may not update `widthClass` and `heightClass` until then.

| Param              | Type                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| **`eventName`**    | <code>'sizeClassChange'</code>                                          |
| **`listenerFunc`** | <code>(sizeClass: <a href="#sizeclass">SizeClass</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 0.0.1

--------------------


### addListener('displayModeChange', ...)

```typescript
addListener(eventName: 'displayModeChange', listenerFunc: (modes: DisplayModes) => void) => Promise<PluginListenerHandle>
```

Listen for changes to the display modes, including a mode ending because
the user folded or unfolded the device. Never fires on iOS and web.

| Param              | Type                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| **`eventName`**    | <code>'displayModeChange'</code>                                          |
| **`listenerFunc`** | <code>(modes: <a href="#displaymodes">DisplayModes</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 0.0.1

--------------------


### Interfaces


#### FoldState

| Prop                   | Type                                                                    | Description                                                                                                                                                                                                                                                        | Since |
| ---------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| **`state`**            | <code>'flat' \| 'half-opened' \| 'closed'</code>                        | Posture of the fold. `'closed'` is never reported today: a device shut on its cover display reports `'flat'`.                                                                                                                                                      | 0.0.1 |
| **`isSeparating`**     | <code>boolean</code>                                                    | Whether the fold splits the web view into two areas: `true` when half-opened, or when the hinge has a physical gap.                                                                                                                                                | 0.0.1 |
| **`posture`**          | <code>'flat' \| 'tabletop' \| 'book'</code>                             | How the device is held: `'tabletop'` when half-opened with a horizontal hinge, like a laptop, `'book'` when half-opened with a vertical hinge, and `'flat'` otherwise.                                                                                             | 0.0.1 |
| **`hingeOrientation`** | <code>'horizontal' \| 'vertical'</code>                                 | Direction of the hinge relative to the window, so it flips when the device rotates. Omitted when there is no fold.                                                                                                                                                 | 0.0.1 |
| **`hingeBounds`**      | <code>{ x: number; y: number; width: number; height: number; }</code>   | Position of the fold in CSS pixels, relative to the web view. Zero wide (or zero tall) on a seamless fold. Omitted when there is no fold.                                                                                                                          | 0.0.1 |
| **`occludedBounds`**   | <code>{ x: number; y: number; width: number; height: number; }</code>   | Area of the web view the hinge covers, in CSS pixels. Only present on devices with a physical gap.                                                                                                                                                                 | 0.0.1 |
| **`activeDisplay`**    | <code>'inner' \| 'outer'</code>                                         | Which display is showing the app, on a device with an inner and an outer display such as iPhone Duo. Omitted when the platform doesn't report it, which today is always.                                                                                           | 0.0.1 |
| **`cameraBounds`**     | <code>{ x: number; y: number; width: number; height: number; }[]</code> | Areas of the web view covered by a front-facing camera, in CSS pixels. On Android these are the display cutouts. On iPhone Duo they will be the outer camera and the under-display inner camera while in use, once iOS support lands. Omitted when there are none. | 0.0.1 |


#### SizeClass

| Prop              | Type                                                                        | Description                                                                                                                                                                                                         | Since |
| ----------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`horizontal`**  | <code>'compact' \| 'regular'</code>                                         | Width size class of the window: `'compact'` on a phone and on the outer display of a foldable, `'regular'` on the inner display, tablets and wide windows. On Android and web `'regular'` starts at 600 CSS pixels. | 0.0.1 |
| **`vertical`**    | <code>'compact' \| 'regular'</code>                                         | Height size class of the window: `'compact'` on a phone in landscape. On Android and web `'regular'` starts at 480 CSS pixels.                                                                                      | 0.0.1 |
| **`widthClass`**  | <code>'compact' \| 'medium' \| 'expanded' \| 'large' \| 'extraLarge'</code> | Material window width class, from the window width in CSS pixels: `'compact'` below 600, `'medium'` below 840, `'expanded'` below 1200, `'large'` below 1600 and `'extraLarge'` from 1600.                          | 0.0.1 |
| **`heightClass`** | <code>'compact' \| 'medium' \| 'expanded'</code>                            | Material window height class, from the window height in CSS pixels: `'compact'` below 480, `'medium'` below 900 and `'expanded'` from 900.                                                                          | 0.0.1 |


#### DisplayModes

| Prop              | Type                                                            | Description                                                                                                                                       | Since |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`rearDisplay`** | <code><a href="#displaymodestatus">DisplayModeStatus</a></code> | Rear display mode moves the app to the outer display, so people can frame a photo with the rear cameras. Only on Android foldables that offer it. | 0.0.1 |
| **`dualScreen`**  | <code><a href="#displaymodestatus">DisplayModeStatus</a></code> | Dual-screen mode shows a second page on the outer display while the app stays on the inner one. Only on Android foldables that offer it.          | 0.0.1 |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


### Type Aliases


#### DisplayModeStatus

<code>'unsupported' | 'unavailable' | 'available' | 'active'</code>

</docgen-api>
