/**
 * Outer display or inner display.
 *
 * Apple's guidance is to use size classes, not the screen size, to tell the
 * small outer display from the big inner one.
 */
export const sizeClasses = {
  id: 'size-classes',
  title: 'Size classes',
  summary: 'Tell the outer display from the inner one.',

  run(stage, Foldable) {
    stage.innerHTML = `
      <div class="card">
        <p class="big" id="display">—</p>
        <dl class="readout" id="readout"></dl>
      </div>
    `;

    const display = stage.querySelector('#display');
    const readout = stage.querySelector('#readout');

    const show = async (sizeClass) => {
      const { activeDisplay } = await Foldable.getFoldState();
      display.textContent =
        activeDisplay === 'outer' || sizeClass.horizontal === 'compact' ? 'outer display' : 'inner display';
      readout.innerHTML = `
        <dt>horizontal</dt><dd>${sizeClass.horizontal}</dd>
        <dt>vertical</dt><dd>${sizeClass.vertical}</dd>
        <dt>width class</dt><dd>${sizeClass.widthClass}</dd>
        <dt>height class</dt><dd>${sizeClass.heightClass}</dd>
        <dt>window</dt><dd>${window.innerWidth} × ${window.innerHeight}</dd>
      `;
    };

    let handle;
    void (async () => {
      await show(await Foldable.getSizeClass());
      handle = await Foldable.addListener('sizeClassChange', (next) => void show(next));
    })();

    return () => void handle?.remove();
  },
};
