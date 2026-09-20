/**
 * Know when the phone is moving.
 *
 * `foldingChange` fires as the hinge starts moving and again when it settles,
 * so an app can pause animations while the screen is in motion.
 */
export const foldingEvents = {
  id: 'folding-events',
  title: 'Folding events',
  summary: 'Pause an animation while the hinge moves.',

  run(stage, Foldable) {
    stage.innerHTML = `
      <div class="card">
        <p class="big" id="state">still</p>
        <div id="spinner"></div>
        <p class="hint">The spinner stops while you fold, and counts the folds.</p>
      </div>
      <div class="card"><ul id="log" class="readout"></ul></div>
      <style>
        #spinner {
          width: 56px;
          height: 56px;
          margin: 14px 0;
          border-radius: 14px;
          background: var(--accent);
          animation: spin 1.6s linear infinite;
        }
        .folding #spinner { animation-play-state: paused; opacity: 0.4; }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    `;

    const state = stage.querySelector('#state');
    const log = stage.querySelector('#log');
    let folds = 0;

    let handle;
    void (async () => {
      handle = await Foldable.addListener('foldingChange', ({ folding }) => {
        state.textContent = folding ? 'folding' : 'still';
        if (!folding) folds += 1;
        log.innerHTML = `<dt>folds</dt><dd>${folds}</dd><dt>now</dt><dd>${folding ? 'moving' : 'settled'}</dd>`;
      });
    })();

    return () => void handle?.remove();
  },
};
