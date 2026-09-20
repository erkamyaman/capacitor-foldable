import { Foldable, installFoldablePolyfill } from '@erkamyaman/capacitor-foldable';

const TAG = '[foldable]';

const $ = (id) => document.getElementById(id);
const els = {
  foldable: $('foldable'),
  state: $('state'),
  orientation: $('orientation'),
  hingeBounds: $('hingeBounds'),
  bounds: $('bounds'),
  sizeClass: $('sizeClass'),
  barPlacement: $('barPlacement'),
  rearDisplay: $('rearDisplay'),
  dualScreen: $('dualScreen'),
  angle: $('angle'),
  posture: $('posture'),
  segments: $('segments'),
  window: $('window'),
  keyboard: $('keyboard'),
  rotation: $('rotation'),
  log: $('log'),
  hingeStatus: $('hingeStatus'),
  hingeMargins: $('hingeMargins'),
  regions: $('regions'),
  history: $('history'),
  historyHint: $('historyHint'),
  sent: $('sent'),
  hinge: $('hinge'),
  layoutNote: $('layoutNote'),
};

let foldEvents = 0;
let sentCount = 0;

function describe(fold) {
  return [
    `state=${fold.state}`,
    `hingeOrientation=${fold.hingeOrientation ?? 'none'}`,
    fold.hingeBounds
      ? `hingeBounds=${fold.hingeBounds.x},${fold.hingeBounds.y} ${fold.hingeBounds.width}x${fold.hingeBounds.height}`
      : 'hingeBounds=none',
    fold.occludedBounds
      ? `occludedBounds=${fold.occludedBounds.x},${fold.occludedBounds.y} ${fold.occludedBounds.width}x${fold.occludedBounds.height}`
      : 'occludedBounds=none',
    `activeDisplay=${fold.activeDisplay ?? 'none'}`,
    `window=${window.innerWidth}x${window.innerHeight}`,
  ].join(' ');
}

function applyLayout(fold) {
  const tabletop = fold.state === 'half-opened' && fold.hingeOrientation === 'horizontal';
  const book = fold.state === 'half-opened' && fold.hingeOrientation === 'vertical';

  document.body.classList.toggle('tabletop', tabletop);
  document.body.classList.toggle('book', book);

  els.layoutNote.textContent = tabletop
    ? 'Tabletop: readout above the crease, compose below.'
    : book
      ? 'Book: readout left of the crease, compose right.'
      : 'Flat: single column. Fold to 90° to split.';

  console.log(TAG, `layout=${tabletop ? 'tabletop' : book ? 'book' : 'single-column'}`);
}

function render(fold) {
  els.state.textContent = `${fold.state} · ${fold.posture}`;
  els.orientation.textContent = fold.hingeOrientation ?? '—';
  els.window.textContent = `${window.innerWidth} × ${window.innerHeight}`;

  const h = fold.hingeBounds;
  els.hingeBounds.textContent = h ? `x ${h.x}, y ${h.y}, ${h.width} × ${h.height}` : '—';

  const b = fold.occludedBounds;
  els.bounds.textContent = b ? `x ${b.x}, y ${b.y}, ${b.width} × ${b.height}` : '—';

  els.hinge.hidden = !b;
  if (b) {
    Object.assign(els.hinge.style, {
      left: `${b.x}px`,
      top: `${b.y}px`,
      width: `${b.width}px`,
      height: `${b.height}px`,
    });
  }

  const margins = fold.hingeMargins;
  els.hingeMargins.textContent = margins
    ? `${margins.top}, ${margins.right}, ${margins.bottom}, ${margins.left}`
    : '—';

  applyLayout(fold);
  renderWebApis();
  void renderRegions();
}

function renderWebApis() {
  els.posture.textContent = navigator.devicePosture?.type ?? 'unavailable';

  const segments = window.viewport?.segments;
  els.segments.textContent = segments
    ? segments.map((s) => `${Math.round(s.x)},${Math.round(s.y)} ${Math.round(s.width)}×${Math.round(s.height)}`).join(' | ')
    : 'unavailable';
}

function logFold(fold) {
  if (foldEvents === 0) els.log.textContent = '';
  const item = document.createElement('li');
  const time = document.createElement('time');
  time.textContent = new Date().toLocaleTimeString();
  item.append(time, `${fold.state}${fold.hingeOrientation ? ` · ${fold.hingeOrientation}` : ''}`);
  els.log.prepend(item);
  foldEvents += 1;
}

