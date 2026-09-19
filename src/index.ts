import { registerPlugin } from '@capacitor/core';

import type { FoldablePlugin, FoldablePolyfillOptions } from './definitions';
import { install } from './polyfill';

const Foldable = registerPlugin<FoldablePlugin>('Foldable', {
  web: () => import('./web').then((m) => new m.FoldableWeb()),
});

const installFoldablePolyfill = (options?: FoldablePolyfillOptions): Promise<void> => install(Foldable, options);

export * from './definitions';
export { Foldable, installFoldablePolyfill };
