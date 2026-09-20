/**
 * Lay a page out around the crease.
 *
 * The polyfill sets `--fold-left` and `--fold-width` whenever the device
 * reports a fold, flat or half-open, so plain CSS can keep text off it.
 */
export const avoidCrease = {
  id: 'avoid-crease',
  title: 'Avoid the crease',
  summary: 'A two-page reader that keeps text off the fold.',
  wide: true,

  run(stage) {
    stage.innerHTML = `
      <div class="card" id="reader">
        <div class="page">
          <h2>Left page</h2>
          <p>Fold the phone. This column stops where the crease starts, using <code>--fold-left</code>.</p>
        </div>
        <div class="page">
          <h2>Right page</h2>
          <p>And this one starts after it, using <code>calc(var(--fold-left) + var(--fold-width))</code>.</p>
        </div>
      </div>
      <style>
        #reader { display: grid; gap: 12px; }
        .fold-vertical #reader {
          position: fixed;
          inset: auto 0 0 0;
          top: calc(env(safe-area-inset-top) + 122px);
          display: block;
          border: 0;
          background: transparent;
        }
        .fold-vertical #reader .page {
          position: absolute;
          top: 0;
          bottom: 0;
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: var(--card);
          overflow: auto;
        }
        .fold-vertical #reader .page:first-child { left: 0; width: calc(var(--fold-left) - 14px); }
        .fold-vertical #reader .page:last-child { left: calc(var(--fold-left) + var(--fold-width)); right: 0; }
      </style>
    `;
  },
};
