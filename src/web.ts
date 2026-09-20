import { WebPlugin } from '@capacitor/core';

import type { BarPlacement, DisplayModes, FoldablePlugin, FoldState, SizeClass } from './definitions';
import { sizeClassOf } from './size-class';

export class FoldableWeb extends WebPlugin implements FoldablePlugin {
  private sizeClass = sizeClassOf(window.innerWidth, window.innerHeight);

  constructor() {
    super();
    window.addEventListener('resize', () => {
      const next = sizeClassOf(window.innerWidth, window.innerHeight);
      if (JSON.stringify(next) === JSON.stringify(this.sizeClass)) return;

      this.sizeClass = next;
      this.notifyListeners('sizeClassChange', next);
    });
  }

  async isDeviceFoldable(): Promise<{ foldable: boolean; supportsTabletop: boolean }> {
    return { foldable: false, supportsTabletop: false };
  }

  async getFoldState(): Promise<FoldState> {
    return { state: 'flat', isSeparating: false, posture: 'flat' };
  }

  async setVerticalBarBehavior(): Promise<{ applied: boolean }> {
    return { applied: false };
  }

  async getReservedRegions(): Promise<{ regions: [] }> {
    return { regions: [] };
  }

  async getHingeAngle(): Promise<{ angle: number | null; status: null }> {
    return { angle: null, status: null };
  }

  async getSizeClass(): Promise<SizeClass> {
    return sizeClassOf(window.innerWidth, window.innerHeight);
  }

  async getDisplayModes(): Promise<DisplayModes> {
    return { rearDisplay: 'unsupported', dualScreen: 'unsupported' };
  }

  async getBarPlacement(): Promise<BarPlacement> {
    return { verticalBarEdge: null };
  }

  async startRearDisplay(): Promise<void> {
    throw this.unavailable('Rear display mode is only available on Android.');
  }

  stopRearDisplay(): Promise<void> {
    return Promise.resolve();
  }

  async startDualScreen(): Promise<void> {
    throw this.unavailable('Dual-screen mode is only available on Android.');
  }

  stopDualScreen(): Promise<void> {
    return Promise.resolve();
  }
}
