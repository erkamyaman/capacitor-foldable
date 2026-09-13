import { registerPlugin } from '@capacitor/core';

import type { FoldablePlugin } from './definitions';
import { install } from './polyfill';

const Foldable = registerPlugin<FoldablePlugin>('Foldable', {
  web: () => import('./web').then((m) => new m.FoldableWeb()),
});

const installFoldablePolyfill = (): Promise<void> => install(Foldable);

export * from './definitions';
export { Foldable, installFoldablePolyfill };
