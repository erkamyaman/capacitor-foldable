# Roadmap: iPhone Duo

iPhone Duo support needs the iOS 27.1 SDK, which ships with Xcode 27.1. Planned:

- `getFoldState()` and `window.viewport.segments` from the fold's reserved region.
- `getHingeAngle()` and `hingeAngleChange` from the hinge.
- `activeDisplay` (inner or outer), and `cameraBounds` from the camera reserved regions, on `FoldState`. Android already reports `cameraBounds` from the display cutouts.
- **Bar placement.** On iPhone Duo, native tab bars and toolbars move to the side of the display, but HTML tab bars stay where they are. `getBarPlacement()` will report `{ verticalBarEdge: 'leading' | 'trailing' | null }`, with a `barPlacementChange` event and a `vertical-bars-leading` / `vertical-bars-trailing` class on `<html>`, so your tab bar can move to the side too. It reports `null` on Android.
