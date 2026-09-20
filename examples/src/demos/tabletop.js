/**
 * Tabletop and book.
 *
 * `posture` says how the phone is held: `flat`, `tabletop` (hinge across, like
 * a laptop) or `book` (hinge down the middle).
 */
export const tabletop = {
  id: 'tabletop',
  title: 'Tabletop and book',
  summary: 'Move controls below the crease in tabletop, beside it in book.',
  wide: true,

  run(stage, Foldable) {
    stage.innerHTML = `
      <div class="card">
        <p class="big" id="posture">—</p>
        <p class="hint" id="detail">Fold the phone to about 90°.</p>
      </div>
      <div class="card" id="player">
        <div id="art" style="height: 120px; border-radius: 10px; background: linear-gradient(135deg, #0f766e, #334155)"></div>
        <div class="row" style="display: flex; gap: 8px; margin-top: 12px">
          <button type="button">Play</button>
          <button type="button" class="ghost">Skip</button>
        </div>
      </div>
    `;

    const posture = stage.querySelector('#posture');
    const detail = stage.querySelector('#detail');

    const show = (fold) => {
      posture.textContent = `${fold.state} · ${fold.posture}`;
      detail.textContent = fold.hingeBounds
        ? `fold at ${fold.hingeBounds.x},${fold.hingeBounds.y}, ${fold.hingeOrientation}`
        : 'no fold on this display';
    };

    let handle;
    void (async () => {
      show(await Foldable.getFoldState());
      handle = await Foldable.addListener('foldStateChange', show);
    })();

    return () => void handle?.remove();
  },
};
