import { WebPlugin } from '@capacitor/core';

import type { FoldablePlugin } from './definitions';

export class FoldableWeb extends WebPlugin implements FoldablePlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
