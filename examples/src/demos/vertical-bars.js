/**
 * Where the system puts bars, and how to opt out.
 *
 * `getBarPlacement()` reports the edge iPhone Duo moves native bars to, and
 * `setVerticalBarBehavior()` keeps everything horizontal instead.
 */
export const verticalBars = {
  id: 'vertical-bars',
  title: 'Vertical bars',
  summary: 'Follow the system bars, or turn them off.',
  wide: true,

  run(stage, Foldable) {
    stage.innerHTML = `
      <div class="card">
        <p class="big" id="edge">—</p>
        <p class="hint">Your own tab bar can follow this edge.</p>
      </div>
      <div class="card">
        <button id="toggle" type="button" class="ghost">Keep bars horizontal</button>
        <p class="hint" id="applied"></p>
      </div>
      <div id="tabs">
        <span>One</span><span>Two</span><span>Three</span>
      </div>
      <style>
        #tabs {
          position: fixed;
          display: flex;
          gap: 18px;
          padding: 12px 18px;
          border: 1px solid var(--line);
          border-radius: 999px;
          background: var(--card);
          left: 50%;
          bottom: calc(env(safe-area-inset-bottom) + 16px);
          transform: translateX(-50%);
        }
        .vertical-bars-leading #tabs,
        .vertical-bars-trailing #tabs {
          flex-direction: column;
          left: auto;
          right: auto;
          top: 50%;
          bottom: auto;
          transform: translateY(-50%);
        }
        .vertical-bars-leading #tabs { left: calc(env(safe-area-inset-left) + 12px); }
        .vertical-bars-trailing #tabs { right: calc(env(safe-area-inset-right) + 12px); }
      </style>
    `;

    const edge = stage.querySelector('#edge');
    const applied = stage.querySelector('#applied');
    const toggle = stage.querySelector('#toggle');
    let disabled = false;

    const show = ({ verticalBarEdge }) => {
      edge.textContent = verticalBarEdge ?? 'horizontal';
    };

    toggle.addEventListener('click', async () => {
      disabled = !disabled;
      const result = await Foldable.setVerticalBarBehavior({
        behavior: disabled ? 'disabled' : 'automatic',
      });
      toggle.textContent = disabled ? 'Let the system decide' : 'Keep bars horizontal';
      applied.textContent = result.applied
        ? ''
        : 'Needs FoldableBridgeViewController, see the iPhone Duo guide.';
    });

    let handle;
    void (async () => {
      show(await Foldable.getBarPlacement());
      handle = await Foldable.addListener('barPlacementChange', show);
    })();

    return () => void handle?.remove();
  },
};
