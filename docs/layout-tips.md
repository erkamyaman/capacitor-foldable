# Layout tips

These follow Apple's [Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo) guidelines and apply to Android foldables too.

- **Pad with every safe-area inset, not only the top one.** On iPhone Duo the status bar and toolbars move to the side of the display, and foldable cutouts are rarely symmetric. Prefer Capacitor's injected `--safe-area-inset-*` variables (Capacitor 8.3 and later), because `env(safe-area-inset-*)` returns wrong values in Android WebView before version 140:
  ```css
  padding-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px));
  padding-right: var(--safe-area-inset-right, env(safe-area-inset-right, 0px));
  padding-bottom: var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px));
  padding-left: var(--safe-area-inset-left, env(safe-area-inset-left, 0px));
  ```
- **Don't rely on orientation locks.** iPhone Duo's inner display ignores them, and so does Android 17 for apps targeting API level 37 on any display wider than 600dp: `android:screenOrientation`, `resizeableActivity`, aspect ratio limits and `@capacitor/screen-orientation`'s `lock()` all stop applying there. Games are exempt through `android:appCategory`, and Google Play requires API level 37 from August 2027.
- **Keep buttons and other interactive elements off the fold** while `isSeparating` is `true`. Scrolling content can cross it.
- **Prefer an even number of grid columns**, so content divides cleanly at the fold.
- **Make small adjustments as the device folds** instead of rearranging the whole layout.
