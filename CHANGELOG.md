# Changelog

## 7.0.0 (2026-09-19)

The first release, for Capacitor 7.

### Features

- **Fold state:** `getFoldState()` and `foldStateChange` report the posture (`flat`, `tabletop` or `book`), the hinge's position and orientation, whether the fold splits the screen, and front camera areas.
- **Hinge angle:** `getHingeAngle()` and `hingeAngleChange`, in degrees.
- **Size classes:** `getSizeClass()` and `sizeClassChange`, with Apple's compact/regular and Material's window width and height classes.
- **Bar placement:** `getBarPlacement()` and `barPlacementChange` report where iPhone Duo moves tab bars and toolbars, so an HTML tab bar can follow.
- **Android display modes:** `startRearDisplay()` moves the app to the outer display, and `startDualScreen()` shows a second page there.
- **Web standards:** `installFoldablePolyfill()` fills in the Device Posture and Viewport Segments APIs, which Android WebView and Safari don't provide, and mirrors their CSS features as classes and variables on `<html>`.

### Platforms

- **Android:** API 23 and later. Tested on Galaxy Z Flip8, Z Fold8 and Z Fold8 Ultra (Android 17), and on Pixel foldable emulators (Android 16 and 17).
- **iOS:** 14 and later. Size classes work everywhere. Fold state, hinge angle and bar placement work on iPhone Duo when the app is built with Xcode 27.1 or later and runs on iOS 27.1 or later. Capacitor 7 apps can't use this: built with Xcode 27 they crash at launch, because iOS 27 requires the scene lifecycle that only Capacitor 8.5 and later adopt.
- **Web:** reports an unfolded device.

### Beta: iPhone Duo

iPhone Duo support is built against the Xcode 27.1 beta and tested in its iPhone Duo simulator in every pose. It hasn't run on a real iPhone Duo, which ships on October 23, 2026, and Apple can still change the APIs before then.
