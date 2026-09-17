# iPhone Duo

iPhone Duo support is built against the iOS 27.1 APIs and turns on when the app is built with Xcode 27.1 or later and runs on iOS 27.1 or later. Apps built with an older Xcode keep working and report no fold.

- `getFoldState()` and `window.viewport.segments` come from the fold's reserved region.
- `getHingeAngle()` comes from the hinge. The hinge also triggers `foldStateChange`.
- `activeDisplay` (inner or outer) comes from the hinge status, and `cameraBounds` from the camera reserved regions.
- **Bar placement.** On iPhone Duo, native tab bars and toolbars move to the side of the display, but HTML tab bars stay where they are. `getBarPlacement()` reports `{ verticalBarEdge: 'leading' | 'trailing' | null }`, with a `barPlacementChange` event and a `vertical-bars-leading` / `vertical-bars-trailing` class on `<html>`, so your tab bar can move to the side too. It reports `null` on Android.

Still to confirm in the iPhone Duo simulator, which ships with Xcode 27.1: the unit of the hinge angle, whether the hinge reports its status as soon as the app starts, and that the fold's position lines up with the web view.

## Keep bars horizontal

When iPhone Duo moves bars to the side, the status bar turns vertical too, and the system adds a leading or trailing safe-area inset for it. If your app has an HTML tab bar at the bottom and you'd rather keep everything horizontal, opt your app out. A plugin can't change this for your app, so do it in your own view controller:

1. Add `ios/App/App/MainViewController.swift`:

   ```swift
   import Capacitor
   import UIKit

   class MainViewController: CAPBridgeViewController {
       #if canImport(UIKit, _underlyingVersion: 9127.1)
       @available(iOS 27.1, *)
       override var preferredVerticalBarBehavior: UIVerticalBarBehavior {
           .disabled
       }
       #endif
   }
   ```

   The `#if` keeps the file building with Xcode versions older than 27.1.

2. In `ios/App/App/Base.lproj/Main.storyboard`, change the view controller's `customClass="CAPBridgeViewController" customModule="Capacitor"` to `customClass="MainViewController" customModule="App" customModuleProvider="target"`, or set the class to `MainViewController` in Xcode's Identity inspector.

If the choice changes while the app runs, return the new value and call `setNeedsUpdateOfVerticalBarConfiguration()`.

## Test your layout today

The iPhone Duo simulator only arrives with Xcode 27.1, but you can check your layout at its sizes now with a custom device in your browser's responsive mode:

| Display | CSS viewport | Size class |
| --- | --- | --- |
| Outer (folded) | 466 × 678 | compact width, regular height |
| Inner (unfolded) | 890 × 626 in landscape, 626 × 890 in portrait | regular width, regular height |

Both displays are close to a 1:1.42 aspect ratio, so the folded phone is wider than most mobile breakpoints expect, and the unfolded one is closer to a small tablet. The window changes size while the app runs, so listen for `resize` or `sizeClassChange` instead of measuring once at startup.

A tab bar that follows the system:

```css
.vertical-bars-leading .tab-bar {
  inset-block: 0;
  inset-inline-start: 0;
  flex-direction: column;
}
```
