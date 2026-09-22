# Changelog

## 8.3.0 (2026-09-23)

- **Privacy manifest.** The plugin ships a `PrivacyInfo.xcprivacy` declaring no tracking, no collected data and no required-reason APIs, wired into both the Swift package and the podspec. Nothing it does could hold up an App Store review, and the declaration now shows up in your app's privacy report.
- **A skill for coding agents** in [`skills/`](skills/capacitor-foldable), also published with the package: laying out around the crease, the API, Ionic specifics, iPhone Duo, Android foldables and how to test on both. Beta, and built from the plugin's own source and measurements.
- Docs: what the vertical bar opt-out is for, since Apple asks you not to override bar placement; how the side bar arrives as `safe-area-inset-right` (84 points) and moves to the top (82) when you disable it; that a flat foldable's fold region is reported inactive, so reading it natively needs `options: .includeInactive`; and that `ionic-tabs.css` keeps one deliberately unscoped rule.
- Examples: the even-columns demo lines its gutter up with the crease properly, and no longer lets tiles land in the fold column from the second row down.

## 8.2.0 (2026-09-20)

- **Fix, iPhone Duo:** the fold state follows the hinge angle when UIKit's hinge status disagrees with it ([#7](https://github.com/erkamyaman/capacitor-foldable/issues/7)). The status updates lazily, so the plugin could report `flat` at 60 degrees, `half-opened` at 170, or no fold at all while the phone was open.
- **Fix:** the polyfill measures the window again after a fold, so segments and CSS variables are right even when the web view reports the previous size for a moment ([#5](https://github.com/erkamyaman/capacitor-foldable/issues/5)).
- **`setVerticalBarBehavior()`:** keep bars horizontal on iPhone Duo, or hand them back to the system, from JavaScript. The plugin ships `FoldableBridgeViewController` for it, which replaces the hand-written view controller subclass the guide used to ask for.
- **`getReservedRegions()`:** every region the system reserves on the current display, with its kind, whether it is active and the margins to keep clear. On iPhone Duo that is the fold, the vertical status bar strip and the under-display camera.
- **`hingeMargins`** on `getFoldState()` and `--fold-margin-*` in the polyfill: the space to keep clear around the crease (20 points each side on iPhone Duo), so layouts can tell the crease from the keep-clear band.
- **`getHingeAngle()`** also returns the system's hinge `status`.
- `cameraBounds` is documented properly: on iPhone Duo it lists all active occlusions, which includes the vertical status bar strip, not only cameras.
- **New `examples` app:** a catalogue of one-file demos, one per API, that lays itself out as two pages around the crease on iPhone Duo. The README also links [Hinge Guess](https://github.com/erkamyaman/hinge-guess), a game built on the plugin.
- **`foldingChange`:** a new event that reports `{ folding: true }` as soon as the hinge starts moving and `{ folding: false }` half a second after it stops, so apps can pause animations or heavy work while the screen is in motion. The polyfill also puts a `folding` class on `<html>`. Android foldables with a hinge sensor, and iPhone Duo on iOS 27.1 or later.

## 8.1.1 (2026-09-20)

- `ionic-tabs.css` leaves a hidden tab bar hidden. It used to re-show `ion-tab-bar[hidden]`, which left an HTML tab bar showing through apps that replace it with a native one.
- Docs: in Angular the stylesheet goes in `global.scss`, since Angular rejects a CSS import from TypeScript.

## 8.1.0 (2026-09-20)

- **Fold position in CSS:** the polyfill sets `--fold-left`, `--fold-top`, `--fold-width` and `--fold-height`, and a `fold-vertical` or `fold-horizontal` class on `<html>`, whenever the device reports a fold, flat or half-open. Layouts can split along the fold without JavaScript ([#3](https://github.com/erkamyaman/capacitor-foldable/issues/3)).
- **Fix, iPhone Duo:** `activeDisplay` comes from the fold region instead of the hinge, so it stays right when the app is still on the outer display with the hinge open.
- **Fix, iPhone Duo:** the fold state is checked again after the app moves between displays, not only after hinge moves, so it no longer reports the previous display.

## 8.0.4 (2026-09-19)

- Published from GitHub Actions through npm Trusted Publishing, with provenance. No code changes.

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
