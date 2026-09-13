import assert from 'node:assert/strict';
import { test } from 'node:test';

import { sizeClassOf } from '../src/size-class.ts';

const sizeClass = (horizontal, vertical, widthClass, heightClass) => ({
  horizontal,
  vertical,
  widthClass,
  heightClass,
});

test('a phone in portrait is compact width', () => {
  assert.deepEqual(sizeClassOf(412, 915), sizeClass('compact', 'regular', 'compact', 'expanded'));
});

test('a phone in landscape is compact height', () => {
  assert.deepEqual(sizeClassOf(915, 412), sizeClass('regular', 'compact', 'expanded', 'compact'));
});

test('iPhone Duo inner and outer displays', () => {
  assert.deepEqual(sizeClassOf(626, 890), sizeClass('regular', 'regular', 'medium', 'medium'));
  assert.deepEqual(sizeClassOf(466, 678), sizeClass('compact', 'regular', 'compact', 'medium'));
});

test('large and extra-large windows', () => {
  assert.deepEqual(sizeClassOf(1280, 800), sizeClass('regular', 'regular', 'large', 'medium'));
  assert.deepEqual(sizeClassOf(1920, 1080), sizeClass('regular', 'regular', 'extraLarge', 'expanded'));
});

test('breakpoints are inclusive', () => {
  assert.deepEqual(sizeClassOf(600, 480), sizeClass('regular', 'regular', 'medium', 'medium'));
  assert.deepEqual(sizeClassOf(840, 900), sizeClass('regular', 'regular', 'expanded', 'expanded'));
  assert.deepEqual(sizeClassOf(599.9, 479.9), sizeClass('compact', 'compact', 'compact', 'compact'));
});
