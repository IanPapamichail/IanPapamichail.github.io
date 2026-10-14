/* Lab: a tight-binding model of a graphene flake, diagonalised in the browser (Jacobi method). */

function buildFlake(k) {
  const pts = [], sub = [], key = new Map();
  for (let q = -k; q <= k; q++) for (let r = -k; r <= k; r++) {
    if (Math.abs(q + r) > k) continue;
    const cx = Math.sqrt(3) * (q + r / 2), cy = 1.5 * r;
    for (let i = 0; i < 6; i++) {
      const a = (30 + 60 * i) * Math.PI / 180, x = cx + Math.cos(a), y = cy + Math.sin(a);
      const kk = Math.round(x * 1000) + ',' + Math.round(y * 1000);
      if (key.has(kk)) continue; key.set(kk, pts.length); pts.push([x, y]); sub.push(i % 2);
    }
  }
  const bonds = [];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1];
    if (dx * dx + dy * dy < 1.21) bonds.push([i, j]);
  }
  return { pts, sub, bonds };
}

function jacobi(M, n) {
  const A = Float64Array.from(M), V = new Float64Array(n * n);
  for (let i = 0; i < n; i++) V[i * n + i] = 1;
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p * n + q] * A[p * n + q];
    if (off < 1e-20) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      const apq = A[p * n + q]; if (Math.abs(apq) < 1e-15) continue;
      const th = (A[q * n + q] - A[p * n + p]) / (2 * apq), t = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const akp = A[k * n + p], akq = A[k * n + q]; A[k * n + p] = c * akp - s * akq; A[k * n + q] = s * akp + c * akq; }
      for (let k = 0; k < n; k++) { const apk = A[p * n + k], aqk = A[q * n + k]; A[p * n + k] = c * apk - s * aqk; A[q * n + k] = s * apk + c * aqk; }
      for (let k = 0; k < n; k++) { const vkp = V[k * n + p], vkq = V[k * n + q]; V[k * n + p] = c * vkp - s * vkq; V[k * n + q] = s * vkp + c * vkq; }
      A[p * n + q] = A[q * n + p] = 0;
    }
  }
  const idx = [...Array(n).keys()].sort((a, b) => A[a * n + a] - A[b * n + b]);
  return { E: idx.map(i => A[i * n + i]), vec: idx.map(i => { const v = new Float64Array(n); for (let k = 0; k < n; k++) v[k] = V[k * n + i]; return v; }) };
}

const lab = { k: 2, t: 2.7, D: 0, sel: 26, flake: null, E: [], vec: [] };
const latticeCv = $('latticeCv'), specCv = $('specCv');

function solve() {
  if (!lab.flake || lab.flake.k !== lab.k) lab.flake = { k: lab.k, ...buildFlake(lab.k) };
  const f = lab.flake, n = f.pts.length, H = new Float64Array(n * n);
  for (let i = 0; i < n; i++) H[i * n + i] = f.sub[i] ? lab.D / 2 : -lab.D / 2;
  for (const [i, j] of f.bonds) H[i * n + j] = H[j * n + i] = -lab.t;
  const r = jacobi(H, n); lab.E = r.E; lab.vec = r.vec;
  lab.sel = Math.min(lab.sel, n - 1);
}
function stateName(i, n) { const h = n / 2 - 1; if (i === h) return 'HOMO'; if (i === h + 1) return 'LUMO'; return i < h ? `HOMO − ${h - i}` : `LUMO + ${i - h - 1}`; }
function updateReadout() {
  const n = lab.E.length;
  $('vN').textContent = n;
  $('vGap').innerHTML = (lab.E[n / 2] - lab.E[n / 2 - 1]).toFixed(2) + '<small> eV</small>';
  $('vE').innerHTML = (lab.E[lab.sel] >= 0 ? '+' : '−') + Math.abs(lab.E[lab.sel]).toFixed(2) + '<small> eV</small>';
  $('vW').innerHTML = (lab.E[n - 1] - lab.E[0]).toFixed(2) + '<small> eV</small>';
  $('oSize').textContent = n + ' atoms'; $('oT').textContent = lab.t.toFixed(2) + ' eV'; $('oD').textContent = lab.D.toFixed(2) + ' eV';
  $('rS').max = n; $('rS').value = lab.sel + 1; $('oS').textContent = stateName(lab.sel, n);
  $('stateTitle').textContent = 'Eigenstate · ' + stateName(lab.sel, n) + (lab.sel < n / 2 ? ' (occupied)' : ' (empty)');
}
function prep(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth || cv.width, h = Math.round(w * cv.height / cv.width);
  if (cv._w !== w || cv._d !== dpr) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv._w = w; cv._d = dpr; cv._ratio = h / w; }
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  return { ctx, w, h: Math.round(w * cv._ratio) };
}
latticeCv._ratio = 560 / 640; specCv._ratio = 560 / 520;

