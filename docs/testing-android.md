# Testing on Android

- **Emulator.** Create a foldable virtual device in Android Studio, such as Pixel 9 Pro Fold, and use its fold and unfold controls. From a terminal, `adb emu fold` and `adb emu unfold` do the same, and `adb emu sensor set hinge-angle0 90` sets the hinge angle.
- **Any window size.** The Resizable emulator switches between phone, foldable and tablet sizes without restarting the app, which exercises `sizeClassChange`.
- **Android 17 orientation rules.** Turn them on for your app without targeting API level 37: `adb shell am compat enable UNIVERSAL_RESIZABLE_BY_DEFAULT your.app.id`.
- **Real Galaxy foldables.** [Samsung Remote Test Lab](https://developer.samsung.com/remote-test-lab) runs Galaxy Z Flip and Z Fold phones in the browser for free. Its Remote Debug Bridge connects them to `adb`, and `adb shell cmd device_state state 2` puts the phone in a half-opened posture (`state reset` undoes it). The phones sit closed in the lab, so the hinge angle always reads `0` there.
- **Rear display and dual-screen modes** need a foldable that offers them. `getDisplayModes()` tells you whether the device you are on does. Galaxy Z Fold phones offer both, Galaxy Z Flip phones offer dual screen in Flex mode only, and the emulators don't offer dual screen at all.
