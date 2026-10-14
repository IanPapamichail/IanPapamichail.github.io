/* "Ask about my work": pre-written answers to common questions, picked from a list.
   The questions and answers live in content.js. No server and no AI service are involved. */
(function () {
  const list = $('faq'), out = $('answer'), sr = $('answerSr');
  if (!list || !out) return;
  list.innerHTML = faq.map((f, i) =>
    `<button type="button" class="faq-q" data-i="${i}" aria-pressed="false">${esc(f.q)}<span aria-hidden="true">›</span></button>`).join('');

  let raf = 0;
  function show(i, animate) {
    list.querySelectorAll('.faq-q').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
    cancelAnimationFrame(raf);
    const text = faq[i].a;
    if (sr && animate) sr.textContent = text;            // announce the full answer once, not word by word
    if (!animate || prefersReducedMotion) { out.textContent = text; return; }
    const words = text.split(' '), t0 = performance.now(), msPerWord = 22;
    const step = now => {                                // a short typed-out reveal, like a chat reply
      const n = Math.min(words.length, Math.floor((now - t0) / msPerWord) + 1);
      out.textContent = words.slice(0, n).join(' ');
      if (n < words.length) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  list.addEventListener('click', e => { const b = e.target.closest('.faq-q'); if (b) show(+b.dataset.i, true); });
  show(0, false);                                        // open on the first answer so the panel is never empty
})();
