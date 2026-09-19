import { Capacitor } from '@capacitor/core';

import {
  BAR_CLASSES,
  barClassFor,
  CSS_CLASSES,
  cssFor,
  FOLD_CLASSES,
  FOLD_VARIABLES,
  foldCssFor,
  verticalTabBarBottom,
} from './css';
import type { BarPlacement, FoldablePlugin, FoldablePolyfillOptions, FoldState } from './definitions';
import { takeOverKeyboard } from './keyboard';
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

const postureOf = (fold: FoldState | null): DevicePostureType =>
  fold?.state === 'half-opened' ? 'folded' : 'continuous';

let installation: Promise<void> | null = null;

export function install(plugin: FoldablePlugin, options: FoldablePolyfillOptions = {}): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();

  installation ??= run(plugin, options);
  return installation;
}

async function run(plugin: FoldablePlugin, options: FoldablePolyfillOptions): Promise<void> {
  if (options.ionicKeyboard) takeOverKeyboard(window, document);

  let fold: FoldState | null = null;
  const currentSegments = () => splitViewport(fold, window.innerWidth, window.innerHeight);

  if (!('Viewport' in window)) {
    Object.defineProperty(window, 'viewport', {
      configurable: true,
      value: {
        get segments() {
          return Object.freeze(currentSegments().map((rect) => new DOMRect(rect.x, rect.y, rect.width, rect.height)));
        },
      },
    });
  }

  const posture = 'DevicePosture' in window ? null : new DevicePosturePolyfill();
  if (posture) {
    Object.defineProperty(navigator, 'devicePosture', { configurable: true, value: posture });
  }

  const root = document.documentElement;
  let variables: string[] = [];

  const applyCss = () => {
    const css = cssFor(currentSegments(), postureOf(fold));
    for (const name of variables) root.style.removeProperty(name);
    variables = Object.keys(css.variables);
    for (const name of variables) root.style.setProperty(name, css.variables[name]);
    for (const name of CSS_CLASSES) root.classList.toggle(name, css.classes.includes(name));
    const foldCss = foldCssFor(fold?.hingeBounds, fold?.hingeOrientation);
    for (const name of FOLD_VARIABLES) {
      if (foldCss.variables[name]) root.style.setProperty(name, foldCss.variables[name]);
      else root.style.removeProperty(name);
    }
    for (const name of FOLD_CLASSES) root.classList.toggle(name, name === foldCss.className);
    root.style.setProperty(
      '--vertical-tab-bar-bottom',
      `${verticalTabBarBottom(fold?.cameraBounds ?? [], window.innerHeight)}px`,
    );
  };

  const apply = (next: FoldState) => {
    fold = next;
    posture?.update(postureOf(next));
    applyCss();
  };

  const applyBars = ({ verticalBarEdge }: BarPlacement) => {
    const active = barClassFor(verticalBarEdge);
    for (const name of BAR_CLASSES) root.classList.toggle(name, name === active);
  };

  window.addEventListener('resize', applyCss);
  await plugin.addListener('foldStateChange', apply);
  await plugin.addListener('barPlacementChange', applyBars);
  apply(await plugin.getFoldState());
  applyBars(await plugin.getBarPlacement());
}
