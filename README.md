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

It only runs on Android, and it leaves native implementations alone, so it steps aside once WebView enables the APIs.

> [!NOTE]
> Only the JavaScript APIs are filled in. CSS `@media (device-posture)`, `@media (horizontal-viewport-segments)`, `@media (vertical-viewport-segments)` and `env(viewport-segment-*)` can't be polyfilled.

> [!NOTE]
> `window.viewport.segments` has no change event of its own. Read it again on the `devicePosture` `change` event and on `resize`.

> [!NOTE]
> `hingeOrientation` and `hingeBounds` rotate with the window, so on a foldable `foldStateChange` also fires when the device rotates.

> [!NOTE]
> A foldable shut on its cover display reports `flat`, same as a regular phone. Use `isDeviceFoldable()` to tell them apart.

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
