/* CombFlo — 名單來源（獨立檔，不用改 check.js / site.js / newsletter.js）
 *
 * 從網址記下行銷參數（utm_*），保存在瀏覽器 30 天（以最後一次帶參數的連結為準），
 * 聯絡表單送出時一起寫進試算表。不收集其他資料。
 */
(() => {
  const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  const STORE = 'combflo-source';
  const MAX_AGE = 30 * 86400000;
  let current = null;

  const query = new URLSearchParams(location.search);
  if (query.get('utm_source')) {
    current = { at: Date.now() };
    KEYS.forEach(k => { current[k] = (query.get(k) || '').slice(0, 100); });
    try { localStorage.setItem(STORE, JSON.stringify(current)); } catch (e) { /* 無痕或封鎖儲存時，只有本頁有效 */ }
  }

  function read() {
    if (current) return current;
    try {
      const saved = JSON.parse(localStorage.getItem(STORE));
      if (saved && Date.now() - saved.at < MAX_AGE) return saved;
    } catch (e) { /* 沒有或讀不到 */ }
    return null;
  }

  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    const endpoint = window.CF && window.CF.FORM_ENDPOINT;
    if (endpoint && input === endpoint && init && typeof init.body === 'string') {
      const source = read();
      if (source) {
        try {
          const body = JSON.parse(init.body);
          KEYS.forEach(k => { body[k] = source[k] || ''; });
          init = Object.assign({}, init, { body: JSON.stringify(body) });
        } catch (e) { /* 解析失敗就照原樣送出，不能擋住表單 */ }
      }
    }
    return originalFetch.call(this, input, init);
  };
})();
