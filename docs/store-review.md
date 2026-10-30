# Store review

The plugin is built to give store review nothing to object to.

**iOS.** Public APIs only, UIKit and Capacitor, with no private symbols. An app built against an SDK older than 27.1 reaches the iOS 27.1 APIs through the Objective-C runtime, since the compiler cannot see them, and they are the same public APIs either way. It touches none of Apple's [required reason APIs](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api), collects nothing and tracks nobody, and it ships a `PrivacyInfo.xcprivacy` saying exactly that, which Xcode folds into your app's privacy report. Nothing it uses needs a purpose string in `Info.plist`. Any Xcode that Capacitor 8 supports builds fine, and reports the fold on a 27.1 device either way.

**Android.** The plugin adds no permissions and no `uses-feature` to your app, so it changes nothing about which devices can install it. Its own manifest is empty; Jetpack WindowManager merges two optional `<uses-library>` entries, which are how it binds to the OEM window extensions and filter nothing. The hinge angle comes from `TYPE_HINGE_ANGLE`, which needs no permission, and rear display and dual screen go through `WindowAreaController`, also permission free. `minSdk` is 24, the same as Capacitor's own default, and `targetSdk` follows your project.

**iPhone Duo screenshots.** Apple says apps submitted from April 2027 must include iPhone Duo screenshots, for both the outer display (1398 × 2034) and the inner display (2007 × 2853). Shots taken without the plugin show Ionic's tab bar running across the fold, so take them in the [iPhone Duo simulator](iphone-duo.md) once the app follows the fold. Check [App Store Connect's screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/) for the exact rules.

**Data safety and privacy labels.** Everything stays on the device: the plugin has no network code and stores nothing. There is no entry for it to add to Play's Data safety form or to your App Store privacy label.
