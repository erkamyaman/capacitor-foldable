import assert from 'node:assert/strict';
import { test } from 'node:test';

import { KEYBOARD_CLASS, takeOverKeyboard } from '../src/keyboard.ts';

const setup = () => {
  const classes = new Set();
  const doc = {
    activeElement: null,
    documentElement: {
      classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) },
    },
  };
  const target = new EventTarget();
  takeOverKeyboard(target, doc);

  const reached = [];
  for (const name of ['keyboardWillShow', 'keyboardDidShow', 'ionKeyboardDidShow', 'keyboardWillHide']) {
    target.addEventListener(name, () => reached.push(name));
  }
  return { classes, doc, target, reached };
};

test('a keyboard with no focused field is ignored and never reaches later listeners', () => {
  const { classes, target, reached } = setup();

  target.dispatchEvent(new Event('keyboardWillShow'));
  target.dispatchEvent(new Event('ionKeyboardDidShow'));

  assert.equal(classes.has(KEYBOARD_CLASS), false);
  assert.deepEqual(reached, []);
});

test('a keyboard for a focused field sets the class until it hides', () => {
  const { classes, doc, target, reached } = setup();
  doc.activeElement = { tagName: 'INPUT', isContentEditable: false };

  target.dispatchEvent(new Event('keyboardWillShow'));
  assert.equal(classes.has(KEYBOARD_CLASS), true);
  assert.deepEqual(reached, []);

  target.dispatchEvent(new Event('keyboardWillHide'));
  assert.equal(classes.has(KEYBOARD_CLASS), false);
  assert.deepEqual(reached, ['keyboardWillHide']);
});

test('contenteditable counts as a focused field', () => {
  const { classes, doc, target } = setup();
  doc.activeElement = { tagName: 'DIV', isContentEditable: true };

  target.dispatchEvent(new Event('keyboardDidShow'));
  assert.equal(classes.has(KEYBOARD_CLASS), true);
});
