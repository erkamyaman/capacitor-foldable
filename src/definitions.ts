import type { PluginListenerHandle } from '@capacitor/core';

export interface FoldState {
  /**
   * Posture of the fold. `'closed'` is never reported today: a device shut on
   * its cover display reports `'flat'`.
   *
   * @since 0.0.1
   */
  state: 'flat' | 'half-opened' | 'closed';

  /**
   * Whether the fold splits the web view into two areas: `true` when
   * half-opened, or when the hinge has a physical gap.
   *
   * @since 0.0.1
   */
  isSeparating: boolean;

  /**
   * How the device is held: `'tabletop'` when half-opened with a horizontal
   * hinge, like a laptop, `'book'` when half-opened with a vertical hinge, and
   * `'flat'` otherwise.
   *
   * @since 0.0.1
   */
  posture: 'flat' | 'tabletop' | 'book';

  /**
   * Direction of the hinge relative to the window, so it flips when the device
   * rotates. Omitted when there is no fold.
   *
   * @since 0.0.1
   */
  hingeOrientation?: 'horizontal' | 'vertical';

  /**
   * Position of the fold in CSS pixels, relative to the web view. Zero wide (or
   * zero tall) on a seamless fold. Omitted when there is no fold.
   *
   * @since 0.0.1
   */
  hingeBounds?: { x: number; y: number; width: number; height: number };

  /**
   * Area of the web view the hinge covers, in CSS pixels. Only present on
   * devices with a physical gap.
   *
   * @since 0.0.1
   */
  occludedBounds?: { x: number; y: number; width: number; height: number };

  /**
   * Which display is showing the app, on a device with an inner and an outer
   * display such as iPhone Duo. Omitted when the platform doesn't report it,
   * which today is always.
   *
   * @since 0.0.1
   */
  activeDisplay?: 'inner' | 'outer';

  /**
   * Areas of the web view covered by a front-facing camera, in CSS pixels. On
   * Android these are the display cutouts. On iPhone Duo they will be the outer
   * camera and the under-display inner camera while in use, once iOS support
   * lands. Omitted when there are none.
   *
   * @since 0.0.1
   */
  cameraBounds?: { x: number; y: number; width: number; height: number }[];
}

export interface SizeClass {
  /**
   * Width size class of the window: `'compact'` on a phone and on the outer
   * display of a foldable, `'regular'` on the inner display, tablets and wide
   * windows. On Android and web `'regular'` starts at 600 CSS pixels.
   *
   * @since 0.0.1
   */
  horizontal: 'compact' | 'regular';

  /**
   * Height size class of the window: `'compact'` on a phone in landscape. On
   * Android and web `'regular'` starts at 480 CSS pixels.
   *
   * @since 0.0.1
   */
  vertical: 'compact' | 'regular';

  /**
   * Material window width class, from the window width in CSS pixels:
   * `'compact'` below 600, `'medium'` below 840, `'expanded'` below 1200,
   * `'large'` below 1600 and `'extraLarge'` from 1600.
   *
   * @since 0.0.1
   */
  widthClass: 'compact' | 'medium' | 'expanded' | 'large' | 'extraLarge';

  /**
   * Material window height class, from the window height in CSS pixels:
   * `'compact'` below 480, `'medium'` below 900 and `'expanded'` from 900.
   *
   * @since 0.0.1
   */
  heightClass: 'compact' | 'medium' | 'expanded';
}

export type DisplayModeStatus = 'unsupported' | 'unavailable' | 'available' | 'active';

export interface DisplayModes {
  /**
   * Rear display mode moves the app to the outer display, so people can frame a
   * photo with the rear cameras. Only on Android foldables that offer it.
   *
   * @since 0.0.1
   */
  rearDisplay: DisplayModeStatus;

  /**
   * Dual-screen mode shows a second page on the outer display while the app
   * stays on the inner one. Only on Android foldables that offer it.
   *
   * @since 0.0.1
   */
  dualScreen: DisplayModeStatus;
}

export interface FoldablePlugin {
  /**
   * Whether the device has a fold at all, and whether it can be propped half
   * open like a laptop. Both `false` on iOS and web.
   *
   * @since 0.0.1
   */
  isDeviceFoldable(): Promise<{ foldable: boolean; supportsTabletop: boolean }>;

  /**
   * Read the current fold state. Resolves to
   * `{ state: 'flat', isSeparating: false, posture: 'flat' }` when there is no
   * fold information.
   *
   * @since 0.0.1
   */
  getFoldState(): Promise<FoldState>;

  /**
   * Read the angle between the two halves of the device, in degrees: `0` when
   * closed, `180` when flat. Resolves to `{ angle: null }` on devices without a
   * hinge angle sensor, and always on iOS and web.
   *
   * @since 0.0.1
   */
  getHingeAngle(): Promise<{ angle: number | null }>;

  /**
   * Read the window's size classes: Apple's compact and regular, the signal its
   * iPhone Duo guidelines recommend for telling the outer display from the inner
   * one, and Material's width and height classes. On iOS `horizontal` and
   * `vertical` are UIKit's size classes; everything else comes from the window
   * size.
   *
   * @since 0.0.1
   */
  getSizeClass(): Promise<SizeClass>;

  /**
   * Read which of the foldable display modes the device offers right now. Both
   * are `'unsupported'` on iOS and web.
   *
   * @since 0.0.1
   */
  getDisplayModes(): Promise<DisplayModes>;

  /**
   * Move the app to the outer display. Android asks the user to confirm first,
   * and the promise resolves once the app has moved. Rejects when rear display
   * mode is not `'available'`. Only on Android.
   *
   * @since 0.0.1
   */
  startRearDisplay(): Promise<void>;

  /**
   * Move the app back to the inner display.
   *
   * @since 0.0.1
   */
  stopRearDisplay(): Promise<void>;

  /**
   * Show a page on the outer display while the app stays on the inner one. A
   * relative `url` resolves against the app's own URL, so `'cover.html'` loads a
   * page bundled with the app. The page runs in its own web view without access
   * to Capacitor plugins. Calling this again while dual-screen mode is active
   * replaces the page. Only on Android.
   *
   * @since 0.0.1
   */
  startDualScreen(options: { url: string }): Promise<void>;

  /**
   * Close the page on the outer display.
   *
   * @since 0.0.1
   */
  stopDualScreen(): Promise<void>;

  /**
   * Listen for fold state changes. On a foldable this also fires when the
   * device rotates, because `hingeOrientation` and `hingeBounds` rotate with
   * the window.
   *
   * @since 0.0.1
   */
  addListener(eventName: 'foldStateChange', listenerFunc: (state: FoldState) => void): Promise<PluginListenerHandle>;

  /**
   * Listen for hinge angle changes. The hinge sensor only runs while at least
   * one of these listeners is registered. Never fires on iOS and web.
   *
   * @since 0.0.1
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
   * @since 0.0.1
   */
  addListener(
    eventName: 'sizeClassChange',
    listenerFunc: (sizeClass: SizeClass) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Listen for changes to the display modes, including a mode ending because
   * the user folded or unfolded the device. Never fires on iOS and web.
   *
   * @since 0.0.1
   */
  addListener(
    eventName: 'displayModeChange',
    listenerFunc: (modes: DisplayModes) => void,
  ): Promise<PluginListenerHandle>;
}
