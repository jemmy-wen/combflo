/* CombFlo — shared behaviour */
window.CF = (() => {
  // ---- Config -------------------------------------------------------
  // 有 LINE 官方帳號連結時填入，所有「加入 LINE」按鈕才會出現。
  const LINE_URL = '';
  // 表單送出的 API 位址；留空時為示意模式（直接視為送出成功）。
  const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxAh8q-xPeahP4YTg6j9AKHtzUPA9RDNvfMRbF87C1Si4FC-yRxOnMex8WmSqU5PEJg/exec';
  const STORE_KEY = 'combflo.check.v1';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Storage (always guarded) --------------------------------------
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
  }
  function save(state) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* private mode */ }
  }
  function clear() {
    try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
  }

  // ---- LINE links ----------------------------------------------------
  document.querySelectorAll('[data-line]').forEach(el => {
    if (!LINE_URL) { el.hidden = true; return; }
    el.hidden = false;
    if (el.tagName === 'A') el.href = LINE_URL;
  });

  // ---- Header --------------------------------------------------------
  const header = document.querySelector('.site-header');
  const onScrollHeader = () => header?.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  const menu = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? '關閉導覽' : '開啟導覽');
    nav.classList.toggle('open', open);
  });
  nav?.addEventListener('click', e => {
    if (e.target.closest('a') && menu?.getAttribute('aria-expanded') === 'true') menu.click();
  });

  // ---- Reveal on scroll ----------------------------------------------
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  // ---- Dialogs -------------------------------------------------------
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelectorAll('.dialog-close,[data-dialog-close]').forEach(b => b.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', e => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    });
  });

  // ---- Floating CTA state ----------------------------------------------
  const fab = document.querySelector('[data-fab]');
  if (fab) {
    const s = load();
    const main = fab.querySelector('[data-fab-main]');
    const sub = fab.querySelector('[data-fab-sub]');
    if (s.done) {
      main.textContent = '查看我的結果';
      sub.textContent = s.contact ? '已留下聯絡方式' : '還沒留下聯絡方式';
      fab.href = 'check.html#result';
    } else if (s.answered > 0) {
      main.textContent = '繼續流程盤點';
      sub.textContent = `已完成 ${s.answered} / 9 題`;
    }
    const hero = document.querySelector('.hero');
    const ending = document.querySelector('#ending');
    let endingVisible = false;
    if (ending && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { endingVisible = e.isIntersecting; tick(); }, { threshold: .2 }).observe(ending);
    }
    function tick() {
      const past = hero ? scrollY > hero.offsetHeight * .6 : true;
      fab.classList.toggle('show', past && !endingVisible);
    }
    addEventListener('scroll', tick, { passive: true });
    tick();
  }

  return { LINE_URL, FORM_ENDPOINT, reduceMotion, load, save, clear };
})();
