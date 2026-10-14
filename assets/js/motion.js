/* Motion: smooth scrolling (Lenis), light/dark section transitions and scroll-linked
   reveals (GSAP ScrollTrigger). Without the libraries the page stays complete and static. */
(function () {
  const reduce = prefersReducedMotion;
  const gnav = document.querySelector('.gnav');
  const navTop = () => gnav.classList.toggle('top', scrollY < 30);
  addEventListener('scroll', navTop, { passive: true }); navTop();

  // ---------- every in-page link scrolls to its section (with or without smooth scrolling) ----------
  let lenis = null;
  const NAV_OFFSET = 52;
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const h = a.getAttribute('href');
    const el = h.length > 1 && document.querySelector(h);
    if (!el) return;
    e.preventDefault();
    const top = h === '#top' ? 0 : el.getBoundingClientRect().top + scrollY - NAV_OFFSET;
    if (lenis) lenis.scrollTo(top, { duration: 1.5 });
    else window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    if (a.closest('.gnav')) a.blur();
  });

  // ---------- the nav marks the section you are in ----------
  const navLinks = [...gnav.querySelectorAll('a[href^="#"]')];
  const markActive = href => navLinks.forEach(a => {
    if (a.getAttribute('href') === href) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) markActive(en.target.dataset.nav); }),
      { rootMargin: '-45% 0px -54% 0px' });
    [['#top', document.querySelector('.hero')], ['#about', $('about')], ['#work', $('work')], ['#lab', $('lab')], ['#contact', $('contact')]]
      .forEach(([href, el]) => { if (el) { el.dataset.nav = href; io.observe(el); } });
  }

  // ---------- the nav turns black over dark sections and white over light ones ----------
  if ('IntersectionObserver' in window) {
    const modeOf = el => el.classList.contains('band') ? (el.nextElementSibling && el.nextElementSibling.dataset.mode) : el.dataset.mode;
    const under = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) gnav.classList.toggle('on-dark', modeOf(en.target) === 'dark');
    }), { rootMargin: '0px 0px -94% 0px' });                          // the strip right under the bar
    document.querySelectorAll('[data-mode], .band').forEach(el => under.observe(el));   // a band already belongs to the section after it
  }

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  if (window.Flip) gsap.registerPlugin(Flip);

  // ---------- smooth scrolling ----------
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ---------- big section names that appear between sections ----------
  document.querySelectorAll('.band').forEach(b => {
    const eb = b.nextElementSibling && b.nextElementSibling.querySelector('.t-eyebrow');
    if (eb) b.innerHTML = `<p class="band-word">${esc(eb.textContent)}</p>`;
  });

  // ---------- cursor ring (desktop) ----------
  if (matchMedia('(pointer:fine)').matches && !reduce) {
    const halo = document.createElement('div'); halo.className = 'halo'; halo.setAttribute('aria-hidden', 'true'); document.body.appendChild(halo);
    const qx = gsap.quickTo(halo, 'x', { duration: .25, ease: 'power3' }), qy = gsap.quickTo(halo, 'y', { duration: .25, ease: 'power3' });
    addEventListener('pointermove', e => {
      qx(e.clientX); qy(e.clientY); halo.classList.add('on');
      halo.classList.toggle('big', !!(e.target.closest && e.target.closest('a,button,input,textarea,label,#specCv')));
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => halo.classList.remove('on'));
  }

  // ---------- hero: the panel widens to full bleed while the headline drifts up ----------
  if (!reduce) {
    gsap.fromTo('.hero-visual', { '--grow': 0 }, { '--grow': 1, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: () => '+=' + Math.round(innerHeight * 0.6), scrub: 1, invalidateOnRefresh: true } });
    gsap.to('.hero-head', { y: -70, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
  }

  // ---------- light ↔ dark: page colours scrub across each band ----------
  const root = document.documentElement;
  const C = {
    light: { '--bg': '#FBFBFD', '--fg': '#1D1D1F', '--fg2': '#6E6E73', '--fg3': '#86868B', '--tile': '#F5F5F7', '--line': '#D2D2D7', dark: 0 },
    dark: { '--bg': '#000000', '--fg': '#F5F5F7', '--fg2': '#A1A1A6', '--fg3': '#86868B', '--tile': '#161617', '--line': '#424245', dark: 1 },
  };
  const pick = o => Object.fromEntries(Object.entries(o).filter(([k]) => k.startsWith('--')));
  const secs = [...document.querySelectorAll('[data-mode]')];
  let labQueued = false;
  const redraw = () => { if (!labQueued) { labQueued = true; requestAnimationFrame(() => { labQueued = false; window.__redrawLab && window.__redrawLab(); }); } };
  for (let i = 1; i < secs.length; i++) {
    const from = C[secs[i - 1].dataset.mode], to = C[secs[i].dataset.mode];
    const prev = secs[i].previousElementSibling, band = prev && prev.classList.contains('band') ? prev : secs[i];
    gsap.timeline({ scrollTrigger: { trigger: band, start: 'top 75%', end: 'bottom 30%', scrub: reduce ? false : 1, toggleActions: 'play none none reverse', onUpdate: redraw, onToggle: redraw } })
      .fromTo(root, pick(from), { ...pick(to), ease: 'none', immediateRender: false }, 0)
      .fromTo(PageState, { dark: from.dark }, { dark: to.dark, ease: 'none', immediateRender: false }, 0);
  }

  if (!reduce) {
    document.querySelectorAll('.band').forEach(b => {
      const w = b.querySelector('.band-word'); if (!w) return;
      gsap.timeline({ scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: 1 } })
        .fromTo(w, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, ease: 'power2.out', duration: .45 })
        .to(w, { opacity: 0, scale: 1.05, ease: 'power2.in', duration: .4 }, .6);
    });
    const intro = document.querySelector('.about .t-intro');
    if (intro) {
      const words = splitWords(intro);
      gsap.fromTo(words, { opacity: .22 }, { opacity: 1, ease: 'none', stagger: .08, scrollTrigger: { trigger: intro, start: 'top 80%', end: 'bottom 45%', scrub: 1 } });
    }
    document.querySelectorAll('.count').forEach(el => {
      const to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0;
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => {
        const o = { v: 0 }; el.textContent = (0).toFixed(dec);
        gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = o.v.toFixed(dec); } });
      } });
    });
    ScrollTrigger.batch('.card', { start: 'top 90%', once: true, onEnter: b => gsap.from(b, { y: 48, scale: .96, opacity: 0, duration: 1, ease: 'power3.out', stagger: .09, clearProps: 'transform,opacity' }) });
    ScrollTrigger.batch('.spec', { start: 'top 92%', once: true, onEnter: b => gsap.from(b, { y: 24, opacity: 0, duration: .8, ease: 'power3.out', stagger: .06, clearProps: 'transform,opacity' }) });
    document.querySelectorAll('.bar i').forEach(i => {
      const v = +i.dataset.v;
      ScrollTrigger.create({ trigger: i, start: 'top 92%', once: true, onEnter: () => gsap.fromTo(i, { scaleX: 0 }, { scaleX: v, duration: 1.6, ease: 'power3.out', delay: .2 }) });
    });
    labAutoplay();
    document.querySelectorAll('.reveal').forEach(el => gsap.from(el, { y: 40, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
  }

  ScrollTrigger.addEventListener('refresh', () => dispatchEvent(new Event('portfolio:layout')));
  addEventListener('load', () => ScrollTrigger.refresh());

  // split a paragraph into word spans (keeps <strong> emphasis)
  function splitWords(el) {
    const out = [];
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p));
            else { const s = document.createElement('span'); s.textContent = p; frag.appendChild(s); out.push(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el); return out;
  }

  // lab: plays a short tour until the visitor touches anything
  function labAutoplay() {
    const hint = $('labHint'); let tl = null, user = false;
    const stop = () => { if (user) return; user = true; if (tl) tl.kill(); hint.textContent = 'Tap a level'; hint.classList.remove('autoplay'); };
    const sec = $('lab');
    sec.addEventListener('pointerdown', e => { if (e.target.closest('.lab-shell,.controls')) stop(); });
    sec.addEventListener('keydown', stop);
    const setSel = i => { lab.sel = Math.max(0, Math.min(lab.E.length - 1, i)); updateReadout(); drawLab(); };
    const build = () => {
      const h = lab.E.length / 2 - 1, px = { t: lab.t, D: lab.D };
      const upd = () => { lab.t = px.t; lab.D = px.D; $('rT').value = px.t; $('rD').value = px.D; recompute(true); };
      tl = gsap.timeline({ repeat: -1, repeatDelay: .8, defaults: { ease: 'sine.inOut' } });
      [h, h - 1, h - 2, h + 1, h + 2, h].forEach((s, i) => tl.call(() => setSel(s), null, i * .9));
      tl.to(px, { t: 1.8, duration: 1.6, onUpdate: upd }, '+=.4').to(px, { D: 1.4, duration: 1.4, onUpdate: upd }).to(px, { t: 2.7, D: 0, duration: 1.6, onUpdate: upd });
      hint.textContent = 'Playing a short tour · touch to take control'; hint.classList.add('autoplay');
    };
    ScrollTrigger.create({ trigger: '#lab .lab-shell', start: 'top 70%', end: 'bottom top',
      onEnter: () => { if (user) return; if (!tl) build(); else tl.play(); },
      onEnterBack: () => { if (!user && tl) tl.play(); },
      onLeave: () => { if (tl) tl.pause(); }, onLeaveBack: () => { if (tl) tl.pause(); } });
  }
})();
