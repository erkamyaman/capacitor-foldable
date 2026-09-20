# Foldable Examples

The foldable APIs for Capacitor apps, one runnable demo at a time.

Each demo is **one file** in [`src/demos`](src/demos), starts with a comment explaining the API it shows, and runs on a real foldable, an Android foldable emulator or the iPhone Duo simulator.

The app itself uses the plugin too. Open it on a device with a vertical fold and it becomes two pages: the list on the left screen, the demo on the right, with the crease as the gutter. The split comes from `--fold-left` and `--fold-width`, so it lands on the fold rather than on a guessed halfway point. Demos that need the whole device take both pages. Folded shut, or on a phone with no fold, it is one column with a link back to the list.

## Run it

```bash
npm install
npm run build
npx cap sync
npx cap run ios      # or: npx cap run android
```

On iOS, pick the **iPhone Duo** simulator (Xcode 27.1 or later) and fold the device in DeviceHub. On Android, use a foldable emulator and fold it from the extended controls.

## Demos

| Demo | What it shows |
| --- | --- |
| **Hinge angle** | `getHingeAngle()`, `hingeAngleChange` and the system's hinge status, drawn as a live graph. |
| **Reserved regions** | `getReservedRegions()`: the fold, the cameras and the system bar area, outlined on the page, active and inactive. |
| **Avoid the crease** | A two-page reader laid out with `--fold-left` and `--fold-width`, so text never lands on the fold. |
| **Tabletop and book** | `posture` and `hingeBounds`: controls below the crease in tabletop, beside it in book. |
| **Even columns** | The fold is reported even when the phone is flat, so a grid can put its gutter on the crease. |
| **Vertical bars** | `getBarPlacement()` moves an HTML tab bar to the side like iPhone Duo does, and `setVerticalBarBehavior()` turns that off. |
| **Folding events** | `foldingChange` pauses an animation while the hinge moves. |
| **Size classes** | `getSizeClass()` tells the small outer display from the big inner one, the way Apple recommends. |

## Notes

- The vertical bar opt-out needs `FoldableBridgeViewController`, which this app already uses in `ios/App/App/SceneDelegate.swift`. Without it the button says so.
- Everything else works on Android and iOS alike. Demos that need hardware the device does not have say so rather than failing.
- For the plain, single-screen demo with every value at once, see [`example-app`](../example-app).
