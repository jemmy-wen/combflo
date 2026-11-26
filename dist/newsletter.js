/* CombFlo — 電子報訂閱（獨立檔，不用改 check.js / site.js）
 *
 * 流程：使用者勾選並填 Email → 按「留下聯絡方式」→ 原本的聯絡表單送出成功
 *       （感謝畫面出現）後，才把 Email 送到官網的訂閱 API。
 * 訂閱失敗不影響聯絡表單。這支程式裡沒有、也不需要任何金鑰。
 */
(() => {
  // 官網訂閱 API。刻意用「/」開頭：掛在 ingsist.com/combflo 底下時，會打到 ingsist.com/api/subscribe
  const SUBSCRIBE_URL = '/api/subscribe';
  // 要和官網訂閱 API 接受的來源值一致
  const SOURCE = 'combflo-result';

  const form = document.querySelector('[data-form]');
  const box = document.querySelector('[data-nl]');
  const thanks = document.querySelector('[data-thanks]');
  if (!form || !box || !thanks) return;

  const optIn = box.querySelector('[name="nl_opt"]');
  const field = box.querySelector('[data-nl-field]');
  const email = box.querySelector('[name="nl_email"]');
  const trap = box.querySelector('[name="nl_website"]');
  const err = box.querySelector('[data-nl-err]');
  let pending = null; // 這次送出待訂閱的資料

  const clearError = () => { err.textContent = ''; field.classList.remove('invalid'); };
  const sync = () => {
    field.hidden = !optIn.checked;
    email.required = optIn.checked;
    if (!optIn.checked) clearError();
  };
  optIn.addEventListener('change', sync);
  email.addEventListener('input', clearError);
  sync();

  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 120;

  // 用 capture 階段，比 check.js 的送出處理先執行
  document.addEventListener('submit', e => {
    if (e.target !== form) return;
    pending = null;
    if (!optIn.checked) return;
    const value = email.value.trim();
    if (!isEmail(value)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      err.textContent = '請填寫正確的 Email';
      field.classList.add('invalid');
      email.focus();
      return;
    }
    pending = { email: value };
  }, true);

  // 聯絡表單成功時，check.js 會把感謝畫面的 hidden 拿掉
  new MutationObserver(() => {
    if (thanks.hidden || !pending) return;
    const body = {
      email: pending.email,
      source: SOURCE,
      path: location.pathname,
      consent: true,
      website: trap.value,                      // 蜜罐：真人看不到，不會填
      elapsed: Math.round(performance.now()),   // 從開頁到送出的毫秒數
    };
    pending = null;
    fetch(SUBSCRIBE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    })
      .then(res => { if (!res.ok) console.warn('[newsletter] 訂閱失敗 HTTP ' + res.status); })
      .catch(() => console.warn('[newsletter] 訂閱失敗（連線）'));
  }).observe(thanks, { attributes: true, attributeFilter: ['hidden'] });
})();
