import assert from 'node:assert/strict';
import { test } from 'node:test';

import { sizeClassOf } from '../src/size-class.ts';

test('a phone in portrait is compact width', () => {
  assert.deepEqual(sizeClassOf(412, 915), { horizontal: 'compact', vertical: 'regular' });
});

test('a phone in landscape is compact height', () => {
  assert.deepEqual(sizeClassOf(915, 412), { horizontal: 'regular', vertical: 'compact' });
});

test('an unfolded foldable is regular in both directions', () => {
  assert.deepEqual(sizeClassOf(673, 841), { horizontal: 'regular', vertical: 'regular' });
});

test('breakpoints are inclusive', () => {
  assert.deepEqual(sizeClassOf(600, 480), { horizontal: 'regular', vertical: 'regular' });
  assert.deepEqual(sizeClassOf(599.9, 479.9), { horizontal: 'compact', vertical: 'compact' });
});
