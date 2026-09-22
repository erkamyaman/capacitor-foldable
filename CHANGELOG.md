# Changelog

## 7.0.3 (2026-09-23)

- **Privacy manifest.** The plugin ships a `PrivacyInfo.xcprivacy` declaring no tracking, no collected data and no required-reason APIs, wired into both the Swift package and the podspec, so it shows up in your app's privacy report. No code changes.

## 7.0.2 (2026-09-20)

- More npm keywords, so the plugin turns up in searches for viewport segments, device posture and WindowManager.
- Published from GitHub Actions through npm Trusted Publishing, with provenance. No code changes.

## 7.0.1 (2026-09-19)

- README: screenshots of tabletop and book on Pixel Fold.

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
