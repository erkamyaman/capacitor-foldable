import assert from 'node:assert/strict';
import { test } from 'node:test';

import { foldCssFor } from '../src/css.ts';

const hingeBounds = { x: 456, y: 0, width: 40, height: 669 };

test('hinge bounds keep the rectangle shape the Ionic theme reads', () => {
  const { variables, className } = foldCssFor(hingeBounds, 'vertical');

  assert.deepEqual(Object.keys(hingeBounds).sort(), ['height', 'width', 'x', 'y']);
  assert.equal(className, 'fold-vertical');
  assert.equal(variables['--fold-left'], '456px');
  assert.equal(variables['--fold-width'], '40px');
});
