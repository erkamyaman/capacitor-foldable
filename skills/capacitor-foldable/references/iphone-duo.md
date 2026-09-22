# iPhone Duo

Needs iOS 27.1 and Xcode 27.1 or later. Older versions compile and simply report no fold.

## Measured geometry

Inner display 951 x 669 points in landscape, outer 466 x 678. The fold arrives in JavaScript as `hingeBounds` of x 456, width 40, and a separate `hingeMargins` of 20 points left and right. Those margins are *inside* the band rather than extra to it, so the crease itself is the zero width centre and the whole 40 points is the keep-clear area.

UIKit reports the region on a half point, and the plugin rounds to whole CSS pixels.

## The fold is inactive when flat

A fully open iPhone Duo still has a fold, but the system marks that region inactive. The plugin always asks for inactive regions, which is why `--fold-left` is set whether the device is open flat or half folded. Below 20 degrees the plugin drops the fold, so a closed device reports no `hingeBounds` and no `--fold-*` on the outer display, even though `getReservedRegions()` still lists the region.

Writing native code beside the plugin, the same call needs it spelled out:

```swift
if #available(iOS 27.1, *) {
    let regions = view.reservedRegions(kind: .division, options: .includeInactive)
}
```

## The hinge status lags the angle

Apple's header suggests preferring `status` when you only need open, closed or partly open. In practice it updates lazily, so the two disagree while the device moves, which is this plugin's own observation rather than documented behaviour. The plugin decides the fold state from the angle whenever a fold region exists, falling back to the status otherwise, and `getHingeAngle()` returns both so you can see the disagreement yourself.

## Vertical bars and safe areas

The system moves bars to the side, and the web view's safe areas follow. Measured on the simulator: with bars on the side, the strip arrives as `env(safe-area-inset-right)` of 84 points on both displays. Calling `setVerticalBarBehavior({ behavior: 'disabled' })` moves it to `env(safe-area-inset-top)` of 82 and drops the right inset to zero, live and without a reload.

So for most layouts, padding with the safe-area insets is enough, and `getBarPlacement()` is for when you are positioning your own chrome to match the system's.

The opt-out needs the plugin's view controller in `ios/App/App/SceneDelegate.swift`:

```swift
import Capacitor
import FoldablePlugin

window?.rootViewController = FoldableBridgeViewController()
```

`FoldablePlugin` is the module name for a Swift Package install, which is what `npx cap add ios` sets up for a new Capacitor 8 app. On a CocoaPods install the module is `ErkamyamanCapacitorFoldable`. Older apps that build the controller in `Main.storyboard` set the class there instead.

## The web view pauses between displays

When the app moves between the outer and inner display, the web view stops running: timers freeze and events queued during the fold arrive late. That is this project's own observation from the simulator rather than documented behaviour, but it is consistent and worth designing around. If your app reads the hinge continuously, refresh state on `visibilitychange`, `focus` and `resize` after a fold, and keep a slow poll as a safety net.

The window can also report its previous size for a moment after a fold. The polyfill already measures again on the next frame and once more shortly after, so CSS variables settle by themselves.

## What crosses the crease

Keep interactive and readable content out of the fold band; continuous visual content such as a photo, a map or a drawing canvas can cross it, and so can scrolling content.

Apple's own fold guidance is to prefer a layout container that adapts by itself, to "prefer an even number of columns so content divides cleanly" in a grid, to "use the `ReservedRegion` API to keep important elements clear of the center if the system doesn't move them automatically", and to favour small adjustments over rearrangement as the device folds.
