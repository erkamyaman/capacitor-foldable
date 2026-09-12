import type { PluginListenerHandle } from '@capacitor/core';

export interface FoldState {
  /**
   * The posture of the device's fold.
   *
   * `'flat'` means the device is fully unfolded (or is not a foldable at all).
   * `'half-opened'` means the two halves are at a meaningful angle to each other,
   * for example a laptop-style or book-style posture.
   *
   * `'closed'` is part of the API for completeness, but no platform currently
   * reports it: Android's `WindowLayoutInfo` stops publishing a folding feature
   * once the inner display is off, so a folded-shut device reports `'flat'` for
   * whichever display the app is running on.
   *
   * @since 0.0.1
   */
  state: 'flat' | 'half-opened' | 'closed';

  /**
   * Orientation of the hinge relative to the window.
   *
   * `'horizontal'` means the hinge runs left-to-right, splitting the window into
   * a top and a bottom half. `'vertical'` means it runs top-to-bottom, splitting
   * the window into a left and a right half.
   *
   * Omitted when the device reports no folding feature.
   *
   * @since 0.0.1
   */
  hingeOrientation?: 'horizontal' | 'vertical';

  /**
   * The region of the window that the hinge fully occludes, in CSS pixels
   * relative to the top-left of the window, so it can be compared directly
   * against layout coordinates.
   *
   * Only present when the hinge physically covers part of the display (Android's
   * `OcclusionType.FULL`). A seamless folding display reports no occluded bounds
   * even while it is half-opened.
   *
   * @since 0.0.1
   */
  occludedBounds?: { x: number; y: number; width: number; height: number };
}

export interface FoldablePlugin {
  /**
   * Read the current fold state of the device.
   *
   * Resolves with `{ state: 'flat' }` on devices and platforms that expose no
   * fold information.
   *
   * @since 0.0.1
   */
  getFoldState(): Promise<FoldState>;

  /**
   * Listen for changes to the fold state, such as the user opening, closing, or
   * partially folding the device, or rotating it so the hinge changes orientation.
   *
   * @since 0.0.1
   */
  addListener(eventName: 'foldStateChange', listenerFunc: (state: FoldState) => void): Promise<PluginListenerHandle>;
}
