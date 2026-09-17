import assert from 'node:assert/strict';
import { test } from 'node:test';

import { barClassFor, cssFor } from '../src/css.ts';

test('a vertical bar edge maps to its class, and no edge to none', () => {
  assert.equal(barClassFor('leading'), 'vertical-bars-leading');
  assert.equal(barClassFor('trailing'), 'vertical-bars-trailing');
  assert.equal(barClassFor(null), null);
});

test('one segment sets the 0-0 variables and the posture class', () => {
  const { variables, classes } = cssFor([{ x: 0, y: 0, width: 800, height: 600 }], 'continuous');

  assert.equal(Object.keys(variables).length, 6);
  assert.equal(variables['--viewport-segment-width-0-0'], '800px');
  assert.equal(variables['--viewport-segment-bottom-0-0'], '600px');
  assert.deepEqual(classes, ['device-posture-continuous']);
});

test('side-by-side segments are indexed along x', () => {
  const { variables, classes } = cssFor(
    [
      { x: 0, y: 0, width: 400, height: 600 },
      { x: 420, y: 0, width: 380, height: 600 },
    ],
    'folded',
  );

  assert.equal(variables['--viewport-segment-right-0-0'], '400px');
  assert.equal(variables['--viewport-segment-left-1-0'], '420px');
  assert.equal(variables['--viewport-segment-width-1-0'], '380px');
  assert.deepEqual(classes, ['device-posture-folded', 'horizontal-viewport-segments-2']);
});

test('stacked segments are indexed along y', () => {
  const { variables, classes } = cssFor(
    [
      { x: 0, y: 0, width: 800, height: 290 },
      { x: 0, y: 310, width: 800, height: 290 },
    ],
    'folded',
  );

  assert.equal(variables['--viewport-segment-bottom-0-0'], '290px');
  assert.equal(variables['--viewport-segment-top-0-1'], '310px');
  assert.deepEqual(classes, ['device-posture-folded', 'vertical-viewport-segments-2']);
});
