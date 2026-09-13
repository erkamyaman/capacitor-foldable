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
| iOS      | Not yet, waiting on Apple's iPhone Duo SDK | iOS 15 |
| Web      | Stub, returns `flat` | |

## Installation

```bash
npm install capacitor-foldable
npx cap sync
```

## Usage

```typescript
import { Foldable } from 'capacitor-foldable';

const { foldable } = await Foldable.isDeviceFoldable();

if (foldable) {
  Foldable.addListener('foldStateChange', ({ state, hingeOrientation }) => {
    // update your layout
  });
}
```

## Examples

Tabletop (video on top, controls below):
```typescript
const { state, hingeOrientation } = await Foldable.getFoldState();
const tabletop = state === 'half-opened' && hingeOrientation === 'horizontal';
```

Book (list on the left, detail on the right):
```typescript
const book = state === 'half-opened' && hingeOrientation === 'vertical';
```

Keep content out of the hinge:
```typescript
if (occludedBounds) {
  el.style.marginTop = `${occludedBounds.y + occludedBounds.height}px`;
}
```

Hinge angle (`180` when flat, `null` without a hinge sensor):
```typescript
const { angle } = await Foldable.getHingeAngle();

Foldable.addListener('hingeAngleChange', ({ angle }) => {
  lid.style.transform = `rotateX(${180 - angle}deg)`;
});
```

## Web standard APIs

Chrome ships the [Device Posture API](https://developer.mozilla.org/docs/Web/API/Device_Posture_API) and the [Viewport Segments API](https://developer.mozilla.org/docs/Web/API/Viewport_Segments_API), but Android's WebView has both turned off, so they are missing inside Capacitor apps. `installFoldablePolyfill()` fills them in from the native fold state, so you can write the same code that runs in Chrome:

```typescript
import { installFoldablePolyfill } from 'capacitor-foldable';

await installFoldablePolyfill();

navigator.devicePosture.type; // 'continuous' | 'folded'
navigator.devicePosture.addEventListener('change', updateLayout);

window.viewport.segments; // DOMRect[], two entries when the fold splits the web view
```

It runs in native apps only, and it leaves native implementations alone, so it steps aside once a web view enables the APIs. On iOS it reports an unfolded device until iPhone Duo support lands.

> [!NOTE]
> Only the JavaScript APIs are filled in. CSS `@media (device-posture)`, `@media (horizontal-viewport-segments)`, `@media (vertical-viewport-segments)` and `env(viewport-segment-*)` can't be polyfilled.

> [!NOTE]
> `window.viewport.segments` has no change event of its own. Read it again on the `devicePosture` `change` event and on `resize`.

> [!NOTE]
> `hingeOrientation` and `hingeBounds` rotate with the window, so on a foldable `foldStateChange` also fires when the device rotates.

> [!NOTE]
> A foldable shut on its cover display reports `flat`, same as a regular phone. Use `isDeviceFoldable()` to tell them apart.

## Layout tips

These follow Apple's [Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo) guidelines and apply to Android foldables too.

- **Pad with every safe-area inset, not only the top one.** On iPhone Duo the status bar and toolbars move to the side of the display:
  ```css
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  ```
- **Keep buttons and other interactive elements off the fold** while `isSeparating` is `true`. Scrolling content can cross it.
- **Prefer an even number of grid columns**, so content divides cleanly at the fold.
- **Make small adjustments as the device folds** instead of rearranging the whole layout.

## Roadmap: iPhone Duo

iPhone Duo support needs the iOS 27.1 SDK, which ships with Xcode 27.1. Planned:

- `getFoldState()` and `window.viewport.segments` from the fold's reserved region.
- `getHingeAngle()` and `hingeAngleChange` from the hinge.
- **Bar placement.** On iPhone Duo, native tab bars and toolbars move to the side of the display, but HTML tab bars stay where they are. `getBarPlacement()` will report `{ verticalBarEdge: 'leading' | 'trailing' | null }`, with a `barPlacementChange` event and a `vertical-bars-leading` / `vertical-bars-trailing` class on `<html>`, so your tab bar can move to the side too. It reports `null` on Android.

## API

<docgen-index>

* [`isDeviceFoldable()`](#isdevicefoldable)
* [`getFoldState()`](#getfoldstate)
* [`getHingeAngle()`](#gethingeangle)
* [`addListener('foldStateChange', ...)`](#addlistenerfoldstatechange-)
* [`addListener('hingeAngleChange', ...)`](#addlistenerhingeanglechange-)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### isDeviceFoldable()

```typescript
isDeviceFoldable() => Promise<{ foldable: boolean; }>
```

Whether the device has a fold at all. Always `false` on iOS and web.

**Returns:** <code>Promise&lt;{ foldable: boolean; }&gt;</code>

**Since:** 0.0.1

--------------------


### getFoldState()

```typescript
getFoldState() => Promise<FoldState>
```

Read the current fold state. Resolves to `{ state: 'flat', isSeparating: false }`
when there is no fold information.

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


### Interfaces


#### FoldState

| Prop                   | Type                                                                  | Description                                                                                                                               | Since |
| ---------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`state`**            | <code>'flat' \| 'half-opened' \| 'closed'</code>                      | Posture of the fold. `'closed'` is never reported today: a device shut on its cover display reports `'flat'`.                             | 0.0.1 |
| **`isSeparating`**     | <code>boolean</code>                                                  | Whether the fold splits the web view into two areas: `true` when half-opened, or when the hinge has a physical gap.                       | 0.0.1 |
| **`hingeOrientation`** | <code>'horizontal' \| 'vertical'</code>                               | Direction of the hinge relative to the window, so it flips when the device rotates. Omitted when there is no fold.                        | 0.0.1 |
| **`hingeBounds`**      | <code>{ x: number; y: number; width: number; height: number; }</code> | Position of the fold in CSS pixels, relative to the web view. Zero wide (or zero tall) on a seamless fold. Omitted when there is no fold. | 0.0.1 |
| **`occludedBounds`**   | <code>{ x: number; y: number; width: number; height: number; }</code> | Area of the web view the hinge covers, in CSS pixels. Only present on devices with a physical gap.                                        | 0.0.1 |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

</docgen-api>
