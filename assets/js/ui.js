/* Work cards and skill filter, toolkit rows, contact helpers. */

// ---------- Work: cards + filter ----------
const pgrid = $('pgrid');
pgrid.innerHTML = projects.map((p, i) => {
  const link = p.repo ? `<a class="more" href="https://github.com/IanPapamichail/${p.repo}" target="_blank" rel="noopener">View on GitHub</a>` : '';
  const demo = p.demo ? `<a class="more" href="#lab">Try it live</a>` : '';
  const status = p.status ? `<span class="status-pill">${esc(p.status)}</span>` : '';
  const body = `<p class="t-label">${esc(p.cat)}</p><h3 class="t-h3">${esc(p.title)}</h3><p class="t-body">${esc(p.desc)}</p>
    <div class="chips">${p.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>`;
  if (p.feature) return `<article class="card feature" data-i="${i}"><div>${body}<div class="foot"><span class="t-cap">Thesis experiment · results from the benchmark runs</span></div></div>
    <div class="metrics">${p.metrics.map(([v, s, l]) => `<div class="metric"><b><span class="count" data-to="${v}" data-dec="0">${v}</span><small>${s}</small></b><p class="t-body">${esc(l)}</p></div>`).join('')}</div></article>`;
  return `<article class="card" data-i="${i}">${body}<div class="foot"><span class="row" style="gap:20px">${demo}${link}</span>${status}</div></article>`;
}).join('');

const filterEl = $('filter'), fstatus = $('fstatus');
filterEl.innerHTML = filters.map(([k, l]) => {
  const n = k === 'all' ? projects.length : projects.filter(p => p.skills.includes(k)).length;
  return `<button type="button" class="fchip" data-k="${k}" aria-pressed="${k === 'all'}">${esc(l)}<span class="n">${n}</span></button>`;
}).join('');

function applyFilter(k) {
  filterEl.querySelectorAll('.fchip').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === k));
  const cards = [...pgrid.querySelectorAll('.card')];
  const anim = window.Flip && window.gsap && !prefersReducedMotion;
  const state = anim ? Flip.getState(cards) : null;
  let shown = 0;
  cards.forEach(c => { const p = projects[+c.dataset.i]; const on = k === 'all' || p.skills.includes(k); c.hidden = !on; if (on) shown++; });
  if (state) {
    Flip.from(state, { duration: .65, ease: 'power3.inOut', scale: true, absolute: true,
      onEnter: els => gsap.fromTo(els, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: .5, delay: .15, clearProps: 'opacity,transform' }),
      onLeave: els => gsap.to(els, { opacity: 0, scale: .9, duration: .35 }),
      onComplete: () => window.ScrollTrigger && ScrollTrigger.refresh() });
  }
  fstatus.textContent = k === 'all' ? '' : `${shown} project${shown === 1 ? '' : 's'} using ${filters.find(f => f[0] === k)[1]}`;
  if (!state && window.ScrollTrigger) ScrollTrigger.refresh();
}
filterEl.addEventListener('click', e => { const b = e.target.closest('.fchip'); if (b) applyFilter(b.dataset.k); });

// ---------- Toolkit rows with proficiency bars ----------
$('specs').innerHTML = skills.map(([l, items]) => {
  const v = levels[l];
  const bar = v == null ? '' : `<div class="lvl"><p class="t-cap">${levelName(v)}</p><div class="bar" role="meter" aria-label="${esc(l)} proficiency" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}" aria-valuetext="${levelName(v)}"><i data-v="${v / 100}" style="transform:scaleX(${v / 100})"></i></div></div>`;
  return `<div class="spec"><div><h3 class="t-h3">${esc(l)}</h3>${bar}</div><ul>${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
}).join('');

// ---------- Contact: copy email, CVs, booking ----------
const copyText = (text, btn, label) => {
  const done = () => { btn.textContent = 'Copied'; setTimeout(() => btn.textContent = label, 1600); };
  try { navigator.clipboard.writeText(text).then(done, () => { btn.textContent = 'Select and copy'; }); }
  catch (e) { btn.textContent = 'Select and copy'; }
};
$('copy').addEventListener('click', () => {
  copyText($('mail').textContent, $('copy'), 'Copy');
  const r = document.createRange(); r.selectNodeContents($('mail'));
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
});
if (BOOKING_URL) { const b = $('booking'); b.href = BOOKING_URL; b.hidden = false; }
// Optional hook used only by the hosted preview, where plain download links are disabled.
if (window.PORTFOLIO_PREVIEW && window.PORTFOLIO_PREVIEW.cvDownload) {
  document.querySelectorAll('[data-cv]').forEach(a => a.addEventListener('click', e => window.PORTFOLIO_PREVIEW.cvDownload(e, a, $('cvmsg'))));
}

// ---------- Contact: brief composer ----------
let lastDraft = '';
$('brief').addEventListener('submit', e => {
  e.preventDefault();
  const kind = document.querySelector('input[name=kind]:checked').value, name = $('bName').value.trim(), org = $('bOrg').value.trim(), msg = $('bMsg').value.trim();
  if (!msg) { $('bMsg').focus(); $('bMsg').placeholder = 'Add a sentence about what you need.'; return; }
  const subject = `${kind}${org ? ' · ' + org : ''}`;
  const body = `Hi Nickolas,\n\n${msg}\n\nBest regards,\n${name || '[Your name]'}${org ? '\n' + org : ''}`;
  lastDraft = `Subject: ${subject}\n\n${body}`;
  $('draft').textContent = lastDraft; $('draftBox').hidden = false;
  $('mailto').href = `mailto:papamichailnickolas@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
$('copyDraft').addEventListener('click', () => copyText(lastDraft, $('copyDraft'), 'Copy message'));
