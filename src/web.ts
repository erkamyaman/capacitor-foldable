import { WebPlugin } from '@capacitor/core';

import type { FoldablePlugin, FoldState, SizeClass } from './definitions';
import { sizeClassOf } from './size-class';

export class FoldableWeb extends WebPlugin implements FoldablePlugin {
  private sizeClass = sizeClassOf(window.innerWidth, window.innerHeight);

  constructor() {
    super();
    window.addEventListener('resize', () => {
      const next = sizeClassOf(window.innerWidth, window.innerHeight);
      if (next.horizontal === this.sizeClass.horizontal && next.vertical === this.sizeClass.vertical) return;

      this.sizeClass = next;
      this.notifyListeners('sizeClassChange', next);
    });
  }

  async isDeviceFoldable(): Promise<{ foldable: boolean }> {
    return { foldable: false };
  }

  async getFoldState(): Promise<FoldState> {
    return { state: 'flat', isSeparating: false };
  }

  async getHingeAngle(): Promise<{ angle: number | null }> {
    return { angle: null };
  }

  async getSizeClass(): Promise<SizeClass> {
    return sizeClassOf(window.innerWidth, window.innerHeight);
  }
}
