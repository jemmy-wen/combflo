/* CombFlo — process check: quiz → scoring → result → contact */
(() => {
  const { load, save, clear, reduceMotion, FORM_ENDPOINT, LINE_URL } = window.CF;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ================= Questions =================
  const QUESTIONS = [
    { id: 'q1', type: 'multi', max: 2, tiles: true, title: '哪些環節最耗時？（最多選 2 項）', options: [
      ['quote', '報價', 'I-01'], ['order', '接單與訂單處理', 'I-02'], ['plan', '排程與生管', 'I-03'], ['buy', '採購備料', 'I-04'],
      ['ship', '出貨與對帳', 'I-05'], ['qc', '品質紀錄', 'I-06'], ['other', '其他', 'I-07']] },
    { id: 'q2', type: 'single', title: '同一份資料（例如訂單），要在幾個地方重複輸入？', options: [
      ['1', '1 個地方'], ['2', '2 個'], ['3', '3 個以上'], ['unsure', '不確定']] },
    { id: 'q3', type: 'single', title: '若負責某環節的人明天不在，會怎樣？', options: [
      ['ok', '有人接手，沒影響'], ['slow', '會慢，但能撐'], ['stuck', '整件事會卡住']] },
    { id: 'q4', type: 'multi', tiles: true, title: '目前主要用什麼記錄訂單與生產？', options: [
      ['paper', '紙本', 'I-08'], ['excel', 'Excel 或 Google 試算表', 'I-09'], ['line', 'LINE', 'I-10'],
      ['erp', '現成 ERP 或套裝系統', 'I-11'], ['custom', '自己開發的系統', 'I-12']] },
    { id: 'q5', type: 'single', title: '這些工具之間的資料怎麼連？', options: [
      ['copy', '靠人複製貼上'], ['partial', '部分可匯出匯入'], ['auto', '已自動串接'], ['none', '沒有連']] },
    { id: 'q6', type: 'single', title: '作業流程是否寫下來？', options: [
      ['none', '沒有，在人的腦袋裡'], ['partial', '部分有文件'], ['yes', '有，而且大家照著做']] },
    { id: 'q7', type: 'single', title: '有沒有買過系統，但用不順、對不上流程？', options: [
      ['yes', '有'], ['no', '沒有'], ['never', '還沒買過系統']] },
    { id: 'q8', type: 'single', title: '最想先改善哪一件事？', options: [
      ['time', '少花時間在重複工作'], ['clear', '資料一目了然'], ['people', '不依賴特定一個人'], ['error', '減少出錯']] },
    { id: 'q9', type: 'text', title: '一句話形容你最大的困擾？', placeholder: '例如：訂單一改，每個人手上的資料就對不起來。' },
  ];
  const N = QUESTIONS.length;
  /* illustration-files:start */
  const ILLUSTRATION_FILES = {"I-01": "assets/i-01-v1.png", "I-02": "assets/i-02-v1.png", "I-03": "assets/i-03-v1.png", "I-04": "assets/i-04-v1.png", "I-05": "assets/i-05-v1.png", "I-06": "assets/i-06-v1.png", "I-08": "assets/i-08-v1.png", "I-10": "assets/i-10-v1.png", "I-11": "assets/i-11-v1.png", "I-12": "assets/i-12-v1.png", "I-07": "assets/i-10-v1.png", "I-09": "assets/h-05-spreadsheet-v1.png"};
  /* illustration-files:end */

  const TIPS = {
    single: '點一下就會自動到下一題。',
    multi: '可複選，選好按「下一題」。',
    multi2: '最多選 2 項，選好按「下一題」。',
    text: '選填，也可以直接看結果。',
  };

  // ================= Profiles =================
  const PROFILES = {
    1: { name: '老師傅型', role: '經驗守門人', tint: 'var(--t1)', tags: ['經驗傳承', '現場熟手', '人是關鍵'],
      summary: '經驗都在人身上，流程大多靠熟手記得。',
      daily: '熟手的現場經驗，是工廠的重要資產。流程大多靠熟手記得，工具以紙本、LINE、Excel 為主。',
      guide: '先把關鍵流程寫下來，定出誰負責什麼。',
      first: '選一個最依賴熟手的環節，把步驟、負責人和例外處理整理成一頁。',
      priority: '讓經驗能交接', img: 'assets/craftsman-approved.png', slot: 'RC-01', slotDesc: '工廠師傅' },
    2: { name: '工具收集型', role: '工具整合手', tint: 'var(--t2)', tags: ['工具不少', '資料搬運', '等待串接'],
      summary: '買了不少工具，但彼此對不上，資料要靠人搬來搬去。',
      daily: '已經願意使用數位工具，也累積了一些基礎。用了多個工具，資料要靠人搬來搬去，流程也還沒定。',
      guide: '先釐清流程，再決定哪些工具留下、哪些整合。',
      first: '追一張訂單，列出資料經過哪些工具、在哪裡重填，再找出要保留的主資料。',
      priority: '先釐清再整合', img: 'assets/rc-02-office-v1.png', slot: 'RC-02', slotDesc: '辦公室人員' },
    3: { name: '流程明白型', role: '流程領航員', tint: 'var(--t3)', tags: ['分工清楚', '有章可循', '工具待補'],
      summary: '想清楚了，工具還沒跟上。',
      daily: '流程已有共識，這是選工具時很好的起點。流程大致有文件，但還靠紙本或 Excel 在跑。',
      guide: '挑最耗時的一兩個環節，補上合適的工具。',
      first: '挑一個最耗時的紙本或試算表步驟，先試一項能減少重填的小工具。',
      priority: '補上合適工具', img: 'assets/rc-03-owner-v1.png', slot: 'RC-03', slotDesc: '工廠老闆' },
    4: { name: '蓄勢待發型', role: '自動化先鋒', tint: 'var(--t4)', tags: ['流程明確', '資料集中', '準備加速'],
      summary: '流程明確、資料大致集中，可以往自動化走了。',
      daily: '流程與資料已有基礎，可以開始評估更進一步的串接。流程明確，資料大致集中。',
      guide: '找出重複性最高的環節，評估自動化或 AI。',
      first: '找一個規則清楚、重複性高的步驟，小範圍試跑，再確認省下的時間與例外情況。',
      priority: '小範圍試自動化', img: 'assets/rc-04-successor-v1.png', slot: 'RC-04', slotDesc: '二代接班人' },
  };

  // ================= Scoring =================
  function score(a) {
    const digital = (a.q4 || []).filter(v => v !== 'paper').length;
    const link = { copy: .5, partial: 1, auto: 2, none: 0 }[a.q5] ?? 0;
    const tools = digital + link;                       // 0–6
    const toolsMany = tools >= 2.5;

    const p2 = { '1': 2, '2': 1, '3': 0, unsure: .5 }[a.q2] ?? 0;
    const p3 = { ok: 2, slow: 1, stuck: 0 }[a.q3] ?? 0;
    const p6 = ({ none: 0, partial: 1, yes: 2 }[a.q6] ?? 0) * 1.5;
    const processPct = (p2 + p3 + p6) / 7 * 100;        // 0–100
    const clear = processPct >= 55;

    const type = clear ? (toolsMany ? 4 : 3) : (toolsMany ? 2 : 1);
    const lv = { low: 1, mid: 2, high: 3 };
    return {
      type,
      toolsPct: Math.round(tools / 6 * 100),
      processPct: Math.round(processPct),
      meters: [
        { label: '重複輸入度', level: lv[{ '1': 'low', '2': 'mid', '3': 'high', unsure: 'mid' }[a.q2] || 'mid'], lowerBetter: true },
        { label: '依賴單一人度', level: lv[{ ok: 'low', slow: 'mid', stuck: 'high' }[a.q3] || 'mid'], lowerBetter: true },
        { label: '資料連通度', level: lv[{ copy: 'low', partial: 'mid', auto: 'high', none: 'low' }[a.q5] || 'low'], lowerBetter: false },
      ],
      q7: a.q7 === 'yes',
    };
  }

  // ================= State =================
  let state = Object.assign({ answers: {}, step: 0, answered: 0, done: false, contact: false }, load());
  const persist = () => {
    state.answered = QUESTIONS.filter(q => isAnswered(q, state.answers[q.id])).length;
    save(state);
  };
  function isAnswered(q, v) {
    if (q.type === 'multi') return Array.isArray(v) && v.length > 0;
    if (q.type === 'text') return typeof v === 'string' && state.step >= N;
    return !!v;
  }

  // ================= Screens =================
  function show(screen) {
    document.body.dataset.screen = screen;
    window.scrollTo(0, 0);
  }

  // ---------- Intro ----------
  const startBtn = $('[data-start]');
  const restartBtn = $('[data-restart]');
  function setupIntro() {
    const inProgress = !state.done && state.answered > 0;
    $('[data-start-label]').textContent = inProgress ? '繼續流程盤點' : '開始流程盤點';
    restartBtn.hidden = !inProgress;
    const note = $('[data-resume-note]');
    note.hidden = !inProgress;
    if (inProgress) note.textContent = `已完成 ${state.answered} / 9 題，會從上次的地方接著作答。`;
  }
  startBtn.addEventListener('click', () => {
    if (state.done) state = { answers: {}, step: 0, answered: 0, done: false, contact: false };
    renderQ(Math.min(state.step, N - 1), 'fwd');
    show('quiz');
  });
  restartBtn.addEventListener('click', () => {
    clear();
    state = { answers: {}, step: 0, answered: 0, done: false, contact: false };
    renderQ(0, 'fwd');
    show('quiz');
  });

  // ---------- Quiz ----------
  const card = $('[data-qcard]');
  const optsEl = $('[data-options]');
  const feedback = $('[data-feedback]');
  const actions = $('[data-actions]');
  const nextBtn = $('[data-next]');
  const tip = $('[data-tip]');
  const seg = $('[data-seg]');
  seg.innerHTML = QUESTIONS.map(() => '<li></li>').join('');

  function renderProgress(i) {
    $$('li', seg).forEach((li, k) => { li.className = k < i ? 'done' : k === i ? 'now' : ''; });
    $('[data-hdr-fill]').style.width = `${(i / N) * 100}%`;
    $('[data-hdr-count]').textContent = `${i + 1} / ${N}`;
  }

  function renderQ(i, dir) {
    state.step = i;
    persist();
    const q = QUESTIONS[i];
    const val = state.answers[q.id];
    renderProgress(i);

    $('[data-qno]').textContent = `Q${i + 1}`;
    $('[data-qkind]').textContent = q.type === 'multi' ? '可複選' : q.type === 'text' ? '選填' : '';
    $('[data-qtitle]').textContent = q.title;
    feedback.textContent = '';
    feedback.classList.remove('warn');

    const tipText = q.type === 'text' ? TIPS.text : q.type === 'multi' ? (q.max ? TIPS.multi2 : TIPS.multi) : TIPS.single;
    if (tip.textContent !== tipText) { tip.textContent = tipText; tip.classList.remove('swap'); void tip.offsetWidth; tip.classList.add('swap'); }

    optsEl.className = 'q-options' + (q.tiles ? ' tiles' : '');
    optsEl.setAttribute('role', q.type === 'single' ? 'radiogroup' : 'group');
    optsEl.innerHTML = '';

    if (q.type === 'text') {
      const ta = document.createElement('textarea');
      ta.className = 'q-text';
      ta.placeholder = q.placeholder;
      ta.setAttribute('aria-labelledby', 'q-title');
      ta.maxLength = 200;
      ta.value = val || '';
      ta.addEventListener('input', () => { state.answers[q.id] = ta.value; save(state); });
      optsEl.append(ta);
    } else {
      q.options.forEach(([value, label, icon], k) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'opt' + (q.type === 'multi' ? ' multi' : '');
        b.dataset.value = value;
        const selected = q.type === 'multi' ? (val || []).includes(value) : val === value;
        if (q.type === 'single') { b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(selected)); }
        else b.setAttribute('aria-pressed', String(selected));
        b.innerHTML = (icon ? `<span class="sprite rel icon" data-slot="${icon}" aria-hidden="true">${ILLUSTRATION_FILES[icon] ? `<img src="${ILLUSTRATION_FILES[icon]}" alt="">` : `<span><b>${icon}</b></span>`}</span>` : '')
          + `<span class="key" aria-hidden="true">${k + 1}</span><span class="lbl"></span><span class="tick" aria-hidden="true"></span>`;
        b.querySelector('.lbl').textContent = label;
        b.addEventListener('click', () => choose(q, b));
        optsEl.append(b);
      });
    }

    actions.hidden = q.type === 'single';
    nextBtn.innerHTML = i === N - 1 ? '看我的結果 <span class="btn-arrow" aria-hidden="true">→</span>' : '下一題 <span class="btn-arrow" aria-hidden="true">→</span>';
    updateNext(q);

    card.classList.remove('enter-fwd', 'enter-back');
    void card.offsetWidth;
    if (!reduceMotion) card.classList.add(dir === 'back' ? 'enter-back' : 'enter-fwd');
  }

  function updateNext(q) {
    if (q.type === 'multi') {
      const n = (state.answers[q.id] || []).length;
      nextBtn.disabled = n === 0;
      if (!feedback.classList.contains('warn')) feedback.textContent = n ? `已選擇 ${n}${q.max ? ` / ${q.max}` : ''} 項` : '';
    } else nextBtn.disabled = false;
  }

  let advancing = false;
  function choose(q, b) {
    if (advancing) return;
    const v = b.dataset.value;
    b.classList.remove('pop', 'shake'); void b.offsetWidth;
    if (q.type === 'single') {
      state.answers[q.id] = v;
      $$('.opt', optsEl).forEach(o => o.setAttribute('aria-checked', String(o === b)));
      b.classList.add('pop');
      persist();
      advancing = true;
      setTimeout(() => { advancing = false; go(1); }, reduceMotion ? 80 : 340);
      return;
    }
    const arr = state.answers[q.id] ? [...state.answers[q.id]] : [];
    const has = arr.includes(v);
    feedback.classList.remove('warn');
    if (!has && q.max && arr.length >= q.max) {
      b.classList.add('shake');
      feedback.textContent = `最多選 ${q.max} 項，請先取消一個選項。`;
      feedback.classList.add('warn');
      return;
    }
    state.answers[q.id] = has ? arr.filter(x => x !== v) : [...arr, v];
    b.setAttribute('aria-pressed', String(!has));
    b.classList.add('pop');
    persist();
    updateNext(q);
  }

  function go(delta) {
    const i = state.step + delta;
    if (i < 0) { setupIntro(); show('intro'); return; }
    if (i >= N) { finish(); return; }
    renderQ(i, delta > 0 ? 'fwd' : 'back');
  }

  card.addEventListener('submit', e => { e.preventDefault(); if (!nextBtn.disabled) go(1); });
  $('[data-back]').addEventListener('click', () => go(-1));

  // number keys pick options
  addEventListener('keydown', e => {
    if (document.body.dataset.screen !== 'quiz' || e.target.matches('textarea,input')) return;
    const k = parseInt(e.key, 10);
    if (k >= 1 && k <= 9) { const b = $$('.opt', optsEl)[k - 1]; if (b) { b.click(); b.focus(); } }
  });

  // ---------- Finish → loading → result ----------
  function finish() {
    state.step = N;
    state.done = true;
    state.result = score(state.answers);
    persist();
    show('loading');
    setTimeout(() => { renderResult(true); show('result'); }, reduceMotion ? 300 : 1900);
  }

  // ---------- Result ----------
  const resultSec = $('.result');
  function renderResult(animate) {
    const r = state.result || score(state.answers);
    const p = PROFILES[r.type];
    resultSec.style.setProperty('--tint', p.tint);
    resultSec.style.setProperty('--tint-soft', `var(--t${r.type}s)`);
    const set = (k, v) => { const el = $(`[data-r="${k}"]`); if (el) el.textContent = v; };
    set('no', `NO. 0${r.type} / 04`);
    set('name', p.name);
    set('role', p.role);
    set('summary', p.summary);
    set('priority', p.priority);
    set('daily', p.daily);
    set('guide', p.guide);
    set('first', p.first);
    $('[data-r="tags"]').replaceChildren(...p.tags.map(t => Object.assign(document.createElement('span'), { textContent: '#' + t })));
    $('[data-r="q7"]').hidden = !r.q7;

    const portrait = $('[data-r="portrait"]');
    portrait.dataset.slot = p.slot;
    portrait.innerHTML = p.img
      ? `<img src="${p.img}" alt="${p.role}：${p.slotDesc}">`
      : `<span><b>${p.slot}</b>角色立繪：${p.slotDesc}</span>`;

    const words = ['', '低', '中', '高'];
    const meters = $('[data-r="meters"]');
    meters.innerHTML = '';
    r.meters.forEach(m => {
      const good = m.lowerBetter ? 4 - m.level : m.level; // 1 bad … 3 good
      const mc = good === 3 ? 'var(--teal)' : good === 2 ? '#c99a2e' : 'var(--orange-deep)';
      const row = document.createElement('div');
      row.className = 'meter';
      row.style.setProperty('--mc', mc);
      row.innerHTML = `<span></span><span class="meter-bar" role="img" aria-label="${m.label}：${words[m.level]}">${[0, 1, 2].map(k => `<i style="--k:${k}"></i>`).join('')}</span><span class="meter-val">${words[m.level]}</span>`;
      row.firstElementChild.textContent = m.label;
      meters.append(row);
      const fill = () => $$('.meter-bar i', row).forEach((i, k) => i.classList.toggle('on', k < m.level));
      if (animate && !reduceMotion) requestAnimationFrame(() => requestAnimationFrame(fill)); else fill();
    });

    const rc = $('[data-card]');
    rc.classList.remove('flip'); void rc.offsetWidth;
    if (animate && !reduceMotion) rc.classList.add('flip');

    // contact state
    if (state.contact && state.variant) showThanks(state.variant, false);
  }

  $('[data-retake]').addEventListener('click', () => {
    clear();
    state = { answers: {}, step: 0, answered: 0, done: false, contact: false };
    $('[data-contact-panel]').hidden = false;
    $('[data-thanks]').hidden = true;
    setupIntro();
    show('intro');
  });

  // Save card as image (html2canvas loaded on demand)
  const saveBtn = $('[data-save]');
  saveBtn.addEventListener('click', async () => {
    const label = saveBtn.textContent;
    saveBtn.textContent = '產生圖片中…';
    saveBtn.classList.add('loading');
    try {
      if (!window.html2canvas) {
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          s.onload = res; s.onerror = rej;
          document.head.append(s);
        });
      }
      const node = $('[data-card]');
      node.classList.remove('flip');
      const canvas = await window.html2canvas(node, { backgroundColor: null, scale: 2, useCORS: true });
      const a = document.createElement('a');
      a.download = `CombFlo-流程盤點-${PROFILES[state.result.type].name}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      saveBtn.textContent = '已儲存 ✓';
    } catch {
      saveBtn.textContent = '儲存失敗，請稍後再試';
    } finally {
      saveBtn.classList.remove('loading');
      setTimeout(() => { saveBtn.textContent = label; }, 2400);
    }
  });

  // ---------- Contact form ----------
  const form = $('[data-form]');
  const fail = $('[data-fail]');
  const REQUIRED = {
    company: '請填寫公司名稱',
    name: '請填寫稱呼與角色',
    contact: '請填寫 LINE ID 或電話',
    city: '請選擇公司所在地',
    size: '請選擇公司人數',
    consent: '請勾選同意，我們才能與你聯絡',
  };
  function validate() {
    const fd = new FormData(form);
    let first = null;
    Object.entries(REQUIRED).forEach(([k, msg]) => {
      const ok = k === 'consent' ? !!fd.get(k) : !!String(fd.get(k) || '').trim();
      const err = $(`[data-err="${k}"]`, form);
      err.textContent = ok ? '' : msg;
      const wrap = k === 'consent' ? $('.consent', form) : form.elements[k]?.closest?.('.field') || form.elements[k]?.[0]?.closest('.field');
      wrap?.classList.toggle('invalid', !ok);
      if (!ok && !first) first = form.elements[k]?.focus ? form.elements[k] : form.elements[k]?.[0];
    });
    if (first) first.focus();
    return !first;
  }
  form.addEventListener('input', e => {
    const name = e.target.name;
    if (!name || !REQUIRED[name]) return;
    const wrap = name === 'consent' ? $('.consent', form) : e.target.closest('.field');
    if (wrap?.classList.contains('invalid')) { wrap.classList.remove('invalid'); $(`[data-err="${name}"]`, form).textContent = ''; }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    fail.hidden = true;
    if (!validate()) return;
    const fd = Object.fromEntries(new FormData(form));
    const payload = { ...fd, answers: state.answers, result: state.result };
    const btn = $('[data-submit]');
    btn.classList.add('loading');
    btn.textContent = '送出中…';
    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(res.status);
      } else {
        await new Promise(r => setTimeout(r, 700)); // demo mode
      }
      const northern = ['台北市', '新北市', '基隆市', '桃園市'].includes(fd.city);
      const sizeOk = ['30–50 人', '51–100 人'].includes(fd.size);
      state.contact = true;
      state.variant = northern && sizeOk ? 'A' : 'B';
      persist();
      showThanks(state.variant, true);
    } catch {
      fail.textContent = LINE_URL
        ? '送出沒有成功，請稍後再試一次，或直接加入 LINE 與我們聯繫。'
        : '送出沒有成功，請稍後再試一次。';
      fail.hidden = false;
    } finally {
      btn.classList.remove('loading');
      btn.textContent = '留下聯絡方式';
    }
  });

  const THANKS = {
    A: { title: '收到了，謝謝你的填寫。',
      body: '我們團隊會視情況，在工作空檔主動與你聯繫，先聊聊你的現況。如果合適，再一起安排到廠看看。也可以先加入我們的 LINE，之後聯絡比較方便。' },
    B: { title: '謝謝你的填寫，結果已在上面。',
      body: '你的流程盤點結果已經在上面了，可以作為參考。目前試辦的到廠名額，以北北基桃、約 30–50 人的工廠為優先，所以這一階段我們可能無法很快安排。你的資料我們會先收著，之後若有機會，會再與你聯繫。也歡迎加入 LINE，之後我們會分享更多流程梳理的內容。' },
  };
  function showThanks(variant, focus) {
    const t = THANKS[variant];
    $('[data-thanks-title]').textContent = t.title;
    $('[data-thanks-body]').textContent = t.body;
    $('[data-contact-panel]').hidden = true;
    const box = $('[data-thanks]');
    box.hidden = false;
    if (focus) { box.focus({ preventScroll: true }); box.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); }
  }

  // ================= Boot =================
  if (state.done && state.result) {
    renderResult(false);
    show('result');
    if (location.hash === '#contact') setTimeout(() => $('#contact').scrollIntoView(), 50);
  } else {
    setupIntro();
    show('intro');
  }
})();
