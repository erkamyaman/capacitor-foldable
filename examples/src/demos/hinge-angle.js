/**
 * The hinge angle, live.
 *
 * `getHingeAngle()` reads it once, `hingeAngleChange` follows it, and the
 * system's `status` says how far open the phone is (it can lag the angle).
 */
export const hingeAngle = {
  id: 'hinge-angle',
  title: 'Hinge angle',
  summary: 'Read the angle live, and draw its history.',

  run(stage, Foldable) {
    stage.innerHTML = `
      <div class="card">
        <p class="big" id="value">—</p>
        <p class="hint" id="status">status —</p>
      </div>
      <div class="card">
        <canvas id="chart" width="600" height="140" style="width: 100%; height: 110px"></canvas>
        <p class="hint">0° closed at the bottom, 180° flat at the top.</p>
      </div>
    `;

    const value = stage.querySelector('#value');
    const status = stage.querySelector('#status');
    const chart = stage.querySelector('#chart');
    const angles = [];

    const draw = () => {
      const ctx = chart.getContext('2d');
      ctx.clearRect(0, 0, chart.width, chart.height);
      ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#1f2937';
      ctx.lineWidth = 3;
      ctx.beginPath();
      angles.forEach((angle, index) => {
        const x = (index / Math.max(angles.length - 1, 1)) * chart.width;
        const y = chart.height - (angle / 180) * chart.height;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    const show = async (angle) => {
      if (angle === null) {
        value.textContent = 'no hinge sensor';
        return;
      }
      value.textContent = `${angle.toFixed(1)}°`;
      angles.push(angle);
      if (angles.length > 200) angles.shift();
      draw();

      const { status: next } = await Foldable.getHingeAngle();
      status.textContent = `status ${next ?? '—'}`;
    };

    let handle;
    void (async () => {
      const { angle } = await Foldable.getHingeAngle();
      await show(angle);
      handle = await Foldable.addListener('hingeAngleChange', (event) => void show(event.angle));
    })();

    return () => void handle?.remove();
  },
};
