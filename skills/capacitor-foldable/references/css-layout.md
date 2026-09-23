# Laying out around the crease

After `installFoldablePolyfill()` on a native platform, the plugin keeps these on `<html>`.

| | |
| --- | --- |
| Direction, while a fold is reported | `.fold-vertical` (crease runs down the screen), `.fold-horizontal` (across) |
| Position and size of the fold band | `var(--fold-left)`, `var(--fold-top)`, `var(--fold-width)`, `var(--fold-height)` |
| How much of the band is margin (iOS only) | `var(--fold-margin-top)`, `--fold-margin-right`, `--fold-margin-bottom`, `--fold-margin-left` |
| While the hinge moves | `.folding` |
| Where native bars went | `.vertical-bars-leading`, `.vertical-bars-trailing`, `var(--vertical-tab-bar-bottom)` |
| Standard APIs, polyfilled | `.horizontal-viewport-segments-2`, `.vertical-viewport-segments-2`, `.device-posture-folded`, `.device-posture-continuous`, `var(--viewport-segment-*)` |

Three things to know before using them:

- **They are viewport coordinates**, measured against the web view. A grid built from `--fold-left` only lines up if the element's own content box starts at viewport 0. Subtract your own insets otherwise, as the examples app does.
- **`--fold-width` can be `0px`.** A seamless fold, the kind with no physical gap, reports zero thickness whatever the state, and `--fold-margin-*` is iOS only and reads `0px` on Android. Keep your own minimum gutter, `max(12px, var(--fold-width, 0px))`, rather than relying on the band for visual separation. The fallback matters: on a phone with no fold the variable does not exist, and a bare `var()` with no fallback makes the whole declaration invalid.
- **`.fold-horizontal` means the hinge is horizontal, not that the device is in tabletop.** It is set while flat too. The tabletop and book postures have no class of their own: read `posture` from `getFoldState()`. (The `.device-posture-*` classes in the table are the Device Posture API's folded and continuous, which is a different thing.)

What is conditional: the `--fold-*` variables, `.fold-*`, `.vertical-bars-*`, `.folding` and the `-viewport-segments-2` classes. What is always set once installed: a `device-posture` class (`continuous` unless half opened), the first segment's `--viewport-segment-*-0-0` variables, and `--vertical-tab-bar-bottom`.

For safe areas, write `var(--safe-area-inset-top, env(safe-area-inset-top))`. Capacitor injects those variables on **Android** from 8.3 with `insetsHandling: 'css'`, where `env()` is unreliable before WebView 140; on iOS nothing sets them and the `env()` fallback is what resolves.

## Two pages, one either side

```css
.reader { display: grid; gap: 12px; }

.fold-vertical .reader {
  position: fixed;
  inset: auto 0 0 0;
  top: calc(var(--safe-area-inset-top, env(safe-area-inset-top)) + 56px);
  display: block;
  border: 0;
}

.fold-vertical .reader .page {
  position: absolute;
  top: 0;
  bottom: 0;
  padding: 14px;
  box-sizing: border-box;
  overflow: auto;
}

.fold-vertical .reader .page:first-child { left: 0; width: var(--fold-left); }
.fold-vertical .reader .page:last-child { left: calc(var(--fold-left) + var(--fold-width)); right: 0; }
```

`position: fixed` with `inset` is what makes the viewport coordinates line up, and `top`/`bottom` on the pages is what makes them fill the container. Keep a border off the container: unlike padding, a border shrinks the containing block and shifts both pages off the fold. The pages carry their own padding, with `box-sizing: border-box` so it eats into the width instead of overflowing the crease.

## A grid whose gutter is the crease

Give the crease its own column, so the normal gutter survives when `--fold-width` is zero, and pin the tiles to the columns either side. Do not rely on a `::before` to reserve the crease column: with no explicit rows, `grid-row: 1 / -1` spans row 1 only, and auto-placement drops tiles into the crease from row 2 down.

```css
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

.fold-vertical .grid {
  --grid-inset: 16px; /* viewport left edge to this element's content box */
  grid-template-columns: calc(var(--fold-left) - var(--grid-inset)) var(--fold-width) 1fr;
  column-gap: 0;
}

.fold-vertical .grid > *:nth-child(odd) { grid-column: 1; }
.fold-vertical .grid > *:nth-child(even) { grid-column: 3; }
.fold-vertical .grid > * { margin: 0 8px; }
```

The crease is always the middle track, so the pinning selectors have to skip it. `nth-child(odd)` and `nth-child(even)` is the two column special case; with four columns the tracks become

```css
.fold-vertical .grid {
  grid-template-columns:
    repeat(2, calc((var(--fold-left) - var(--grid-inset)) / 2))
    var(--fold-width)
    repeat(2, 1fr);
}

.fold-vertical .grid > *:nth-child(4n + 1) { grid-column: 1; }
.fold-vertical .grid > *:nth-child(4n + 2) { grid-column: 2; }
.fold-vertical .grid > *:nth-child(4n + 3) { grid-column: 4; }
.fold-vertical .grid > *:nth-child(4n) { grid-column: 5; }
```

Apple asks for an even number of columns so content divides cleanly. Either way the tracks left of the crease must add up to `--fold-left` minus your inset, so use explicit widths there rather than `1fr`.

## Controls below the crease in tabletop

Tabletop is a posture, so it comes from JavaScript. Set a class yourself and let CSS follow:

```typescript
const apply = ({ posture }: { posture: string }) =>
  document.documentElement.classList.toggle('tabletop', posture === 'tabletop');

apply(await Foldable.getFoldState());
const handle = await Foldable.addListener('foldStateChange', apply);
// later: await handle.remove();
```

```css
.tabletop .stage {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-rows: var(--fold-top) 1fr;
  row-gap: max(12px, var(--fold-height));
}
```

`position: fixed; inset: 0` matters here too: `--fold-top` is measured from the top of the viewport, and a `.stage` sitting under a header is not.

## Pause work while the hinge moves

```css
.folding .spinner { animation-play-state: paused; }
```

`animation-play-state` is not inherited and only affects elements that carry a CSS animation, so put it on the animated element itself. For a chart or anything driven by JavaScript, listen to `foldingChange` and stop redrawing instead. The class appears as the hinge starts moving and goes half a second after it stops, and only on devices that report a hinge angle: an Android foldable without a hinge sensor never gets it.

## Accessibility

The crease is exactly where reading order and target sizes go wrong, so four rules:

- **Keep source order equal to visual order.** The `nth-child` pinning above works only while it is. Re-order the markup rather than moving things visually, or a screen reader reads the pages in the wrong sequence.
- **Name each page and let the keyboard reach it.** Both panes scroll independently, so give them `role="region"` with an `aria-label`, and `tabindex="0"` on the scroll container.
- **Use `rem` for your own gutters and insets**, not pixels. Android scales web view text with the system font size while iOS does not unless you opt in, so fixed pixel padding drifts in one direction and never moves in the other. Grid items pinned to a fixed track also need `min-width: 0`, or long words push them into the crease.
- **Targets stay at least 44 pt, or 48 dp on Android**, which matters most for anything sitting beside the fold.

`prefers-reduced-motion` is a separate concern from `.folding`: the class is a device signal that comes and goes with the hinge, so honour the media query independently, and use `animation: none` there rather than pausing on an arbitrary frame.

Right to left needs its own arm, because the fold variables are physical viewport coordinates while `:first-child` is not:

```css
[dir='rtl'] .fold-vertical .reader .page:first-child { left: calc(var(--fold-left) + var(--fold-width)); right: 0; width: auto; }
[dir='rtl'] .fold-vertical .reader .page:last-child { left: 0; width: var(--fold-left); }
```

## What not to do

- Splitting at `50%`. The coordinates are relative to the web view, and on iPhone Duo the band has width.
- Relying on `--fold-width` for visual separation. It is `0px` on a seamless fold.
- Treating `.fold-horizontal` as tabletop, or writing a separate layout per posture. Let one layout expand, and move only what must move.
- Styling only `.fold-vertical`. iPhone Duo's crease is vertical in landscape and horizontal in portrait, so both need an arm or the layout flattens when the phone turns.
- Building layout on the polyfilled `--viewport-segment-*` variables. They only describe two segments while the fold actually separates the window, so an open-flat device gives you one segment; the `--fold-*` variables are there either way.
