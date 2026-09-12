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
   * Direction of the hinge relative to the window, so it flips when the device
   * rotates. Omitted when there is no fold.
   *
   * @since 0.0.1
   */
  hingeOrientation?: 'horizontal' | 'vertical';

  /**
   * Area of the window the hinge covers, in CSS pixels. Only present on devices
   * with a physical gap.
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
   * Read the current fold state. Resolves to `{ state: 'flat' }` when there is
   * no fold information.
   *
   * @since 0.0.1
   */
  getFoldState(): Promise<FoldState>;

  /**
   * Listen for fold state changes. Does not fire on rotation.
   *
   * @since 0.0.1
   */
  addListener(eventName: 'foldStateChange', listenerFunc: (state: FoldState) => void): Promise<PluginListenerHandle>;
}
