/* CombFlo — 結果頁「免費訪談」卡片（獨立檔，不用改 check.js）
 *
 * 問題：送出聯絡表單後，「預約免費諮詢」按鈕還在，點了只會捲到感謝畫面。
 * 做法：送出後卡片改成「已收到聯絡資料」，按鈕改為加入 LINE（沒設 LINE 網址就收起卡片）。
 *       按「重新盤點」後恢復原本內容。
 */
(() => {
  const card = document.querySelector('.book-card');
  const thanks = document.querySelector('[data-thanks]');
  if (!card || !thanks) return;
  const title = card.querySelector('h3');
  const text = card.querySelector('h3 + p');
  const link = card.querySelector('a.btn');
  if (!title || !text || !link) return;

  const original = { title: title.textContent, text: text.textContent, label: link.textContent, href: link.getAttribute('href') };
  const lineUrl = (window.CF && window.CF.LINE_URL) || '';

  function update() {
    const submitted = !thanks.hidden;
    card.hidden = submitted && !lineUrl;
    const useLine = submitted && !!lineUrl;
    title.textContent = useLine ? '已收到聯絡資料' : original.title;
    text.textContent = useLine ? '也可以加入 LINE，之後聯絡比較方便。' : original.text;
    link.textContent = useLine ? '加入 LINE' : original.label;
    link.setAttribute('href', useLine ? lineUrl : original.href);
    if (useLine) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    } else {
      link.removeAttribute('target');
      link.removeAttribute('rel');
    }
  }

  update();
  new MutationObserver(update).observe(thanks, { attributes: true, attributeFilter: ['hidden'] });
})();
