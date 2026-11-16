import { registerPlugin } from '@capacitor/core';

import type { FoldablePlugin, FoldablePolyfillOptions } from './definitions.js';
import { install } from './polyfill.js';

const Foldable = registerPlugin<FoldablePlugin>('Foldable', {
  web: () => import('./web.js').then((m) => new m.FoldableWeb()),
});

const installFoldablePolyfill = (options?: FoldablePolyfillOptions): Promise<void> => install(Foldable, options);

export * from './definitions.js';
export { Foldable, installFoldablePolyfill };
