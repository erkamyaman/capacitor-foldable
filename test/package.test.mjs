import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

test('the built package loads through its import condition', async () => {
  const plugin = await import('@erkamyaman/capacitor-foldable');
  assert.equal(typeof plugin.installFoldablePolyfill, 'function');
  assert.ok(plugin.Foldable);
});

test('the built package loads through its require condition', () => {
  const plugin = createRequire(import.meta.url)('@erkamyaman/capacitor-foldable');
  assert.equal(typeof plugin.installFoldablePolyfill, 'function');
  assert.ok(plugin.Foldable);
});
