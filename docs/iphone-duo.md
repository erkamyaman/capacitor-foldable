# iPhone Duo

iPhone Duo support uses the iOS 27.1 APIs. It turns on when the app is built with Xcode 27.1 or later and runs on iOS 27.1 or later. Apps built with an older Xcode keep working and report no fold.

- `getFoldState()` and `window.viewport.segments` come from the fold's reserved region. The fold is a 40-point band in the middle of the inner display: split around it while half-open, one segment while fully open.
- Half-open and fully open follow the hinge status, so `foldStateChange` fires as soon as the hinge moves.
- `getHingeAngle()` and `hingeAngleChange` come from the hinge. UIKit reports the angle in radians, and the plugin converts it to degrees to match Android: 0 closed, 180 fully open.
- `activeDisplay` (inner or outer) comes from the hinge status, and `cameraBounds` from the camera reserved regions.
- **Bar placement.** On iPhone Duo, native tab bars and toolbars move to the side of the display, but HTML tab bars stay where they are. `getBarPlacement()` reports `{ verticalBarEdge: 'leading' | 'trailing' | null }`, with a `barPlacementChange` event and a `vertical-bars-leading` / `vertical-bars-trailing` class on `<html>`, so your tab bar can move to the side too. It reports `null` on Android.

## What the plugin reports

Measured in the iPhone Duo simulator from Xcode 27.1 beta:

| Pose | `state` · `posture` | Window | Size class | Hinge | Bars |
| --- | --- | --- | --- | --- | --- |
| Closed | flat · flat, outer display | 466 × 678 (678 × 466 sideways) | compact width | 0° | vertical, on the side away from the camera |
| Fully open | flat · flat | 951 × 669 (669 × 951 upright) | regular | 180° | vertical in landscape, horizontal upright |
| Half-open, held sideways | half-opened · book | 951 × 669, split 456 \| 455 | regular | about 128° | vertical |
| Half-open, held upright | half-opened · tabletop | 669 × 951, split 456 over 455 | regular | about 128° | horizontal |

## How much of the screen your app gets

iPhone Duo treats an app by the SDK it was built with: apps older than iOS 27 run in a compatibility mode inside a black border, apps built with iOS 27.0 fill more of the inner display but still leave gaps, and apps built with the iOS 27.1 SDK get the whole display. So `npx cap sync ios` with Xcode 27.1 matters as much as the code in this plugin.

Apple also requires every app and game uploaded to App Store Connect from [April 2027](https://developer.apple.com/news/?id=k1mtkt1k) to be built with the iOS 27 SDK or later, so every app meets the second tier by then whether or not it adapts to the fold.

## Keep bars horizontal

When iPhone Duo moves bars to the side, the status bar turns vertical too, and the system adds a leading or trailing safe-area inset for it. If your app has an HTML tab bar at the bottom and you'd rather keep everything horizontal, opt your app out. A plugin can't change this for your app, so do it in your own view controller:

1. Add `ios/App/App/MainViewController.swift`:

   ```swift
   import Capacitor
   import UIKit

   class MainViewController: CAPBridgeViewController {
       #if canImport(UIKit, _underlyingVersion: 9127.0.85)
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

A tab bar that follows the system instead:

```css
.vertical-bars-leading .tab-bar {
  inset-block: 0;
  inset-inline-start: 0;
  flex-direction: column;
}
```

## Test on the iPhone Duo simulator

1. Install Xcode 27.1 or later, then open **Settings → Components** and download the **iOS 27.1** simulator. The iOS 27.2 beta simulator doesn't run iPhone Duo.
2. Build your app with that Xcode and run it on an **iPhone Duo** simulator.
3. Xcode 27 replaces the Simulator app with **DeviceHub**. Its controls open, close, half-fold and rotate the phone.
4. The phone starts closed, so the app appears on the outer display. From a terminal, `xcrun simctl io <device> screenshot --display=1` captures the outer display and `--display=3` the inner one.

Without the simulator, a browser's responsive mode at the outer display's 466 × 678 and the inner display's 951 × 669 gets you most of the way. Apple's published inner display size, 626 × 890, is smaller than what the simulator reports, so check both.
