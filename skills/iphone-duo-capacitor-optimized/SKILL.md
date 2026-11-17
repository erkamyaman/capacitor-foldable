---
name: iphone-duo-capacitor-optimized
description: Audit a Capacitor or Ionic app against what Apple calls optimized for iPhone Duo (built with the iOS 27.1 SDK, full display, bars vertical, layout that survives resizing) and fix what fails with @erkamyaman/capacitor-foldable. Trigger when asked whether a Capacitor app is Duo-optimized, before an App Store submission or badge for iPhone Duo, or when the app shows empty space around it, a gap by the status bar, or a bottom tab bar on iPhone Duo.
license: MIT
metadata:
  author: erkamyaman
  version: '0.1'
  status: beta
  checked: 2026-11, against developer.apple.com/iphone-duo/prepare, Xcode 27.1, Capacitor 8.6, plugin 8.5.2
---

# iPhone Duo optimized, for Capacitor apps

Apple's [prepare page](https://developer.apple.com/iphone-duo/prepare/) defines it: an app built with the iOS 27.1 SDK or later is "optimized for iPhone Duo". It extends to the full display, and native toolbars and tab bars move to a vertical bar below the status bar. Apple asks one thing in return before shipping: that content "adapts to the bars becoming vertical", and keeps adapting when a fold resizes the app mid-session.

A Capacitor app gets the first half from the SDK and owes the second half itself, because its bars and layout are HTML that the system cannot move. This skill is the audit for both halves. The fixes live in the **`capacitor-foldable` skill**: load it before changing anything. It ships in the plugin's npm package at `node_modules/@erkamyaman/capacitor-foldable/skills/capacitor-foldable/SKILL.md`, and in [iphone-duo-capacitor-skills](https://github.com/erkamyaman/iphone-duo-capacitor-skills).

Run the four checks in order. Every check ends on **evidence**: a command's output, a search result, or a simulator screenshot. A check without evidence has not passed.

## 1. The SDK

The SDK decides the window before any code runs. Per Apple's page:

| Built with | On iPhone Duo |
| --- | --- |
| iOS 26 SDK or earlier | Centered on the inner display with empty space around it; closed, it sits to the left of the status bar and camera |
| iOS 27 SDK | Fills most of the inner display but still avoids the status bar on the right edge |
| iOS 27.1 SDK or later | Optimized: full display, bars vertical |

```bash
xcodebuild -version                 # 27.1 or later
npm ls @capacitor/ios @erkamyaman/capacitor-foldable
```

Capacitor must be 8.5 or later, because iOS 27 needs the scene lifecycle that 8.5 adopted, and a Capacitor 7 app built with Xcode 27 crashes at launch. If the app is on Capacitor 7, the upgrade to Capacitor 8 comes first and is its own piece of work: stop the audit and report it.

Then build and read the SDK the binary was linked against:

```bash
/usr/libexec/PlistBuddy -c 'Print :DTSDKName' path/to/App.app/Info.plist
```

Check the build that actually ships, not only the local one. Read every workflow that archives the app (`.github/workflows/*.yml`, Xcode Cloud, Fastlane, Codemagic) for the Xcode it selects. A hosted macOS runner uses its image's default Xcode unless the workflow picks one, and that default lags: in November 2026, public Capacitor apps with this plugin fully wired in were still shipping from `macos-26` and `macos-latest` runners on Xcode 26.6, so their App Store builds got the iOS 26 row above. Select Xcode 27.1 or later explicitly (`sudo xcode-select -s /Applications/Xcode_27.1.app`, or a setup action pinned to that version) and print `xcodebuild -version` in the log.

**Passes when** `DTSDKName` reads `iphoneos27.1` or later (`iphonesimulator27.1` for a simulator build), and the release workflow's log shows Xcode 27.1 or later.

## 2. Layout that survives resizing

Apple's pattern list is UIKit and SwiftUI; each has a web equivalent that breaks the same way. A fold resizes the web view mid-session, so anything measured once goes stale. Search the app's source for each pattern:

