/* CombFlo — GA4 流量分析（獨立檔，不用改 check.js / site.js / newsletter.js）
 *
 * 和官網同一個 GA4 資源。只送「發生了什麼動作」，不送任何表單內容、作答內容或 Email。
 * 只在 ingsist.com 上運作；本機或 vercel.app 預覽不會送資料。
 * 本機測試：網址加 ?cfm_debug=1，事件只寫進 window.dataLayer 與主控台，不會送到 Google。
 */
(() => {
  const GA_ID = 'G-RY9DD4Q0B0';
  const live = /(^|\.)ingsist\.com$/.test(location.hostname);
  const debug = !live && /[?&]cfm_debug=1/.test(location.search);
  if (!live && !debug) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  if (live) {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID); // page_view 由這行自動送出，網址上的 UTM 會一起被記錄
  }

  const sent = new Set();
  function track(name, params, once) {
    if (once) {
      if (sent.has(name)) return;
      sent.add(name);
    }
    gtag('event', name, params || {});
    if (debug) console.log('[cf-measure]', name, JSON.stringify(params || {}));
  }

  // 開始盤點（含「繼續」與「重新開始」）；每次開頁只算一次
  document.addEventListener('click', e => {
    if (e.target.closest('[data-start], [data-restart]')) track('combflo_check_start', {}, true);
    const line = e.target.closest('a[data-line], a[href*="lin.ee"], a[href*="line.me"]');
    if (line) track('click_line', { link_location: 'combflo' });
  }, true);

  // 完成盤點：check.js 只有在答完時會切到 loading 畫面
  const checkPage = document.body.classList.contains('page-check');
  if (checkPage) {
    new MutationObserver(() => {
      if (document.body.dataset.screen === 'loading') track('combflo_check_complete', {}, true);
    }).observe(document.body, { attributes: true, attributeFilter: ['data-screen'] });
  }

  // 送出聯絡資料：本次有按送出，而且感謝畫面出現（代表表單寫入成功）
  const form = document.querySelector('[data-form]');
  const thanks = document.querySelector('[data-thanks]');
  if (form && thanks) {
    let submitted = false;
    document.addEventListener('submit', e => { if (e.target === form) submitted = true; }, true);
    new MutationObserver(() => {
      if (thanks.hidden || !submitted) return; // 回訪者直接看到感謝畫面時不重複算
      submitted = false;
      track('generate_lead', { form_name: 'combflo' }, true);
    }).observe(thanks, { attributes: true, attributeFilter: ['hidden'] });
  }

  // 訂閱電子報：只在訂閱接口回應成功時記錄
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    const result = originalFetch.apply(this, arguments);
    if (input === '/api/subscribe') {
      result.then(res => { if (res.ok) track('newsletter_subscribe', { source: 'combflo-result' }, true); }).catch(() => {});
    }
    return result;
  };
})();
