/**
 * Everything the system reserves on this display.
 *
 * `getReservedRegions()` returns the fold and anything covering the screen,
 * active or not, with the margins to keep clear.
 */
export const reservedRegions = {
  id: 'reserved-regions',
  title: 'Reserved regions',
  summary: 'The fold, the cameras and the system bar area, drawn on screen.',
  wide: true,

  run(stage, Foldable) {
    stage.innerHTML = `
      <div class="card"><ul id="list" class="readout"></ul></div>
      <p class="hint">Regions are drawn over the page in place.</p>
    `;

    const list = stage.querySelector('#list');
    const drawn = [];

    const clear = () => {
      for (const node of drawn) node.remove();
      drawn.length = 0;
    };

    const render = async () => {
      const { regions } = await Foldable.getReservedRegions();
      clear();

      list.innerHTML = regions.length
        ? regions
            .map(
              (region) =>
                `<dt>${region.kind}${region.isActive ? '' : ' (inactive)'}</dt><dd>${region.x},${region.y} ${region.width}×${region.height}</dd>`,
            )
            .join('')
        : '<dt>none</dt><dd>this display reserves nothing</dd>';

      for (const region of regions) {
        const box = document.createElement('div');
        Object.assign(box.style, {
          position: 'fixed',
          left: `${region.x}px`,
          top: `${region.y}px`,
          width: `${region.width}px`,
          height: `${region.height}px`,
          border: `2px solid ${region.kind === 'division' ? '#0f766e' : '#b45309'}`,
          background: region.isActive ? 'rgb(15 118 110 / 12%)' : 'transparent',
          pointerEvents: 'none',
          zIndex: 30,
        });
        document.body.append(box);
        drawn.push(box);
      }
    };

    let handle;
    void (async () => {
      await render();
      handle = await Foldable.addListener('foldStateChange', () => void render());
    })();

    return () => {
      clear();
      void handle?.remove();
    };
  },
};
