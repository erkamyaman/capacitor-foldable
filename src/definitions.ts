import type { PluginListenerHandle } from '@capacitor/core';

export interface FoldState {
  /**
   * Posture of the fold. `'closed'` is never reported today: a device shut on
   * its cover display reports `'flat'`.
   *
   * @since 7.0.0
   */
  state: 'flat' | 'half-opened' | 'closed';

  /**
   * Whether the fold splits the web view into two areas: `true` when
   * half-opened, or when the hinge has a physical gap.
   *
   * @since 7.0.0
   */
  isSeparating: boolean;

  /**
   * How the device is held: `'tabletop'` when half-opened with a horizontal
   * hinge, like a laptop, `'book'` when half-opened with a vertical hinge, and
   * `'flat'` otherwise.
   *
   * @since 7.0.0
   */
  posture: 'flat' | 'tabletop' | 'book';

  /**
   * Direction of the hinge relative to the window, so it flips when the device
   * rotates. Omitted when there is no fold.
   *
   * @since 7.0.0
   */
  hingeOrientation?: 'horizontal' | 'vertical';

  /**
   * Position of the fold in CSS pixels, relative to the web view. Zero wide (or
   * zero tall) on a seamless fold. Omitted when there is no fold.
   *
   * @since 7.0.0
   */
  hingeBounds?: { x: number; y: number; width: number; height: number };

  /**
   * Area of the web view the hinge covers, in CSS pixels. Only present on
   * devices with a physical gap.
   *
   * @since 7.0.0
   */
  occludedBounds?: { x: number; y: number; width: number; height: number };

  /**
   * Which display is showing the app, on a device with an inner and an outer
   * display such as iPhone Duo. Reported on iPhone Duo (iOS 27.1 or later) and
   * omitted elsewhere.
   *
   * @since 7.0.0
   */
  activeDisplay?: 'inner' | 'outer';

  /**
   * Areas of the web view covered by a front-facing camera, in CSS pixels. On
   * Android these are the display cutouts. On iPhone Duo they are the outer
   * camera and the under-display inner camera while it is in use. Omitted when
   * there are none.
   *
   * @since 7.0.0
   */
  cameraBounds?: { x: number; y: number; width: number; height: number }[];
}

export interface SizeClass {
  /**
   * Width size class of the window: `'compact'` on a phone and on the outer
   * display of a foldable, `'regular'` on the inner display, tablets and wide
   * windows. On Android and web `'regular'` starts at 600 CSS pixels.
   *
   * @since 7.0.0
   */
  horizontal: 'compact' | 'regular';

  /**
   * Height size class of the window: `'compact'` on a phone in landscape. On
   * Android and web `'regular'` starts at 480 CSS pixels.
   *
   * @since 7.0.0
   */
  vertical: 'compact' | 'regular';

  /**
   * Material window width class, from the window width in CSS pixels:
   * `'compact'` below 600, `'medium'` below 840, `'expanded'` below 1200,
   * `'large'` below 1600 and `'extraLarge'` from 1600.
   *
   * @since 7.0.0
   */
  widthClass: 'compact' | 'medium' | 'expanded' | 'large' | 'extraLarge';

  /**
   * Material window height class, from the window height in CSS pixels:
   * `'compact'` below 480, `'medium'` below 900 and `'expanded'` from 900.
   *
   * @since 7.0.0
   */
  heightClass: 'compact' | 'medium' | 'expanded';
}

export type DisplayModeStatus = 'unsupported' | 'unavailable' | 'available' | 'active';

export interface DisplayModes {
  /**
   * Rear display mode moves the app to the outer display, so people can frame a
   * photo with the rear cameras. Only on Android foldables that offer it.
   *
   * @since 7.0.0
   */
  rearDisplay: DisplayModeStatus;

  /**
   * Dual-screen mode shows a second page on the outer display while the app
   * stays on the inner one. Only on Android foldables that offer it.
   *
   * @since 7.0.0
   */
  dualScreen: DisplayModeStatus;
}

export interface BarPlacement {
  /**
   * The edge iPhone Duo moves tab bars and toolbars to when it lays them out
   * vertically: `'leading'` or `'trailing'` in the reading direction, so
   * `'leading'` is the left edge in left-to-right languages. `null` when bars
   * stay horizontal, and always on Android, web and iOS before 27.1.
   *
   * @since 7.0.0
   */
  verticalBarEdge: 'leading' | 'trailing' | null;
}

export interface FoldablePolyfillOptions {
  /**
   * Take over hiding Ionic's tab bar while the keyboard is open. iPhone Duo
   * reports a keyboard on every fold, and Ionic waits for the window to return
   * to the height it had when the keyboard first opened, so its tab bar can
   * disappear until the device is folded back. With this on, the keyboard events
   * never reach Ionic, and a `foldable-keyboard-open` class on `<html>` marks
   * when a text field really has the keyboard. `ionic-tabs.css` hides the tab
   * bar with it.
   *
   * @default false
   * @since 8.0.2
   */
  ionicKeyboard?: boolean;
}

