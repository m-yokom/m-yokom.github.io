// LP の「遊び方」のアニメーション。5×5 の見本の問題（答えは1通り）を、指でなぞるように解いていく。
// 盤面の見た目はアプリ（lib/ui/board_view.dart）に合わせている。動きを減らす設定の端末では、完成図だけを表示する。
(() => {
  const canvas = document.getElementById('rule-demo');
  if (!canvas) return;
  const caption = document.getElementById('rule-caption');
  const items = [...document.querySelectorAll('.rule-list li')];
  const ctx = canvas.getContext('2d');
  const N = 5;

  // 見本の問題（x, y は0始まり）。描く順に並べている
  const LINES = [
    { color: '#ff2525', cells: [[1, 0], [0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },
    { color: '#3399ff', cells: [[2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]] },
    { color: '#ff9900', cells: [[2, 3], [3, 3], [3, 2], [3, 1], [2, 1], [1, 1]] },
    { color: '#009900', cells: [[2, 2], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4]] },
  ];

  // 場面: 何本目まで描いたか・説明・強調するルール
  const SCENES = [
    { upto: 0, caption: '同じ色の端点が2つずつ', rule: 0, wait: 1400 },
    { draw: 0, caption: '同じ色の端点を、線でつなぐ', rule: 0 },
    { draw: 1, caption: '線は縦と横にだけ進める', rule: 1 },
    { draw: 2, caption: 'ほかの線とは重ねられない', rule: 1 },
    { draw: 3, caption: 'すべてのマスを通ったら…', rule: 2 },
    { done: true, caption: '完成！', rule: 2, wait: 2200 },
  ];
  const STEP_MS = 230; // 1マス進む時間

  let size = 0;
  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    size = r.width;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.width * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const center = (c) => [(c[0] + 0.5) * (size / N), (c[1] + 0.5) * (size / N)];

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // progress: 各線の描いた長さ（マス数。小数で途中まで）
  function draw(progress, finger, glow) {
    const cell = size / N;
    ctx.clearRect(0, 0, size, size);
    // ドット
    ctx.fillStyle = '#5a6170';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const [cx, cy] = center([x, y]);
      ctx.beginPath(); ctx.arc(cx, cy, cell * 0.06, 0, Math.PI * 2); ctx.fill();
    }
    // 線
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = cell * 0.36;
    LINES.forEach((l, i) => {
      const p = progress[i];
      if (p <= 0) return;
      ctx.strokeStyle = l.color;
      ctx.beginPath();
      const [sx, sy] = center(l.cells[0]);
      ctx.moveTo(sx, sy);
      const whole = Math.floor(p);
      for (let k = 1; k <= Math.min(whole, l.cells.length - 1); k++) {
        const [x, y] = center(l.cells[k]); ctx.lineTo(x, y);
      }
      if (whole < l.cells.length - 1) {
        const [ax, ay] = center(l.cells[whole]);
        const [bx, by] = center(l.cells[whole + 1]);
        const t = p - whole;
        ctx.lineTo(ax + (bx - ax) * t, ay + (by - ay) * t);
      }
      ctx.stroke();
    });
    // 端点（線の色の角丸の四角に白い丸）
    LINES.forEach((l) => {
      [l.cells[0], l.cells[l.cells.length - 1]].forEach((c) => {
        const [cx, cy] = center(c);
        const s = cell * 0.62;
        ctx.fillStyle = l.color;
        if (glow) { ctx.shadowColor = l.color; ctx.shadowBlur = cell * 0.4 * glow; }
        roundRect(cx - s / 2, cy - s / 2, s, s, cell * 0.14); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(cx, cy, cell * 0.12, 0, Math.PI * 2); ctx.fill();
      });
    });
    // 指
    if (finger) {
      ctx.fillStyle = 'rgba(255, 224, 130, 0.85)';
      ctx.beginPath(); ctx.arc(finger[0], finger[1], cell * 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255, 224, 130, 0.5)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(finger[0], finger[1], cell * 0.32, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function setScene(s) {
    if (caption) caption.textContent = s.caption;
    items.forEach((li, i) => li.classList.toggle('active', i === s.rule));
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  resize();
  window.addEventListener('resize', () => { resize(); if (reduce) still(); else if (typeof frameAt === 'function') frameAt(lastElapsed); });
  let lastElapsed = 0;

  function still() {
    draw(LINES.map((l) => l.cells.length - 1), null, 0);
    if (caption) caption.textContent = 'すべてつながると完成！';
  }
  if (reduce) { still(); return; }

  // 場面ごとの長さ
  const timeline = SCENES.map((s) => (s.draw !== undefined ? (LINES[s.draw].cells.length - 1) * STEP_MS + 500 : s.wait));
  const total = timeline.reduce((a, b) => a + b, 0);
  let start = null;
  let visible = true;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(canvas);

  function frame(now) {
    if (start === null) start = now;
    if (!visible) { start = now - pausedAt; requestAnimationFrame(frame); return; }
    frameAt(now - start);
    requestAnimationFrame(frame);
  }

  function frameAt(elapsed) {
    lastElapsed = elapsed;
    let t = elapsed % total;
    pausedAt = t;
    let si = 0;
    while (t >= timeline[si]) { t -= timeline[si]; si++; }
    const s = SCENES[si];
    setScene(s);
    const progress = LINES.map((l, i) => {
      if (s.done) return l.cells.length - 1;
      if (s.draw === undefined) return 0;
      if (i < s.draw) return l.cells.length - 1;
      if (i > s.draw) return 0;
      return Math.min(t / STEP_MS, l.cells.length - 1);
    });
    let finger = null;
    if (s.draw !== undefined) {
      const l = LINES[s.draw];
      const p = progress[s.draw];
      const k = Math.min(Math.floor(p), l.cells.length - 2);
      const [ax, ay] = center(l.cells[k]);
      const [bx, by] = center(l.cells[k + 1]);
      const f = Math.min(p - k, 1);
      finger = [ax + (bx - ax) * f, ay + (by - ay) * f];
    }
    const glow = s.done ? 0.6 + 0.4 * Math.sin(t / 160) : 0;
    draw(progress, finger, glow);
  }
  let pausedAt = 0;
  // 確認用: ?demo=ミリ秒 で、その時点の場面を止めて表示する
  const fixed = new URLSearchParams(location.search).get('demo');
  if (fixed !== null) { start = 0; frameAt(Number(fixed)); return; }
  requestAnimationFrame(frame);
})();
