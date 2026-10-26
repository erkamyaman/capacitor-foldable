// docgen finds its sections by the <docgen-index> and <docgen-api> tags, but Jekyll's
// Markdown parser leaves everything inside an unknown HTML tag unrendered. So docs/api.md
// keeps the markers as HTML comments, and this swaps them to tags only while docgen runs.
//
//   node scripts/docs-api.mjs open    comments -> tags (before docgen)
//   node scripts/docs-api.mjs close   tags -> comments (after docgen)
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../docs/api.md', import.meta.url);
const sections = ['index', 'api'];
const mode = process.argv[2];

if (mode !== 'open' && mode !== 'close') {
  console.error('usage: node scripts/docs-api.mjs open|close');
  process.exit(1);
}

let text = readFileSync(file, 'utf8');
for (const name of sections) {
  const pairs = [
    [`<!-- docgen-${name} -->`, `<docgen-${name}>`],
    [`<!-- /docgen-${name} -->`, `</docgen-${name}>`],
  ];
  for (const [comment, tag] of pairs) {
    text = mode === 'open' ? text.replaceAll(comment, tag) : text.replaceAll(tag, comment);
  }
}
writeFileSync(file, text);