| Search for | Why it breaks | Use instead |
| --- | --- | --- |
| `screen.width`, `screen.height`, `screen.availWidth` | Measures the device, not the window | `window.innerWidth`, CSS units, container queries |
| Sizes read once at startup or in `ngOnInit` / `onMounted` without a `resize` listener | A fold resizes the app mid-session | CSS, or re-read on `resize` |
| `screen.orientation`, `window.orientation`, `orientationchange`, `(orientation: ...)` media queries | Apple: avoid orientation for layout decisions | Compare width and height, or the plugin's size classes |
| `isPlatform('ipad')`, `isPlatform('tablet')`, user agent checks | An iPhone can now have any combination of size classes | Size classes (`getSizeClass()`, `sizeClassChange`) or available space |
| Hard-coded device sizes (`844`, `932`, lists of iPhone heights) | They will not match iPhone Duo | Breakpoints on available space |
| `object-fit: cover` on key media | Can lose important content on the wider display | `contain`, or `cover` with an `object-position` focal point |
| `max-width` on `body`, the app root or the outermost container | Leaves the display unused | Let the root fill the window |
| A viewport meta tag without `viewport-fit=cover` | Keeps the page inside the safe area and makes `env(safe-area-inset-*)` read zero | `viewport-fit=cover` with safe-area padding |

Native code beside the web view (an `AppDelegate`, a custom plugin) follows Apple's own list. Xcode 27.1 ships a resizability skill for it: ask Xcode's assistant to "get my app ready for iPhone Duo", or export it for another agent with `xcrun agent skills export`.

Install this plugin and its polyfill if the app does not have them yet (the `capacitor-foldable` skill, "Install" and "Start here"), and keep content that reads or takes taps clear of the 40 point fold band when open; that skill's hard rules cover how.

**Passes when** every pattern above is either absent or fixed, listed with the file it was in.

## 3. Bars on the vertical edge

Native bars move on their own. HTML bars do not: an Ionic `ion-tab-bar` or a custom bottom nav stays horizontal next to a system bar that has already moved.

Search the app for its bars (`ion-tabs`, `ion-tab-bar`, `ion-toolbar`, `ion-footer`, any fixed bottom navigation) and pick one route per bar from the `capacitor-foldable` skill's [ionic.md](https://github.com/erkamyaman/iphone-duo-capacitor-skills/blob/main/skills/capacitor-foldable/references/ionic.md):

- **Move the HTML bar** with `ionic-tabs.css`, which turns `ion-tabs` into a side pill exactly where the system puts its bars.
- **Render the controls natively** with `@rdlabo/capacitor-native-ui`, which projects `ion-tab-bar`, `ion-buttons` and segment controls into the system's vertical rail. With `@rdlabo/ionic-theme-ios27`, the theme's documented setup feeds it this plugin's layout: `setVerticalBarsLayout(await resolveVerticalBarsLayout(Foldable))`, refreshed on the `layoutChange` event. Follow [rdlabo's guide](https://github.com/webview-native-ui/capacitor-plugin/blob/main/docs/ionic-vertical-bars.md) for the rest.

Leave `setVerticalBarBehavior` on `automatic`. Disabling it returns the bars to horizontal, which undoes what the 27.1 SDK gives; it suits only a fullscreen player or a non-scrolling layout such as a calculator.

**Passes when** `await Foldable.getBarPlacement()` reads a `verticalBarEdge` of `leading` or `trailing` with a non-zero `inset`, and check 4's screenshots show every app bar in that edge rather than along the bottom.

## 4. Every pose, in the simulator

Apple calls the iPhone Duo simulator in Xcode 27.1 "the best way to test the full native experience"; the `capacitor-foldable` skill's [testing.md](https://github.com/erkamyaman/iphone-duo-capacitor-skills/blob/main/skills/capacitor-foldable/references/testing.md) has the setup. Take a screenshot closed, open flat and half open, in portrait and landscape, and fold it shut and open once mid-session to catch layout read only at startup.

**Passes when** every screenshot shows the app's own background reaching all four edges with no empty band beside the status bar, the bars on the vertical edge, and nothing readable or tappable inside the fold band.

## Report

Finish with one row per check:

| Check | Result | Evidence |
| --- | --- | --- |
| iOS 27.1 SDK, locally and in CI | pass / fail | `DTSDKName`, CI `xcodebuild -version`, Capacitor version |
| Layout survives resizing | pass / fail | patterns found and fixed, with files |
| Bars on the vertical edge | pass / fail | `getBarPlacement()` output |
| Every pose | pass / fail | screenshots |

For each failure, name the fix applied or still needed, with the file it touches. When all four pass, point out the optional App Store step from Apple's page: iPhone Duo screenshots in App Store Connect put the "optimized for iPhone Duo" badge on the product page, and a featuring nomination can say the app is optimized "including support for all device poses".
