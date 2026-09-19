# Changelog

## 8.0.3 (2026-09-19)

- README: Ionic tabs before and after screenshots, and a Sponsor badge. No code changes.

## 8.0.2 (2026-09-19)

- **Ionic tabs on iPhone Duo:** `ionic-tabs.css` turns `ion-tabs` into a floating pill on the side, where native tab bars go, and moves it above the camera when needed. It only applies where iPhone Duo puts bars on the side. `ionic-tabs-ios26.css` optionally gives the horizontal bar iOS 26's floating style on every iPhone.
- **`installFoldablePolyfill({ ionicKeyboard: true })`** stops Ionic's tab bar from disappearing on iPhone Duo, which sends a keyboard event on every fold. Off by default.
- The polyfill sets `--vertical-tab-bar-bottom` on `<html>`.
- More npm keywords.

## 8.0.1 (2026-09-19)

- README: screenshots of iPhone Duo closed, in book and fully open, and of Pixel Fold in tabletop and book.

## 8.0.0 (2026-09-19)

The first release for Capacitor 8. It has the same features as 7.0.0. iPhone Duo support needs Capacitor 8.5 or later, which adopts the scene lifecycle iOS 27 requires.

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
