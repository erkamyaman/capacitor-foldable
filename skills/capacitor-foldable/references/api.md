# The API, and when each part is the right tool

Every **read** method resolves safely on any device, foldable or not. `startRearDisplay()` and `startDualScreen()` reject when the mode is not available; the `stop` methods always resolve.

Platform note up front: `hingeMargins`, `activeDisplay` and the hinge `status` are iOS only; `occludedBounds` is Android only. `cameraBounds` is reported on both, and on iOS it carries every active occlusion, which includes the vertical status bar strip as well as the camera.

Import both the plugin and the polyfill from the package root:

```typescript
import { Foldable, installFoldablePolyfill } from '@erkamyaman/capacitor-foldable';
```

## Ask once

```typescript
const { foldable, supportsTabletop } = await Foldable.isDeviceFoldable();
```

`supportsTabletop` is a real check on Android (the system advertises the posture). On iOS it mirrors `foldable`, so it is not an independent signal there.

Do not gate layout on this: an Android foldable that advertises no tabletop posture and has no hinge sensor answers `false` while still reporting a fold. For "is there a fold on this screen", test for `hingeBounds`, remembering a closed device has none. For the outer screen on Android, gate on `getDisplayModes()` instead.

## The fold

```typescript
const fold = await Foldable.getFoldState();
// state: 'flat' | 'half-opened' | 'closed'   ('closed' is never emitted today)
// posture: 'flat' | 'tabletop' | 'book'
// isSeparating, hingeOrientation, hingeBounds
// cameraBounds                (both: cutouts on Android, active occlusions on iOS)
// occludedBounds              (Android only, when the fold fully occludes content)
// hingeMargins, activeDisplay (iOS only)
```

Use `posture` for layout decisions rather than the raw angle. On iOS it is a threshold on the angle at 20 and 160 degrees with no hysteresis, so avoid designs that flip hard exactly at the boundary; on Android it comes straight from WindowManager's own fold state.

`activeDisplay` tells the outer display from the inner one, but only on iOS. On Android use `getSizeClass()` for the same job.

Listen with `foldStateChange` rather than polling. On Android the very first call can time out after a second and answer `flat`, so treat the first event as the real answer rather than a boot-time read.

## The hinge angle

```typescript
const { angle, status } = await Foldable.getHingeAngle();
// angle: degrees, 0 shut and 180 flat, or null without a hinge sensor
// status: 'closed' | 'partiallyOpen' | 'fullyOpen' | null   (iOS only)
```

`hingeAngleChange` fires as it moves, carrying the angle alone: call `getHingeAngle()` if you also need the status. On iOS the system's `status` updates lazily and can disagree with the angle; the plugin trusts the angle, and returns both so you can see it. Android reports no status at all.

Good for effects and continuous interactions, not for deciding layout.

## Reserved regions (iOS 27.1)

```typescript
const { regions } = await Foldable.getReservedRegions();
// kind: 'division' | 'occlusion', isActive, x/y/width/height, margins
```

Everything the system reserves on the current display: the fold, the camera, and the strip the vertical status bar occupies. Inactive regions are included, which is how the fold is reported while the device is open flat. Returns `[]` on Android, on web, and on iOS before 27.1.

These coordinates come from the view controller's view, while `hingeBounds` is measured against the web view, so do not mix the two if your web view is inset.

## Size classes

```typescript
const { horizontal, vertical, widthClass, heightClass } = await Foldable.getSizeClass();
```

Apple's compact and regular plus Material's window classes. On iOS the first pair are real UIKit traits; on Android and web they are breakpoints on the window size. Either way it is the portable way to tell a small screen from a large one, rather than measuring pixels yourself. `sizeClassChange` fires when it changes.

## Where the system put its bars

```typescript
const { verticalBarEdge } = await Foldable.getBarPlacement(); // 'leading' | 'trailing' | null
```

`null` means no vertical bar edge is reported: bars are horizontal, or the platform cannot say, which is always the case on Android, web and iOS before 27.1. On iPhone Duo the bar also arrives as a safe-area inset, so simple layouts need nothing beyond `env(safe-area-inset-*)`. Use this when positioning your own chrome to match. `barPlacementChange` fires when it moves.

```typescript
await Foldable.setVerticalBarBehavior({ behavior: 'disabled' });  // everything horizontal
await Foldable.setVerticalBarBehavior({ behavior: 'automatic' }); // system default
```

Needs `FoldableBridgeViewController`, and resolves `{ applied: false }` when that is missing, on Android, and on web. On iOS any other string rejects, while a missing one falls back to `automatic`; Android and web resolve without validating. Apple asks you not to override bar placement, so keep this for immersive interfaces.

## While the hinge moves

```typescript
await Foldable.addListener('foldingChange', ({ folding }) => { /* pause heavy work */ });
```

Only fires where a hinge angle is available: an Android foldable with a hinge sensor, or iPhone Duo on iOS 27.1.

## Android display modes

```typescript
const { rearDisplay, dualScreen } = await Foldable.getDisplayModes();
// each: 'active' | 'available' | 'unavailable' | 'unsupported'

if (rearDisplay === 'available') await Foldable.startRearDisplay();
if (dualScreen === 'available') await Foldable.startDualScreen({ url: 'cover.html' });

await Foldable.stopRearDisplay();
await Foldable.stopDualScreen();
```

`startRearDisplay()` shows a system confirmation first, and `startDualScreen()` rejects outright without a `url`. Both accept `available` or `active`.

`displayModeChange` reports both modes together. Relative URLs resolve against the app's own URL, so `cover.html` has to be a page you ship in the web build, which for a bundler means adding it as an extra entry point. A `data:` URL works too, and is the easier route for dynamic content. That page runs in its own web view with no access to Capacitor plugins, and calling `startDualScreen` again replaces it.

Android only; both read as `unsupported` on iOS and web, where the `start` methods reject. See [android.md](android.md).
