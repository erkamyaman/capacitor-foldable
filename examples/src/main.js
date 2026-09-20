import { Foldable, installFoldablePolyfill } from '@erkamyaman/capacitor-foldable';

import { hingeAngle } from './demos/hinge-angle.js';
import { reservedRegions } from './demos/reserved-regions.js';
import { avoidCrease } from './demos/avoid-crease.js';
import { tabletop } from './demos/tabletop.js';
import { evenColumns } from './demos/even-columns.js';
import { verticalBars } from './demos/vertical-bars.js';
import { foldingEvents } from './demos/folding-events.js';
import { sizeClasses } from './demos/size-classes.js';

/** Every demo: one file, one idea. */
const DEMOS = [
  hingeAngle,
  reservedRegions,
  avoidCrease,
  tabletop,
  evenColumns,
  verticalBars,
  foldingEvents,
  sizeClasses,
];

const head = document.getElementById('head');
const listPane = document.getElementById('list');
const demoPane = document.getElementById('demo');

let stop = null;
let badgeText = '—';
const metas = new Set();

/** The page title, the angle readout, and on a demo a way back. */
const heading = (text, { up }) => {
  const node = head.content.firstElementChild.cloneNode(true);
  node.querySelector('h1').textContent = text;
  const line = node.querySelector('p');
  line.textContent = badgeText;
  metas.add(line);
  if (!up) node.querySelector('.up').remove();
  return node;
};

const renderList = (current) => {
  const list = document.createElement('ul');
  list.className = 'list';
  for (const demo of DEMOS) {
    const item = document.createElement('li');
    const here = demo === current ? ' aria-current="page"' : '';
    item.innerHTML = `<a href="#/${demo.id}"${here}><h2>${demo.title}</h2><p>${demo.summary}</p></a>`;
    list.append(item);
  }

  listPane.replaceChildren(heading('Foldable Examples', { up: false }), list);
};

const renderDemo = (demo) => {
  const body = document.createElement('div');
  demoPane.replaceChildren(heading(demo.title, { up: true }), body);
  stop = demo.run(body, Foldable) ?? null;
};

const renderPrompt = () => {
  const hint = document.createElement('p');
  hint.className = 'prompt';
  hint.textContent = 'Pick an example on the left page.';
  demoPane.replaceChildren(hint);
};

const route = () => {
  stop?.();
  stop = null;
  metas.clear();

  const id = location.hash.replace('#/', '');
  const demo = DEMOS.find((entry) => entry.id === id);

  document.body.classList.toggle('demo-open', Boolean(demo));
  document.body.classList.toggle('demo-wide', Boolean(demo?.wide));

  renderList(demo);
  if (demo) renderDemo(demo);
  else renderPrompt();
};

window.addEventListener('hashchange', route);

const setBadge = (text) => {
  badgeText = text;
  for (const line of metas) line.textContent = text;
};

const showDevice = async () => {
  const { foldable } = await Foldable.isDeviceFoldable();
  const { angle } = await Foldable.getHingeAngle();
  setBadge(foldable ? `foldable · ${angle === null ? 'no sensor' : `${Math.round(angle)}°`}` : 'no hinge');
};

await installFoldablePolyfill({ ionicKeyboard: true });
await Foldable.addListener('hingeAngleChange', ({ angle }) => {
  setBadge(`foldable · ${Math.round(angle)}°`);
});
await showDevice();
route();
