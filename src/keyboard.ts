export const KEYBOARD_CLASS = 'foldable-keyboard-open';

const SHOW_EVENTS = ['keyboardWillShow', 'keyboardDidShow', 'ionKeyboardDidShow'];

interface KeyboardDocument {
  readonly activeElement: Element | null;
  readonly documentElement: { readonly classList: DOMTokenList };
}

const isEditing = (element: Element | null): boolean =>
  !!element &&
  ((element as HTMLElement).isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName));

export function takeOverKeyboard(target: EventTarget, doc: KeyboardDocument): void {
  const classes = doc.documentElement.classList;

  for (const name of SHOW_EVENTS) {
    target.addEventListener(
      name,
      (event) => {
        event.stopImmediatePropagation();
        if (isEditing(doc.activeElement)) classes.add(KEYBOARD_CLASS);
      },
      true,
    );
  }

  target.addEventListener('keyboardWillHide', () => classes.remove(KEYBOARD_CLASS), true);
}
