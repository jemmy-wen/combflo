/* CombFlo — home page motion */
(() => {
  const { reduceMotion } = window.CF;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  // pinned stages stick at their CSS `top` (0 now that the nav floats over them)
  const pinTop = pin => parseFloat(getComputedStyle(pin.stage).top) || 0;

  // ---------- Hero parallax ----------
  const hero = document.querySelector('.hero');
  const layers = hero ? [...hero.querySelectorAll('[data-depth]')] : [];
  const copy = hero?.querySelector('.hero-copy');

  function heroUpdate() {
    if (!hero || reduceMotion) return;
    const y = scrollY;
    const H = hero.offsetHeight;
    if (y > H + 100) return;
    layers.forEach(l => {
      l.style.transform = `translate3d(0,${(y * parseFloat(l.dataset.depth)).toFixed(1)}px,0)`;
    });
    if (copy) copy.style.opacity = clamp(1 - y / (H * .4), 0, 1).toFixed(3);
  }

  // ---------- Pinned sections ----------
  const pins = [...document.querySelectorAll('[data-pin]')].map(el => ({
    el,
    type: el.dataset.pin,
    stage: el.querySelector('.pin-stage'),
    items: [...el.querySelectorAll('[data-item]')],
    scenes: [...el.querySelectorAll('[data-scene]')],
    dots: [...el.querySelectorAll('.pager-dots i')],
    current: el.querySelector('[data-current]'),
    track: el.querySelector('.track'),
    viewport: el.querySelector('.track-viewport'),
    stageNo: el.querySelector('[data-stage-no]'),
    walker: el.querySelector('[data-walker]'),
    walk: 0,
    walkTimer: 0,
    idx: -1,
  }));

  const isPinned = pin => getComputedStyle(pin.stage).position === 'sticky';

  function progressOf(pin) {
    const r = pin.el.getBoundingClientRect();
    const dist = r.height - pin.stage.offsetHeight;
    return dist > 0 ? clamp((pinTop(pin) - r.top) / dist, 0, 1) : 0;
  }

  function setIndex(pin, idx) {
    if (idx === pin.idx) return;
    pin.idx = idx;
    pin.items.forEach((it, i) => {
      const o = i - idx;
      it.classList.toggle('is-active', o === 0);
      it.classList.toggle('is-past', o < 0);
      it.classList.toggle('is-next', o > 0);
      it.style.setProperty('--o', o);
      it.style.zIndex = pin.type === 'stack' ? String(i + 1) : '';
      if (pin.type === 'stack') it.setAttribute('aria-hidden', String(o > 0));
    });
    pin.scenes.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    pin.dots.forEach((d, i) => d.classList.toggle('on', i === idx));
    if (pin.current) pin.current.textContent = String(idx + 1).padStart(2, '0');
    if (pin.stageNo) pin.stageNo.textContent = `${idx + 1} / ${pin.items.length}`;
  }

  function pinUpdate(pin) {
    if (!isPinned(pin)) {
      pin.el.style.removeProperty('--p');
      if (pin.track) pin.track.style.transform = '';
      if (pin.idx === -1 || pin.type === 'track') {
        // static layout: everything visible
        pin.items.forEach(it => { it.classList.add('is-active'); it.classList.remove('is-past', 'is-next'); });
        pin.scenes.forEach((s, i) => s.classList.toggle('is-active', i === 0));
        pin.idx = -2;
      }
      return;
    }
    if (pin.idx === -2) pin.idx = -1;
    const p = progressOf(pin);
    pin.el.style.setProperty('--p', p.toFixed(4));
    const n = pin.items.length;

    if (pin.type === 'track') {
      if (pin.viewport.scrollLeft) pin.viewport.scrollLeft = 0; // fallback where overflow:clip is unsupported
      const max = pin.track.scrollWidth - pin.viewport.clientWidth;
      pin.track.style.transform = `translate3d(${(-p * max).toFixed(1)}px,0,0)`;
      setIndex(pin, Math.round(p * (n - 1)));
    } else {
      setIndex(pin, Math.min(n - 1, Math.floor(p * n)));
      if (pin.walker) walkTo(pin, clamp((p * n - .5) / (n - 1), 0, 1));
    }
  }

  // Level-map walker: follows scroll continuously, bobs while moving, turns when going back
  function walkTo(pin, w) {
    if (Math.abs(w - pin.walk) < .0005) return;
    pin.walker.classList.toggle('back', w < pin.walk);
    pin.walker.classList.add('walking');
    pin.walk = w;
    pin.el.style.setProperty('--walk', w.toFixed(4));
    clearTimeout(pin.walkTimer);
    pin.walkTimer = setTimeout(() => pin.walker.classList.remove('walking', 'back'), 220);
  }

  // Click a step → scroll to its segment
  pins.filter(p => p.type === 'steps').forEach(pin => {
    [...pin.items, ...pin.scenes].forEach((it, k) => {
      const i = k % pin.items.length;
      it.style.cursor = 'pointer';
      it.addEventListener('click', () => {
        if (!isPinned(pin)) return;
        const top = pin.el.getBoundingClientRect().top + scrollY - pinTop(pin);
        const dist = pin.el.offsetHeight - pin.stage.offsetHeight;
        scrollTo({ top: top + dist * ((i + .5) / pin.items.length), behavior: 'smooth' });
      });
    });
  });

  // ---------- Count-up numbers ----------
  const counters = document.querySelectorAll('.count');
  function runCount(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const from = parseFloat(el.dataset.from || '0');
    const to = parseFloat(el.dataset.to);
    const dec = parseInt(el.dataset.dec || '0', 10);
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    const t0 = performance.now();
    const dur = 1300;
    const step = now => {
      const k = clamp((now - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + (from + (to - from) * e).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if (!reduceMotion && 'IntersectionObserver' in window) {
    counters.forEach(el => { el.textContent = (el.dataset.prefix || '') + parseFloat(el.dataset.from || '0').toFixed(parseInt(el.dataset.dec || '0', 10)) + (el.dataset.suffix || ''); });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { runCount(e.target); io.unobserve(e.target); } });
    }, { threshold: 1 });
    counters.forEach(el => io.observe(el));
  }

  // ---------- Loop ----------
  let ticking = false;
  function frame() {
    ticking = false;
    heroUpdate();
    pins.forEach(pinUpdate);
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { pins.forEach(p => { p.idx = -1; }); request(); });
  frame();
})();
