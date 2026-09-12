<h1 align="center">Capacitor Foldable</h1>
<p align="center"><strong><code>capacitor-foldable</code></strong></p>
<p align="center">
Fold state and hinge orientation for foldable devices in Capacitor apps.
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

> [!NOTE]
> `hingeOrientation` flips when the device rotates, and `foldStateChange` does not fire on rotation. Call `getFoldState()` again from a `screen.orientation` change listener.

> [!NOTE]
> A foldable shut on its cover display reports `flat`, same as a regular phone. Use `isDeviceFoldable()` to tell them apart.

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

Whether the device has a fold at all. Always `false` on iOS and web.

**Returns:** <code>Promise&lt;{ foldable: boolean; }&gt;</code>

**Since:** 0.0.1

--------------------


### getFoldState()

```typescript
getFoldState() => Promise<FoldState>
```

Read the current fold state. Resolves to `{ state: 'flat' }` when there is
no fold information.

**Returns:** <code>Promise&lt;<a href="#foldstate">FoldState</a>&gt;</code>

**Since:** 0.0.1

--------------------


### addListener('foldStateChange', ...)

```typescript
addListener(eventName: 'foldStateChange', listenerFunc: (state: FoldState) => void) => Promise<PluginListenerHandle>
```

Listen for fold state changes. Does not fire on rotation.

| Param              | Type                                                                |
| ------------------ | ------------------------------------------------------------------- |
| **`eventName`**    | <code>'foldStateChange'</code>                                      |
| **`listenerFunc`** | <code>(state: <a href="#foldstate">FoldState</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 0.0.1

--------------------


### Interfaces


#### FoldState

| Prop                   | Type                                                                  | Description                                                                                                        | Since |
| ---------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----- |
| **`state`**            | <code>'flat' \| 'half-opened' \| 'closed'</code>                      | Posture of the fold. `'closed'` is never reported today: a device shut on its cover display reports `'flat'`.      | 0.0.1 |
| **`hingeOrientation`** | <code>'horizontal' \| 'vertical'</code>                               | Direction of the hinge relative to the window, so it flips when the device rotates. Omitted when there is no fold. | 0.0.1 |
| **`occludedBounds`**   | <code>{ x: number; y: number; width: number; height: number; }</code> | Area of the window the hinge covers, in CSS pixels. Only present on devices with a physical gap.                   | 0.0.1 |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

</docgen-api>