$('send').addEventListener('click', () => {
  const payload = {
    name: $('name').value.trim(),
    email: $('email').value.trim(),
    topic: $('topic').value,
    message: $('message').value.trim(),
  };
  console.log(TAG, 'submit:', JSON.stringify(payload));

  if (sentCount === 0) els.sent.textContent = '';
  const item = document.createElement('li');
  const time = document.createElement('time');
  time.textContent = new Date().toLocaleTimeString();
  item.append(time, `${payload.topic} · ${payload.name || 'anonymous'} · ${payload.message.length} chars`);
  els.sent.prepend(item);
  sentCount += 1;

  $('message').value = '';
  $('message').blur();
});

$('clear').addEventListener('click', () => {
  for (const id of ['name', 'email', 'message']) $(id).value = '';
  console.log(TAG, 'form cleared');
});

window.visualViewport?.addEventListener('resize', () => {
  const inset = Math.round(window.innerHeight - window.visualViewport.height);
  const open = inset > 80;
  els.keyboard.textContent = open ? `open · ${inset}px inset` : 'closed';
  console.log(TAG, `keyboard ${open ? 'open' : 'closed'} inset=${inset} visualViewport=${Math.round(window.visualViewport.width)}x${Math.round(window.visualViewport.height)}`);
});

const { foldable, supportsTabletop } = await Foldable.isDeviceFoldable();
els.foldable.textContent = foldable ? `yes${supportsTabletop ? ' · tabletop capable' : ''}` : 'no';
console.log(TAG, `isDeviceFoldable() → ${foldable}`);

await installFoldablePolyfill();
console.log(TAG, `polyfill installed: devicePosture=${navigator.devicePosture?.type} segments=${window.viewport?.segments.length}`);
navigator.devicePosture?.addEventListener('change', () => {
  console.log(TAG, `devicePosture change → ${navigator.devicePosture.type} segments=${window.viewport.segments.length}`);
  renderWebApis();
});

const renderSizeClass = ({ horizontal, vertical }) => {
  els.sizeClass.textContent = `${horizontal} width · ${vertical} height`;
};

const sizeClass = await Foldable.getSizeClass();
console.log(TAG, `getSizeClass() → ${JSON.stringify(sizeClass)}`);
renderSizeClass(sizeClass);

await Foldable.addListener('sizeClassChange', (next) => {
  console.log(TAG, `sizeClassChange: ${JSON.stringify(next)}`);
  renderSizeClass(next);
});

const renderBarPlacement = ({ verticalBarEdge }) => {
  els.barPlacement.textContent = verticalBarEdge ? `vertical · ${verticalBarEdge}` : 'horizontal';
};

const barPlacement = await Foldable.getBarPlacement();
console.log(TAG, `getBarPlacement() → ${JSON.stringify(barPlacement)}`);
renderBarPlacement(barPlacement);

await Foldable.addListener('barPlacementChange', (next) => {
  console.log(TAG, `barPlacementChange: ${JSON.stringify(next)}`);
  renderBarPlacement(next);
});

const renderRegions = async () => {
  const { regions } = await Foldable.getReservedRegions();
  console.log(TAG, `getReservedRegions() → ${JSON.stringify(regions)}`);

  els.regions.textContent = '';
  if (regions.length === 0) {
    els.regions.innerHTML = '<li>none</li>';
    return;
  }

  for (const region of regions) {
    const item = document.createElement('li');
    const margins = Object.values(region.margins).some(Boolean)
      ? ` · margins ${region.margins.top},${region.margins.right},${region.margins.bottom},${region.margins.left}`
      : '';
    item.textContent = `${region.kind} · ${region.isActive ? 'active' : 'inactive'} · ${region.x},${region.y} ${region.width}×${region.height}${margins}`;
    els.regions.append(item);
  }
};

await renderRegions();

let barsDisabled = false;
$('bars').addEventListener('click', async () => {
  barsDisabled = !barsDisabled;
  const { applied } = await Foldable.setVerticalBarBehavior({
    behavior: barsDisabled ? 'disabled' : 'automatic',
  });
  $('bars').textContent = applied
    ? `Bars: ${barsDisabled ? 'horizontal' : 'automatic'}`
    : 'Bars: not available';
  console.log(TAG, `setVerticalBarBehavior(${barsDisabled ? 'disabled' : 'automatic'}) → ${applied}`);
});

