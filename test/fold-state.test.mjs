import assert from 'node:assert/strict';
import { test } from 'node:test';

import { foldCssFor } from '../src/css.ts';
import { splitViewport } from '../src/segments.ts';

const hingeBounds = { x: 456, y: 0, width: 40, height: 669 };

test('hinge bounds keep the rectangle shape the Ionic theme reads', () => {
  const { variables, className } = foldCssFor(hingeBounds, 'vertical');

  assert.deepEqual(Object.keys(hingeBounds).sort(), ['height', 'width', 'x', 'y']);
  assert.equal(className, 'fold-vertical');
  assert.equal(variables['--fold-left'], '456px');
  assert.equal(variables['--fold-width'], '40px');
});

test('a fold reported on the outer display does not split the viewport', () => {
  const outer = { state: 'flat', isSeparating: false, posture: 'flat', hingeBounds, activeDisplay: 'outer' };
  const onOuterDisplay = outer.activeDisplay === 'outer' ? null : outer;

  assert.equal(onOuterDisplay, null);
  assert.deepEqual(splitViewport(onOuterDisplay, 466, 678), [{ x: 0, y: 0, width: 466, height: 678 }]);
});
