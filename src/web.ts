import { WebPlugin } from '@capacitor/core';

import type { FoldablePlugin, FoldState } from './definitions';

export class FoldableWeb extends WebPlugin implements FoldablePlugin {
  async isDeviceFoldable(): Promise<{ foldable: boolean }> {
    return { foldable: false };
  }

  async getFoldState(): Promise<FoldState> {
    return { state: 'flat' };
  }
}
