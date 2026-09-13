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
}

export interface FoldablePlugin {
  /**
   * Whether the device has a fold at all. Always `false` on iOS and web.
   *
   * @since 0.0.1
   */
  isDeviceFoldable(): Promise<{ foldable: boolean }>;

  /**
   * Read the current fold state. Resolves to `{ state: 'flat', isSeparating: false }`
   * when there is no fold information.
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
}
