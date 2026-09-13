# Examples

Tabletop (video on top, controls below) or book (list on the left, detail on the right):
```typescript
const { posture } = await Foldable.getFoldState(); // 'flat' | 'tabletop' | 'book'
```

Keep content out of the hinge:
```typescript
if (occludedBounds) {
  el.style.marginTop = `${occludedBounds.y + occludedBounds.height}px`;
}
```

Outer or inner display, the way Apple's iPhone Duo guidelines recommend telling them apart:
```typescript
const { horizontal } = await Foldable.getSizeClass(); // 'compact' on the outer display, 'regular' on the inner one
```

Material window size classes, for navigation that changes from a bottom bar to a rail to a drawer:
```typescript
const { widthClass } = await Foldable.getSizeClass(); // 'compact' | 'medium' | 'expanded' | 'large' | 'extraLarge'
```

Show something on the outer display of an Android foldable while the app stays on the inner one:
```typescript
const { dualScreen } = await Foldable.getDisplayModes();

if (dualScreen === 'available') {
  await Foldable.startDualScreen({ url: 'cover.html' });
}
```

Or move the whole app to the outer display, for selfies with the rear cameras, with `startRearDisplay()`.

Hinge angle (`180` when flat, `null` without a hinge sensor):
```typescript
const { angle } = await Foldable.getHingeAngle();

Foldable.addListener('hingeAngleChange', ({ angle }) => {
  lid.style.transform = `rotateX(${180 - angle}deg)`;
});
```

## CSS with the polyfill

Every `env(viewport-segment-*)` value (`top`, `left`, `bottom`, `right`, `width` and `height`) has a matching variable. A book layout that keeps content off a vertical fold:

```css
.horizontal-viewport-segments-2 .layout {
  display: grid;
  grid-template-columns:
    var(--viewport-segment-width-0-0)
    calc(var(--viewport-segment-left-1-0) - var(--viewport-segment-right-0-0))
    var(--viewport-segment-width-1-0);
}
```

The JavaScript APIs step aside once a web view enables them natively. On iOS the polyfill reports an unfolded device until iPhone Duo support lands.

## Good to know

- `window.viewport.segments` has no change event of its own. Read it again on the `devicePosture` `change` event and on `resize`.
- `hingeOrientation` and `hingeBounds` rotate with the window, so on a foldable `foldStateChange` also fires when the device rotates.
- A foldable shut on its cover display reports `flat`, same as a regular phone. Use `isDeviceFoldable()` to tell them apart.
