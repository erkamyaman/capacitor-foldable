# Ionic apps

## The tab bar belongs on the side

On iPhone Duo the system moves native toolbars and tab bars to the side of the display as a floating pill. Ionic's `ion-tabs` is HTML, so it stays a full width bar at the bottom, next to a status bar that has already moved.

```typescript
import '@erkamyaman/capacitor-foldable/ionic-tabs.css';
```

That turns `ion-tabs` into a side pill exactly where native bars go, and only where the system actually puts bars there. It keys on the `vertical-bars-leading` and `vertical-bars-trailing` classes, which `installFoldablePolyfill()` sets, so the stylesheet does nothing on its own. There is also `ionic-tabs-ios26.css`, which gives the horizontal bar iOS 26's floating look on every iPhone.

**Angular cannot import CSS from TypeScript.** That is TypeScript's error rather than Angular's: a side-effect import of a `.css` file has no type declarations, which TypeScript 6 reports as TS2882 (`noUncheckedSideEffectImports` is on by default there) and older versions as TS2307. Angular's `styles` array in `angular.json` is the other normal route. Put it in `src/global.scss` instead, and **as the first rule in the file**, because Sass rejects `@use` after any other rule, including the `@import` lines a stock Ionic `global.scss` starts with:

```scss
@use '@erkamyaman/capacitor-foldable/ionic-tabs.css';

@import "@ionic/angular/css/core.css";
// ...the rest of the Ionic imports
```

React and Vue import it from the entry file as usual, since their bundlers ship type shims for CSS.

## Projecting Ionic controls into native UI

Moving the tab bar with CSS is one answer. The other is [`@rdlabo/capacitor-native-ui`](https://github.com/rdlabo-dev/ionic-theme-ios27/tree/main/packages/capacitor-native-ui), which renders existing `ion-back-button`, `ion-buttons`, `ion-button`, `ion-tab-bar` and segment controls with UIKit and SwiftUI while the original elements, state and handlers stay in the WebView. It can put them in the system's vertical rail on iPhone Duo, and it works with an app's existing theme. The optional [`@rdlabo/ionic-theme-ios27`](https://github.com/rdlabo-dev/ionic-theme-ios27) adds iOS 27 styling on top.

The split is clean: this plugin provides device state, Native UI projects the controls, and the theme handles Web styling. Both rdlabo packages list this plugin in their standard setup, installed by the app as a direct dependency:

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

For setup, send the reader to rdlabo's own documentation rather than duplicating it here:

- [Native UI guide](https://github.com/rdlabo-dev/ionic-theme-ios27/tree/main/packages/capacitor-native-ui)
- [Vertical Bars with an existing Ionic theme](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/main/packages/capacitor-native-ui/docs/ionic-vertical-bars.md)
- [Migrating from theme 1.2.x](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/main/packages/capacitor-native-ui/docs/migration.md), where the native APIs were still bundled in the theme

Use the CSS stylesheet above when you want Ionic's own tab bar moved, and Native UI when you want the controls rendered natively.

## A fold fires a keyboard event

iPhone Duo sends a keyboard event when the device folds. Ionic's keyboard controller measures the app container's height the first time the keyboard opens and caches it, then waits for that exact height before showing the tab bar again. After a fold the height no longer matches, so the bar never comes back. Opt in to the fix:

```typescript
await installFoldablePolyfill({ ionicKeyboard: true });
```

It swallows Capacitor's raw keyboard events in the capture phase and puts a `foldable-keyboard-open` class on `<html>` only when something is genuinely focused. That class does nothing on its own: `ionic-tabs.css` carries the rule that hides the bar while the keyboard is up, so take both or neither. The `ios26` stylesheet does not carry that rule. Off by default, since it takes over those events.

## Two views of one screen

If your app has two modes that are really one screen, swap the view in place rather than routing between tabs. Routing mounts a lazy page on every tap, which shows as a blank frame, and Ionic's page transition then slides the new page in sideways, which is very visible on a wide inner display.

```typescript
readonly mode = signal<'game' | 'meter'>('game');
```

```html
@if (mode() === 'game') { <app-game /> } @else { <app-meter /> }
```

If you do route, `provideIonicAngular({ animated: false })` removes the slide, but be aware it disables every Ionic animation app-wide, including modals and ripples.

## Apple's rules for the side bar

The vertical bar has an order: primary navigation at the top, then prominent actions. Apple also asks you to prefer a symbol over text there, since anything with a label stays in a horizontal bar. The stylesheet hides the labels visually for that reason but keeps them for VoiceOver, so leave them in your markup.

## Styling gotcha

`ion-tab-bar` ships `contain: strict`, which brings size containment with it. The moment you let either dimension come from its contents, it lays out as if empty and collapses: height in the side pill, width in the iOS 26 variant. Both shipped stylesheets set `contain: none` for that reason.
