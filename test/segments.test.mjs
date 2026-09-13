import assert from 'node:assert/strict';
import { test } from 'node:test';

import { splitViewport } from '../src/segments.ts';

const WIDTH = 800;
const HEIGHT = 600;
const whole = [{ x: 0, y: 0, width: WIDTH, height: HEIGHT }];

const verticalFold = (hingeBounds, isSeparating = true) => ({
  state: 'half-opened',
  isSeparating,
  hingeOrientation: 'vertical',
  hingeBounds,
});

test('returns the whole viewport when there is no fold', () => {
  assert.deepEqual(splitViewport(null, WIDTH, HEIGHT), whole);
  assert.deepEqual(splitViewport({ state: 'flat', isSeparating: false }, WIDTH, HEIGHT), whole);
});

test('returns the whole viewport when the fold does not separate', () => {
  const fold = verticalFold({ x: 400, y: 0, width: 0, height: HEIGHT }, false);
  assert.deepEqual(splitViewport(fold, WIDTH, HEIGHT), whole);
});

test('splits left and right at a seamless vertical fold', () => {
  const fold = verticalFold({ x: 400, y: 0, width: 0, height: HEIGHT });
  assert.deepEqual(splitViewport(fold, WIDTH, HEIGHT), [
    { x: 0, y: 0, width: 400, height: HEIGHT },
    { x: 400, y: 0, width: 400, height: HEIGHT },
  ]);
});

test('splits top and bottom around a horizontal hinge gap', () => {
  const fold = {
    state: 'flat',
    isSeparating: true,
    hingeOrientation: 'horizontal',
    hingeBounds: { x: 0, y: 290, width: WIDTH, height: 20 },
  };
  assert.deepEqual(splitViewport(fold, WIDTH, HEIGHT), [
    { x: 0, y: 0, width: WIDTH, height: 290 },
    { x: 0, y: 310, width: WIDTH, height: 290 },
  ]);
});

test('ignores a hinge that does not span the viewport', () => {
  const fold = verticalFold({ x: 400, y: 100, width: 0, height: 200 });
  assert.deepEqual(splitViewport(fold, WIDTH, HEIGHT), whole);
});

test('ignores a hinge on or outside the viewport edge', () => {
  assert.deepEqual(splitViewport(verticalFold({ x: 0, y: 0, width: 0, height: HEIGHT }), WIDTH, HEIGHT), whole);
  assert.deepEqual(splitViewport(verticalFold({ x: WIDTH, y: 0, width: 0, height: HEIGHT }), WIDTH, HEIGHT), whole);
});

test('tolerates one pixel of rounding where the hinge meets the edges', () => {
  const fold = verticalFold({ x: 400, y: 1, width: 0, height: HEIGHT - 2 });
  assert.deepEqual(splitViewport(fold, WIDTH, HEIGHT), [
    { x: 0, y: 0, width: 400, height: HEIGHT },
    { x: 400, y: 0, width: 400, height: HEIGHT },
  ]);
});
