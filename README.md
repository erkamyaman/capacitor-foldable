<p align="center"><img src="https://raw.githubusercontent.com/erkamyaman/capacitor-foldable/main/docs/images/logo/logo.svg" width="168" height="126" alt="Capacitor Foldable logo"></p>
<h1 align="center">Capacitor Foldable</h1>
<p align="center"><strong><code>@erkamyaman/capacitor-foldable</code></strong></p>
<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2026?style=for-the-badge" />
  <a href="https://www.npmjs.com/package/@erkamyaman/capacitor-foldable"><img src="https://img.shields.io/npm/v/@erkamyaman/capacitor-foldable?style=for-the-badge" /></a>
  <a href="https://www.npmjs.com/package/@erkamyaman/capacitor-foldable"><img src="https://img.shields.io/npm/dw/@erkamyaman/capacitor-foldable?style=for-the-badge" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/@erkamyaman/capacitor-foldable?style=for-the-badge" /></a>
  <a href="https://github.com/sponsors/erkamyaman"><img src="https://img.shields.io/badge/sponsor-%E2%9D%A4-db61a2?style=for-the-badge&logo=githubsponsors&logoColor=white" /></a>
</p>
<p align="center">
Fold state, posture, hinge angle, size classes and bar placement for foldable phones such as Galaxy Z Fold and Flip, Pixel Fold and iPhone Duo, in Capacitor apps.
</p>

<p align="center"><a href="https://erkamyaman.github.io/capacitor-foldable/"><strong>Documentation</strong></a> · <a href="https://erkamyaman.github.io/capacitor-foldable/api.html">API</a> · <a href="https://erkamyaman.github.io/capacitor-foldable/iphone-duo.html">iPhone Duo guide</a> · <a href="https://github.com/erkamyaman/hinge-guess">Hinge Guess demo</a></p>

| Ionic tabs on iPhone Duo without the plugin | With the plugin |
| --- | --- |
| <img src="https://raw.githubusercontent.com/erkamyaman/capacitor-foldable/main/docs/images/ionic-before-book.png" width="360" alt="Ionic tab bar across the fold in book posture"> | <img src="https://raw.githubusercontent.com/erkamyaman/capacitor-foldable/main/docs/images/ionic-after-book.png" width="360" alt="Ionic tab bar moved to the side in book posture"> |

## Install

```bash
npm install @erkamyaman/capacitor-foldable
npx cap sync
```

| Capacitor | Plugin | iOS |
| --------- | ------ | --- |
| v8.x      | v8.x   | Size classes, plus iPhone Duo on Capacitor 8.5+ and iOS 27.1, built with any Xcode |
| v7.x      | v7.x   | Size classes only |

Android works on API 24+ with any foldable Jetpack WindowManager supports. The web build is a stub that reports `flat`.

## Usage

```typescript
import { Foldable } from '@erkamyaman/capacitor-foldable';

const { posture } = await Foldable.getFoldState(); // 'flat' | 'tabletop' | 'book'

Foldable.addListener('foldStateChange', ({ posture }) => {
  document.documentElement.dataset.posture = posture;
});
```

Prefer CSS? `installFoldablePolyfill()` fills in the Device Posture and Viewport Segments APIs that Capacitor's web views turn off, and sets `--fold-*` variables and classes on `<html>`. Using `ion-tabs`? `import '@erkamyaman/capacitor-foldable/ionic-tabs.css'`.

**Everything else is in the [documentation](https://erkamyaman.github.io/capacitor-foldable/).**

## Guides

- [API reference](https://erkamyaman.github.io/capacitor-foldable/api.html)
- [iPhone Duo](https://erkamyaman.github.io/capacitor-foldable/iphone-duo.html)
- [Layout tips](https://erkamyaman.github.io/capacitor-foldable/layout-tips.html)
- [Examples](https://erkamyaman.github.io/capacitor-foldable/examples.html)
- [Testing on Android](https://erkamyaman.github.io/capacitor-foldable/testing-android.html)
- [Store review](https://erkamyaman.github.io/capacitor-foldable/store-review.html)

## Agent skill

```bash
npx skills add erkamyaman/capacitor-foldable@capacitor-foldable
```

Also ships in the npm package under [`skills/`](skills/capacitor-foldable), and on its own at [iphone-duo-capacitor-skills](https://github.com/erkamyaman/iphone-duo-capacitor-skills).

## Used by

- [Capacitor Native UI](https://github.com/rdlabo-dev/ionic-theme-ios27/tree/main/packages/capacitor-native-ui) and [Ionic Theme iOS 27](https://github.com/rdlabo-dev/ionic-theme-ios27) by rdlabo
- [Hinge Guess](https://github.com/erkamyaman/hinge-guess), a game where the phone's hinge is the controller

## Trademarks and licence

This plugin is MIT licensed, and that covers the work in this repository. Quoted passages from Apple's and Google's documentation belong to them and are used here to explain their guidance.

iPhone and iPhone Duo are trademarks of Apple Inc., registered in the U.S. and other countries. Android and Pixel are trademarks of Google LLC. Galaxy Z Fold and Galaxy Z Flip are trademarks of Samsung Electronics Co., Ltd. This project is not affiliated with, endorsed by, or sponsored by any of them; the names appear only to say which devices the plugin works with.
