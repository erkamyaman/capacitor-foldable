import { Capacitor } from '@capacitor/core';

import type { FoldablePlugin, FoldState } from './definitions';
import { splitViewport } from './segments';

type DevicePostureType = 'continuous' | 'folded';

declare global {
  interface DevicePosture extends EventTarget {
    readonly type: DevicePostureType;
    onchange: ((this: DevicePosture, event: Event) => unknown) | null;
  }

  interface Viewport {
    readonly segments: readonly DOMRect[];
  }

  interface Navigator {
    readonly devicePosture: DevicePosture;
  }

  interface Window {
    readonly viewport: Viewport;
  }
}

class DevicePosturePolyfill extends EventTarget implements DevicePosture {
  onchange: ((this: DevicePosture, event: Event) => unknown) | null = null;

  private current: DevicePostureType = 'continuous';

  get type(): DevicePostureType {
    return this.current;
  }

  update(type: DevicePostureType): void {
    if (type === this.current) return;

    this.current = type;
    const event = new Event('change');
    this.onchange?.call(this, event);
    this.dispatchEvent(event);
  }
}

export async function install(plugin: FoldablePlugin): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  let fold: FoldState | null = null;

  const needsViewport = !('Viewport' in window);
  if (needsViewport) {
    Object.defineProperty(window, 'viewport', {
      configurable: true,
      value: {
        get segments() {
          return Object.freeze(
            splitViewport(fold, window.innerWidth, window.innerHeight).map(
              (rect) => new DOMRect(rect.x, rect.y, rect.width, rect.height),
            ),
          );
        },
      },
    });
  }

  const posture = 'DevicePosture' in window ? null : new DevicePosturePolyfill();
  if (posture) {
    Object.defineProperty(navigator, 'devicePosture', { configurable: true, value: posture });
  }

  if (!needsViewport && !posture) return;

  const apply = (next: FoldState) => {
    fold = next;
    posture?.update(next.state === 'half-opened' ? 'folded' : 'continuous');
  };

  await plugin.addListener('foldStateChange', apply);
  apply(await plugin.getFoldState());
}