function drawLattice() {
  const { ctx, w, h } = prep(latticeCv), f = lab.flake, fg = cssv('--fg'), fg3 = cssv('--fg3');
  let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
  for (const [x, y] of f.pts) { minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
  const pad = 28, sc = Math.min((w - 2 * pad) / (maxx - minx || 1), (h - 2 * pad) / (maxy - miny || 1)), ox = w / 2 - (minx + maxx) / 2 * sc, oy = h / 2 + (miny + maxy) / 2 * sc;
  const P = ([x, y]) => [ox + x * sc, oy - y * sc];
  ctx.strokeStyle = fg3; ctx.globalAlpha = .45; ctx.lineWidth = 1; ctx.beginPath();
  for (const [i, j] of f.bonds) { const a = P(f.pts[i]), b = P(f.pts[j]); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
  ctx.stroke(); ctx.globalAlpha = 1;
  const v = lab.vec[lab.sel]; let mx = 0; for (const x of v) mx = Math.max(mx, Math.abs(x));
  const rmax = sc * 0.46;
  f.pts.forEach((p, i) => {
    const [x, y] = P(p), a = v[i] / (mx || 1), r = Math.max(1.6, rmax * Math.sqrt(Math.abs(a)));
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (Math.abs(a) < 1e-3) { ctx.fillStyle = fg3; ctx.globalAlpha = .6; ctx.arc(x, y, 1.6, 0, 7); ctx.fill(); ctx.globalAlpha = 1; return; }
    if (a > 0) { ctx.fillStyle = fg; ctx.fill(); } else { ctx.strokeStyle = fg; ctx.lineWidth = 1.6; ctx.stroke(); }
  });
}
function specLayout(w, h) {
  const n = lab.E.length, lo = lab.E[0], hi = lab.E[n - 1], m = (hi - lo) * .06 || 1;
  return { n, padL: 48, padR: 16, padT: 16, padB: 30, lo: lo - m, hi: hi + m, x: i => 48 + (w - 64) * (n === 1 ? .5 : i / (n - 1)), y: e => 16 + (h - 46) * (1 - (e - (lo - m)) / ((hi + m) - (lo - m))) };
}
function niceStep(range) { const raw = range / 6, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }
function drawSpec() {
  const { ctx, w, h } = prep(specCv), fg = cssv('--fg'), fg3 = cssv('--fg3'), line = cssv('--line'), L = specLayout(w, h);
  ctx.font = '12px Inter, system-ui, sans-serif'; ctx.fillStyle = fg3; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  const step = niceStep(L.hi - L.lo);
  for (let e = Math.ceil(L.lo / step) * step; e <= L.hi; e += step) {
    const y = L.y(e);
    ctx.strokeStyle = line; ctx.globalAlpha = Math.abs(e) < 1e-9 ? 1 : .5; ctx.beginPath(); ctx.moveTo(L.padL, y); ctx.lineTo(w - L.padR, y); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillText((Math.abs(e) < 1e-9 ? '0' : e.toFixed(step < 1 ? 1 : 0)), L.padL - 8, y);
  }
  ctx.save(); ctx.translate(12, h / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('Energy (eV)', 0, 0); ctx.restore();
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText('State index →', w / 2, h - 18);
  const n = L.n, fermi = (lab.E[n / 2 - 1] + lab.E[n / 2]) / 2, yf = L.y(fermi);
  ctx.setLineDash([4, 4]); ctx.strokeStyle = fg3; ctx.beginPath(); ctx.moveTo(L.padL, yf); ctx.lineTo(w - L.padR, yf); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText('Fermi level', w - L.padR, yf - 4);
  const r = n > 60 ? 3 : n > 30 ? 4 : 5;
  lab.E.forEach((e, i) => {
    const x = L.x(i), y = L.y(e); ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
    if (i < n / 2) { ctx.fillStyle = fg; ctx.fill(); } else { ctx.strokeStyle = fg; ctx.lineWidth = 1.4; ctx.stroke(); }
    if (i === lab.sel) { ctx.beginPath(); ctx.arc(x, y, r + 5, 0, 7); ctx.strokeStyle = fg; ctx.lineWidth = 1.5; ctx.stroke(); }
  });
}
function drawLab() { drawLattice(); drawSpec(); }
function recompute(keepSel) { const n0 = lab.E.length; solve(); if (!keepSel || lab.E.length !== n0) lab.sel = lab.E.length / 2 - 1; updateReadout(); drawLab(); }

$('segSize').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  lab.k = +b.dataset.k; document.querySelectorAll('#segSize button').forEach(x => x.setAttribute('aria-pressed', x === b)); recompute(false);
});
let labRaf = 0; const later = fn => { cancelAnimationFrame(labRaf); labRaf = requestAnimationFrame(fn); };
$('rT').addEventListener('input', e => { lab.t = +e.target.value; later(() => recompute(true)); });
$('rD').addEventListener('input', e => { lab.D = +e.target.value; later(() => recompute(true)); });
$('rS').addEventListener('input', e => { lab.sel = +e.target.value - 1; updateReadout(); drawLab(); });
specCv.addEventListener('click', e => {
  const rect = specCv.getBoundingClientRect(), L = specLayout(rect.width, rect.height);
  const mx = e.clientX - rect.left, my = e.clientY - rect.top; let best = 0, bd = 1e9;
  lab.E.forEach((en, i) => { const d = (L.x(i) - mx) ** 2 + (L.y(en) - my) ** 2; if (d < bd) { bd = d; best = i; } });
  lab.sel = best; updateReadout(); drawLab();
});
addEventListener('resize', () => later(drawLab));
recompute(false);
window.__redrawLab = drawLab;
