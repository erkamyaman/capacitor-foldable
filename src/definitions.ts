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
   * Areas of the web view something covers, in CSS pixels. On Android these are
   * the display cutouts. On iPhone Duo these are the active occlusion regions:
   * the camera in use, and the strip the system keeps for the vertical status
   * bar. Use `getReservedRegions()` when you need to tell them apart. Omitted
   * when there are none.
   *
   * @since 7.0.0
   */
  cameraBounds?: { x: number; y: number; width: number; height: number }[];

  /**
   * Space the system asks you to keep clear around the fold, in CSS pixels.
   * `hingeBounds` covers the crease plus these margins, so the crease itself is
   * `hingeBounds` shrunk by them. iPhone Duo reports 20 on each side of a
   * vertical fold. Omitted on Android and where there is no fold.
   *
   * @since 8.2.0
   */
  hingeMargins?: { top: number; right: number; bottom: number; left: number };
}

export interface ReservedRegion {
  /**
   * `'division'` is the fold itself. `'occlusion'` is something covering the
   * display, such as a camera or the vertical status bar area.
   *
   * @since 8.2.0
   */
  kind: 'division' | 'occlusion';

  /**
   * Whether the region applies right now. An inactive division is a flat fold,
   * and an inactive occlusion is a camera that is not in use.
   *
   * @since 8.2.0
   */
  isActive: boolean;

  x: number;
  y: number;
  width: number;
  height: number;

  /**
   * Space to keep clear around the region, in CSS pixels.
   *
   * @since 8.2.0
   */
  margins: { top: number; right: number; bottom: number; left: number };
}

/**
 * How far open the hinge is, as the system sees it. Note that it can lag the
 * angle: iOS keeps reporting `'closed'` for a moment after the phone opens.
 *
 * @since 8.2.0
 */
export type HingeStatus = 'closed' | 'partiallyOpen' | 'fullyOpen';

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
  getHingeAngle(): Promise<{ angle: number | null; status: HingeStatus | null }>;

  /**
   * Read every region the system reserves on this display: the fold and
   * anything covering the screen, active or not. iPhone Duo reports the fold,
   * the vertical status bar area and the under-display camera. Resolves to an
   * empty list on Android, on web and on iOS before 27.1.
   *
   * @since 8.2.0
   */
  getReservedRegions(): Promise<{ regions: ReservedRegion[] }>;

  /**
   * Choose whether iPhone Duo may move this app's bars to the side of the
   * display. `'disabled'` keeps everything horizontal, including the status
   * bar. Resolves to `{ applied: false }` when the app does not use
   * `FoldableBridgeViewController`, on Android, on web and on iOS before 27.1.
   * See the iPhone Duo guide for the one-line storyboard change.
   *
   * @since 8.2.0
   */
  setVerticalBarBehavior(options: { behavior: 'automatic' | 'disabled' }): Promise<{ applied: boolean }>;

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
   * Listen for the device being folded or unfolded. `folding` turns `true` as
   * soon as the hinge starts moving and `false` about half a second after it
   * stops, so an app can pause animations or heavy work while the screen is in
   * motion. Only fires where a hinge angle is available: Android foldables with
   * a hinge sensor, and iPhone Duo on iOS 27.1 or later.
   *
   * @since 8.2.0
   */
  addListener(
    eventName: 'foldingChange',
    listenerFunc: (event: { folding: boolean }) => void,
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
