/**
 * Line a grid up with the fold.
 *
 * The fold is reported even when the phone is flat, so a grid can put its
 * gutter on the crease instead of a column.
 */
export const evenColumns = {
  id: 'even-columns',
  title: 'Even columns',
  summary: 'Put the grid gutter on the crease, even when flat.',
  wide: true,

  run(stage) {
    const tiles = Array.from({ length: 12 }, (_, index) => `<div class="tile">${index + 1}</div>`).join('');
    stage.innerHTML = `
      <div class="card">
        <div id="grid">${tiles}</div>
      </div>
      <p class="hint">With a fold, the grid splits at the crease. Without one, it is a plain two-column grid.</p>
      <style>
        #grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .tile {
          display: grid;
          place-items: center;
          height: 64px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--accent) 18%, transparent);
          font-weight: 650;
        }
        .fold-vertical #grid {
          grid-template-columns: repeat(2, calc((var(--fold-left) - 20px) / 2)) var(--fold-width) repeat(2, 1fr);
          gap: 10px 0;
        }
        .fold-vertical .tile { margin: 0 5px; }
        .fold-vertical #grid::before { content: ''; grid-row: 1 / -1; grid-column: 3; }
      </style>
    `;
  },
};