export interface FoldablePlugin {
  /**
   * Whether the device has a fold at all, and whether it can be propped half
   * open like a laptop. Both `false` on web, and on iOS except on iPhone Duo
   * (iOS 27.1 or later).
   *
   * @since 7.0.0
   */
  isDeviceFoldable(): Promise<{ foldable: boolean; supportsTabletop: boolean }>;

  /**
   * Read the current fold state. Resolves to
   * `{ state: 'flat', isSeparating: false, posture: 'flat' }` when there is no
   * fold information.
   *
   * @since 7.0.0
   */
  getFoldState(): Promise<FoldState>;

  /**
   * Read the angle between the two halves of the device, in degrees: `0` when
   * closed, `180` when flat. Resolves to `{ angle: null }` on devices without a
   * hinge angle sensor, on web, and on iOS before 27.1.
   *
   * @since 7.0.0
   */
  getHingeAngle(): Promise<{ angle: number | null }>;

  /**
   * Read the window's size classes: Apple's compact and regular, the signal its
   * iPhone Duo guidelines recommend for telling the outer display from the inner
   * one, and Material's width and height classes. On iOS `horizontal` and
   * `vertical` are UIKit's size classes; everything else comes from the window
   * size.
   *
   * @since 7.0.0
   */
  getSizeClass(): Promise<SizeClass>;

  /**
   * Read which of the foldable display modes the device offers right now. Both
   * are `'unsupported'` on iOS and web.
   *
   * @since 7.0.0
   */
  getDisplayModes(): Promise<DisplayModes>;

  /**
   * Read where native bars go. Native tab bars and toolbars move to the side of
   * the display on iPhone Duo, but HTML ones stay put, so use this to move your
   * own tab bar too.
   *
   * @since 7.0.0
   */
  getBarPlacement(): Promise<BarPlacement>;

  /**
   * Move the app to the outer display. Android asks the user to confirm first,
   * and the promise resolves once the app has moved. Rejects when rear display
   * mode is not `'available'`. Only on Android.
   *
   * @since 7.0.0
   */
  startRearDisplay(): Promise<void>;

  /**
   * Move the app back to the inner display.
   *
   * @since 7.0.0
   */
  stopRearDisplay(): Promise<void>;

  /**
   * Show a page on the outer display while the app stays on the inner one. A
   * relative `url` resolves against the app's own URL, so `'cover.html'` loads a
   * page bundled with the app. The page runs in its own web view without access
   * to Capacitor plugins. Calling this again while dual-screen mode is active
   * replaces the page. Only on Android.
   *
   * @since 7.0.0
   */
  startDualScreen(options: { url: string }): Promise<void>;

  /**
   * Close the page on the outer display.
   *
   * @since 7.0.0
   */
  stopDualScreen(): Promise<void>;

  /**
   * Listen for fold state changes. On a foldable this also fires when the
   * device rotates, because `hingeOrientation` and `hingeBounds` rotate with
   * the window.
   *
   * @since 7.0.0
   */
  addListener(eventName: 'foldStateChange', listenerFunc: (state: FoldState) => void): Promise<PluginListenerHandle>;

  /**
   * Listen for hinge angle changes. On Android the hinge sensor only runs while
   * at least one of these listeners is registered. On iOS it fires on iPhone
   * Duo (iOS 27.1 or later). Never fires on web.
   *
   * @since 7.0.0
   */
  addListener(
    eventName: 'hingeAngleChange',
    listenerFunc: (event: { angle: number }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Listen for size class changes, such as unfolding the device, rotating it or
   * resizing the window. On iOS this fires when UIKit's size classes change
   * (iOS 17 or later) or the device rotates, so a resize that keeps the same
   * size classes may not update `widthClass` and `heightClass` until then.
   *
   * @since 7.0.0
   */
  addListener(
    eventName: 'sizeClassChange',
    listenerFunc: (sizeClass: SizeClass) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Listen for changes to the display modes, including a mode ending because
   * the user folded or unfolded the device. Never fires on iOS and web.
   *
   * @since 7.0.0
   */
  addListener(
    eventName: 'displayModeChange',
    listenerFunc: (modes: DisplayModes) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Listen for bar placement changes, such as opening or rotating iPhone Duo.
   * Only fires on iOS 27.1 or later.
   *
   * @since 7.0.0
   */
  addListener(
    eventName: 'barPlacementChange',
    listenerFunc: (placement: BarPlacement) => void,
  ): Promise<PluginListenerHandle>;
}
