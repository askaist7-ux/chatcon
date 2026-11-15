(() => {
  const cv = document.getElementById('bg');
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, DPR, t = 0, motes = [];

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * DPR;
    H = cv.height = innerHeight * DPR;
    motes = Array.from({ length: Math.round(innerWidth / 14) }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: (Math.random() * 1.8 + .4) * DPR, s: Math.random() * .4 + .1, p: Math.random() * 6.28
    }));
  }
  addEventListener('resize', resize); resize();

  // 신비로운 리듬의 흐르는 라인
  const LINES = 22;
  function wave(i, x) {
    const k = i / LINES;
    const base = H * (.18 + k * .68);
    const a = H * (.035 + .05 * Math.sin(k * 5 + t * .0004));
    return base
      + Math.sin(x * .0016 / DPR + t * .0011 + k * 6) * a
      + Math.sin(x * .0042 / DPR - t * .0016 + k * 11) * a * .45
      + Math.sin(x * .0009 / DPR + t * .0006 - k * 3) * a * 1.2;
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < LINES; i++) {
      const k = i / LINES;
      const hue = 205 + k * 25 + Math.sin(t * .0005 + i) * 8;
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      const al = .10 + .22 * (.5 + .5 * Math.sin(t * .001 + i * .7));
      grad.addColorStop(0, `hsla(${hue},100%,70%,0)`);
      grad.addColorStop(.35, `hsla(${hue},100%,72%,${al})`);
      grad.addColorStop(.65, `hsla(${hue + 15},100%,82%,${al * 1.2})`);
      grad.addColorStop(1, `hsla(${hue},100%,70%,0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = (1 + (i % 4 === 0 ? 1.2 : 0)) * DPR;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 10 * DPR) {
        const y = wave(i, x);
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();

      // 라인 위를 흐르는 빛 입자
      const px = ((t * (.18 + k * .22) * DPR + i * 190 * DPR) % (W + 200 * DPR)) - 100 * DPR;
      const py = wave(i, px);
      const g = ctx.createRadialGradient(px, py, 0, px, py, 16 * DPR);
      g.addColorStop(0, 'rgba(255,255,255,.95)');
      g.addColorStop(.3, 'rgba(120,200,255,.5)');
      g.addColorStop(1, 'rgba(80,160,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, 16 * DPR, 0, 6.283); ctx.fill();
    }

    // 별빛 먼지
    for (const m of motes) {
      m.y -= m.s * DPR; if (m.y < -5) { m.y = H + 5; m.x = Math.random() * W; }
      const tw = .35 + .65 * Math.abs(Math.sin(t * .002 + m.p));
      ctx.fillStyle = `rgba(190,230,255,${tw * .7})`;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    t += 16;
    if (!reduce) requestAnimationFrame(frame);
  }
  frame();
})();
