import { registerPlugin } from '@capacitor/core';

import type { FoldablePlugin } from './definitions';

const Foldable = registerPlugin<FoldablePlugin>('Foldable', {
  web: () => import('./web').then((m) => new m.FoldableWeb()),
});

export * from './definitions';
export { Foldable };