/** Draws the last few seconds of hinge angles. */
const angles = [];
const drawHistory = (value) => {
  angles.push(value);
  if (angles.length > 180) angles.shift();

  const canvas = els.history;
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 2;
  ctx.beginPath();
  angles.forEach((angle, index) => {
    const x = (index / Math.max(angles.length - 1, 1)) * width;
    const y = height - (angle / 180) * height;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  els.historyHint.textContent = `${angles.length} samples · 0° bottom, 180° top`;
};

const { angle, status } = await Foldable.getHingeAngle();
els.hingeStatus.textContent = status ?? '—';
console.log(TAG, `getHingeAngle() → ${angle}`);
els.angle.textContent = angle === null ? 'no sensor' : `${angle.toFixed(2)}°`;

await Foldable.addListener('foldingChange', ({ folding }) => {
  console.log(TAG, `foldingChange: ${folding}`);
  document.documentElement.classList.toggle('folding', folding);
});

await Foldable.addListener('hingeAngleChange', async (event) => {
  els.angle.textContent = `${event.angle.toFixed(2)}°`;
  drawHistory(event.angle);
  const { status: next } = await Foldable.getHingeAngle();
  els.hingeStatus.textContent = next ?? '—';
});

const renderDisplayModes = ({ rearDisplay, dualScreen }) => {
  els.rearDisplay.textContent = rearDisplay;
  els.dualScreen.textContent = dualScreen;
};

renderDisplayModes(await Foldable.getDisplayModes());
await Foldable.addListener('displayModeChange', (modes) => {
  console.log(TAG, `displayModeChange: ${JSON.stringify(modes)}`);
  renderDisplayModes(modes);
});

$('rear').addEventListener('click', async () => {
  const { rearDisplay } = await Foldable.getDisplayModes();
  try {
    await (rearDisplay === 'active' ? Foldable.stopRearDisplay() : Foldable.startRearDisplay());
  } catch (err) {
    console.error(TAG, 'rear display:', err?.message ?? err);
  }
});

const coverPage = `data:text/html,${encodeURIComponent(
  '<h1 style="font:600 40px system-ui;text-align:center;margin-top:40vh">Hello from the outer display</h1>',
)}`;

$('dual').addEventListener('click', async () => {
  const { dualScreen } = await Foldable.getDisplayModes();
  try {
    await (dualScreen === 'active' ? Foldable.stopDualScreen() : Foldable.startDualScreen({ url: coverPage }));
  } catch (err) {
    console.error(TAG, 'dual screen:', err?.message ?? err);
  }
});

console.log(TAG, 'booting, calling getFoldState()');

try {
  const initial = await Foldable.getFoldState();
  console.log(TAG, 'getFoldState() resolved:', describe(initial));
  render(initial);
} catch (err) {
  console.error(TAG, 'getFoldState() rejected:', err?.message ?? err);
}

await Foldable.addListener('foldStateChange', (fold) => {
  console.log(TAG, 'foldStateChange:', describe(fold));
  render(fold);
  logFold(fold);
});
console.log(TAG, 'listener registered');

function readRotation() {
  const o = screen.orientation;
  return o ? { angle: o.angle, type: o.type } : { angle: null, type: 'unavailable' };
}

function renderRotation() {
  const { angle, type } = readRotation();
  els.rotation.textContent = `${angle}° · ${type}`;
  return { angle, type };
}

screen.orientation?.addEventListener('change', () => {
  const { angle, type } = renderRotation();
  console.log(TAG, `orientationchange: angle=${angle} type=${type} window=${window.innerWidth}x${window.innerHeight}`);

  Foldable.getFoldState().then((fold) => {
    console.log(TAG, `  after rotation → ${describe(fold)}`);
    render(fold);
  });
});

window.addEventListener('orientationchange', () => {
  console.log(TAG, `legacy orientationchange: window.orientation=${window.orientation}`);
});

window.addEventListener('resize', () => {
  els.window.textContent = `${window.innerWidth} × ${window.innerHeight}`;
  renderWebApis();
});

const boot = renderRotation();
console.log(TAG, `rotation at boot: angle=${boot.angle} type=${boot.type}`);
