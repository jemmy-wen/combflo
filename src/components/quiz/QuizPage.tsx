// 測驗頁：整頁固定為螢幕高度。上方標題＋進度，中間內容可捲動，操作按鈕固定在最下面。
// 流程：Q1–Q9 → 結果（底部常駐「馬上預約免費諮詢」）→ 預約表單 → 送出完成
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QUESTIONS, TYPES, SYSTEM_NOTE, REGIONS, HEADCOUNTS, CONTACT_TIMES, type TypeKey } from '../../content/quiz';
import { score, LEVEL_LABEL, type Answers, type Level } from '../../lib/scoring';
import { track, getUtm } from '../../lib/track';
import { LINE_URL } from '../../lib/site';
import { Icon, I, Right } from '../ui/Shared';

const STORE = 'cf3_quiz';
const TOTAL = QUESTIONS.length;
const KEYS = 'ABCDEFG';

type View = 'q' | 'result' | 'contact' | 'done';
type Saved = { step: number; answers: Answers };
const load = (): Saved => {
  try { const s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s && typeof s.step === 'number') return { ...s, step: Math.max(1, s.step) }; } catch {}
  return { step: 1, answers: {} };
};

export default function QuizPage() {
  const [state, setState] = useState<Saved>({ step: 1, answers: {} });
  const [view, setView] = useState<View>('q');
  const [ready, setReady] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const [flash, setFlash] = useState<string | null>(null);
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const lock = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const l = load();
    setState(l);
    if (l.step > TOTAL) setView('result');
    setReady(true);
    if (l.step === 1 && !Object.keys(l.answers).length) track('quiz_start');
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(STORE, JSON.stringify(state)); } catch {} }, [state, ready]);
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }); }, [state.step, view]);

  const { step, answers } = state;
  const q = view === 'q' ? QUESTIONS[step - 1] : null;
  const result = useMemo(() => score(answers), [answers]);

  const go = useCallback((next: number) => {
    setDir(next > step ? 1 : -1);
    if (next > TOTAL) {
      setState((s) => ({ ...s, step: TOTAL + 1 }));
      setView('result');
      track('quiz_complete');
      return;
    }
    setState((s) => ({ ...s, step: Math.max(1, next) }));
    setView('q');
  }, [step]);

  const answered = !q ? false : q.kind === 'text' ? true : Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).length > 0 : !!answers[q.id];

  const pick = useCallback((value: string) => {
    if (!q || lock.current) return;
    if (q.kind === 'single') {
      setState((s) => ({ ...s, answers: { ...s.answers, [q.id]: value } }));
      setFlash(value);
      lock.current = true;
      setTimeout(() => { lock.current = false; setFlash(null); go(step + 1); }, 360);
    } else {
      setState((s) => {
        const cur = (s.answers[q.id] as string[]) || [];
        let next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
        if (q.max && next.length > q.max) next = next.slice(next.length - q.max);
        return { ...s, answers: { ...s.answers, [q.id]: next } };
      });
    }
  }, [q, go, step]);

  // 鍵盤：A–G 選擇、Enter 下一題、← 上一題
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (view !== 'q' || !q) return;
      if ((e.target as HTMLElement)?.closest('input, textarea, select')) return;
      const k = e.key.toUpperCase();
      const idx = KEYS.indexOf(k) >= 0 ? KEYS.indexOf(k) : /^[1-9]$/.test(k) ? Number(k) - 1 : -1;
      if (idx >= 0 && q.options && idx < q.options.length) { e.preventDefault(); pick(q.options[idx].value); }
      if (e.key === 'Enter' && answered) go(step + 1);
      if (e.key === 'ArrowLeft' && step > 1) go(step - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!ready) return <div className="h-[100dvh] bg-cream" />;

  const progress = view === 'q' ? (step - 1) / TOTAL : 1;
  const restart = () => { setState({ step: 1, answers: {} }); setView('q'); };

  return (
    <div className="flex h-[100dvh] flex-col bg-cream">
      <header className="shrink-0 border-b border-line bg-cream">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 pb-3 pt-3.5 md:px-6">
          <a href="/" aria-label="回到流程工廠" className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-white hover:bg-ink hover:text-white"><Icon d={I.close} size={15} /></a>
          <div className="min-w-0 flex-1 truncate text-[15px] font-black">
            {view === 'contact' ? '預約免費諮詢' : view === 'done' ? '已收到' : view === 'result' ? '你的流程盤點結果' : '你的工廠，卡在哪裡？'}
          </div>
          {view === 'q' && <span className="shrink-0 text-[13px] font-bold tabular-nums text-ink-2">{step} / {TOTAL}</span>}
        </div>
        <div className="h-1 w-full bg-line">
          <div className="h-full bg-orange transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)]" style={{ width: `${progress * 100}%` }} />
        </div>
      </header>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-2xl px-4 pb-8 pt-6 md:px-6 md:pt-10">
          {q && (
            <section key={q.id} className={`q-enter ${dir > 0 ? 'from-right' : 'from-left'}`} aria-live="polite">
              <p className="eyebrow">Q{step}{q.kind === 'multi' ? `・可複選${q.max ? `，最多 ${q.max} 項` : ''}` : q.optional ? '・選填' : ''}</p>
              <h1 className="mt-2.5 text-[23px] font-black leading-[1.4] md:text-[28px]">{q.title.replace(/（最多選 \d 項）/, '')}</h1>

              {q.kind === 'text' ? (
                <textarea
                  rows={5} maxLength={300}
                  className="mt-5 w-full resize-none rounded-[12px] border border-line bg-white p-4 text-[16px] leading-relaxed outline-none transition focus:border-ink"
                  placeholder={q.placeholder}
                  value={(answers[q.id] as string) || ''}
                  onChange={(e) => setState((s) => ({ ...s, answers: { ...s.answers, [q.id]: e.target.value } }))}
                />
              ) : (
                <div className="mt-5 grid gap-2" role={q.kind === 'single' ? 'radiogroup' : 'group'} aria-label={q.title}>
                  {q.options!.map((o, i) => {
                    const v = answers[q.id];
                    const on = Array.isArray(v) ? v.includes(o.value) : v === o.value;
                    return (
                      <button key={o.value} type="button" role={q.kind === 'single' ? 'radio' : 'checkbox'} aria-checked={on}
                        onClick={() => pick(o.value)}
                        className={`opt flex items-center gap-3 rounded-[12px] px-3 py-3 text-left text-[15.5px] font-bold transition-colors ${on ? 'bg-ink text-white' : 'bg-white hover:bg-paper'} ${flash === o.value ? 'opt-flash' : ''}`}>
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[7px] text-[13px] ${on ? 'bg-orange text-ink' : 'bg-paper text-ink-3'}`}>
                          {on && q.kind === 'multi' ? '✓' : KEYS[i]}
                        </span>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {view === 'result' && <ResultView result={result} answers={answers} onEdit={(i) => go(i)} onRestart={restart} />}
          {view === 'contact' && <ContactForm answers={answers} result={result} onDone={(v) => { setVariant(v); setView('done'); }} />}
          {view === 'done' && <Done variant={variant} />}
        </div>
      </div>

      <footer className="shrink-0 border-t border-line bg-cream px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:px-6">
        <div className="mx-auto flex max-w-2xl gap-2">
          {view === 'q' && (
            <>
              {step > 1
                ? <button type="button" onClick={() => go(step - 1)} className="btn btn-ghost-dark h-12 shrink-0 !px-5">上一題</button>
                : <a href="/" className="btn btn-ghost-dark h-12 shrink-0 !px-5">回到工廠</a>}
              <button type="button" disabled={!answered} onClick={() => go(step + 1)} className="btn btn-dark h-12 flex-1 !justify-center !pr-3 disabled:opacity-30">
                <span>{step === TOTAL ? '看我的結果' : '下一題'}</span>
              </button>
            </>
          )}
          {view === 'result' && (
            <button type="button" onClick={() => { setView('contact'); track('cta_consult'); }} className="cta-glow group flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] bg-orange text-[15px] font-black text-ink transition-colors hover:bg-[#ff7f36]">
              <span>馬上預約免費諮詢</span><Right size={17} />
            </button>
          )}
          {view === 'contact' && (
            <>
              <button type="button" onClick={() => setView('result')} className="btn btn-ghost-dark h-12 shrink-0 !px-5">結果</button>
              <button type="submit" form="consult-form" className="btn btn-dark h-12 flex-1 !justify-center !pr-3"><span>送出預約</span></button>
            </>
          )}
          {view === 'done' && (
            <>
              {LINE_URL && <a href={LINE_URL} target="_blank" rel="noopener" className="btn btn-ghost-dark h-12 flex-1">加入 LINE</a>}
              <a href="/" className="btn btn-dark h-12 flex-1 !justify-center !pr-3"><span>回到流程工廠</span></a>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

const QUAD: { key: TypeKey; row: 0 | 1 }[] = [
  { key: 'clear', row: 0 }, { key: 'ready', row: 0 },
  { key: 'master', row: 1 }, { key: 'collector', row: 1 },
];

function ResultView({ result, answers, onEdit, onRestart }: { result: ReturnType<typeof score>; answers: Answers; onEdit: (step: number) => void; onRestart: () => void }) {
  const t = TYPES[result.type];
  const ind: { label: string; level: Level; good: 'low' | 'high' }[] = [
    { label: '重複輸入度', level: result.repeat, good: 'low' },
    { label: '依賴單一人度', level: result.reliance, good: 'low' },
    { label: '資料連通度', level: result.connect, good: 'high' },
  ];
  const label = (qid: string) => {
    const qq = QUESTIONS.find((x) => x.id === qid)!;
    const v = answers[qid];
    if (qq.kind === 'text') return (v as string) || '—';
    const vals = Array.isArray(v) ? v : v ? [v] : [];
    return vals.map((x) => qq.options?.find((o) => o.value === x)?.label).filter(Boolean).join('、') || '—';
  };
  return (
    <section className="q-enter from-right space-y-3">
      <div className="rounded-[14px] bg-ink p-5 text-white md:p-6">
        <p className="eyebrow !text-white/70">你的流程類型</p>
        <h1 className="mt-2 text-[34px] font-black leading-tight md:text-[40px]">{t.name}</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-white/80">{t.summary}</p>
        <div className="mt-5 grid grid-cols-[auto_1fr_1fr] gap-1.5 text-[12px]">
          <span /><span className="text-center text-white/55">工具少</span><span className="text-center text-white/55">工具多</span>
          {[0, 1].map((row) => (
            <Fragment key={row}>
              <span className="self-center pr-1.5 text-white/55">{row === 0 ? '流程明白' : '流程在人身上'}</span>
              {QUAD.filter((c) => c.row === row).map((c) => (
                <span key={c.key} className={`rounded-[8px] px-2.5 py-2.5 font-bold ${c.key === result.type ? 'bg-orange text-ink' : 'bg-white/[0.08] text-white/60'}`}>{TYPES[c.key].name}</span>
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="rounded-[14px] bg-white p-5">
        <p className="eyebrow">三個指標</p>
        <div className="mt-3">
          {ind.map((x) => {
            const bad = x.good === 'low' ? x.level === 3 : x.level === 1;
            return (
              <div key={x.label} className="grid grid-cols-[6.5rem_1fr_1.5rem] items-center gap-3 border-t border-line py-2.5 text-[13.5px]">
                <span className="text-ink-2">{x.label}</span>
                <span className="grid grid-cols-3 gap-1">{[1, 2, 3].map((n) => <span key={n} className={`h-2 rounded-full ${n <= x.level ? (bad ? 'bg-orange' : 'bg-ink') : 'bg-line'}`} />)}</span>
                <span className="text-right font-bold">{LEVEL_LABEL[x.level]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[14px] bg-white p-5">
        <p className="eyebrow">下一步通常怎麼走</p>
        <p className="mt-2 text-[17px] font-black leading-snug">{t.next}</p>
        <div className="mt-3 border-t border-line pt-3 text-[13.5px] leading-relaxed text-ink-2">{t.situation}</div>
        {result.systemNote && <div className="mt-3 border-t border-line pt-3 text-[13.5px] leading-relaxed text-ink-2">{SYSTEM_NOTE}</div>}
      </div>

      <details className="rounded-[14px] bg-white p-5">
        <summary className="cursor-pointer text-[14px] font-bold">我的作答</summary>
        <ol className="mt-2">
          {QUESTIONS.map((qq, i) => (
            <li key={qq.id} className="grid grid-cols-[2rem_1fr_auto] items-start gap-2 border-t border-line py-2.5 text-[13px]">
              <span className="font-bold text-ink-3">Q{i + 1}</span>
              <span><span className="block text-ink-3">{qq.title}</span><span className="block font-bold">{label(qq.id)}</span></span>
              <button type="button" onClick={() => onEdit(i + 1)} className="text-[12px] font-bold underline underline-offset-2">修改</button>
            </li>
          ))}
        </ol>
      </details>

      <button type="button" onClick={onRestart} className="block w-full py-2 text-center text-[13px] text-ink-3 underline underline-offset-4">重新測驗</button>
    </section>
  );
}

function ContactForm({ answers, result, onDone }: { answers: Answers; result: ReturnType<typeof score>; onDone: (v: 'A' | 'B') => void }) {
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const [touched, setTouched] = useState(false);
  const [v, setV] = useState({ company: '', nameRole: '', contact: '', contactTime: '', region: '', headcount: '', consent: false, website: '' });
  const missing = { company: !v.company.trim(), nameRole: !v.nameRole.trim(), contact: !v.contact.trim(), region: !v.region, headcount: !v.headcount, consent: !v.consent };
  const ok = !Object.values(missing).some(Boolean);
  const bad = (k: keyof typeof missing) => touched && missing[k];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!ok) { setErr('還有欄位沒填。'); return; }
    setErr(''); setSending(true);
    try {
      const res = await fetch('/api/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...v, answers, result, utm: getUtm() }) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error();
      const vv = out.variant === 'A' ? 'A' : 'B';
      track('lead_submit', { type: result.type, priority: vv });
      onDone(vv);
    } catch {
      setErr('送出沒有成功，請再試一次。');
    } finally { setSending(false); }
  };

  const input = (k: keyof typeof missing) => `mt-1.5 w-full rounded-[10px] border bg-white px-3.5 py-3 text-[16px] outline-none transition focus:border-ink ${bad(k) ? 'border-orange' : 'border-line'}`;
  const Label = ({ t, k, opt }: { t: string; k?: keyof typeof missing; opt?: boolean }) => (
    <span className="flex items-center gap-2 text-[13.5px] font-bold">{t}{opt && <span className="font-medium text-ink-3">選填</span>}{k && bad(k) && <span className="text-[12px] text-orange">必填</span>}</span>
  );
  const Chips = ({ k, options }: { k: 'region' | 'headcount' | 'contactTime'; options: string[] }) => (
    <div className="mt-1.5 flex flex-wrap gap-1.5" role="radiogroup">
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={v[k] === o} onClick={() => setV({ ...v, [k]: v[k] === o && k === 'contactTime' ? '' : o })}
          className={`rounded-[8px] border px-3 py-2 text-[14px] font-bold transition-colors ${v[k] === o ? 'border-ink bg-ink text-white' : `bg-white ${k !== 'contactTime' && bad(k) ? 'border-orange' : 'border-line'} hover:border-ink/40`}`}>{o}</button>
      ))}
    </div>
  );

  return (
    <form id="consult-form" onSubmit={submit} noValidate className="q-enter from-right">
      <h1 className="text-[23px] font-black leading-snug md:text-[28px]">留下聯絡方式，我們會主動與你聯繫。</h1>
      <div className="mt-5 grid gap-4">
        <label className="block"><Label t="公司名稱" k="company" /><input className={input('company')} autoComplete="organization" value={v.company} onChange={(e) => setV({ ...v, company: e.target.value })} /></label>
        <label className="block"><Label t="怎麼稱呼你" k="nameRole" /><input className={input('nameRole')} placeholder="王先生／廠長" value={v.nameRole} onChange={(e) => setV({ ...v, nameRole: e.target.value })} /></label>
        <label className="block"><Label t="LINE ID 或電話" k="contact" /><input className={input('contact')} inputMode="tel" autoComplete="tel" value={v.contact} onChange={(e) => setV({ ...v, contact: e.target.value })} /></label>
        <div><Label t="公司所在地" k="region" /><Chips k="region" options={REGIONS} /></div>
        <div><Label t="公司人數" k="headcount" /><Chips k="headcount" options={HEADCOUNTS} /></div>
        <div><Label t="方便聯絡的時段" opt /><Chips k="contactTime" options={CONTACT_TIMES} /></div>
      </div>
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" value={v.website} onChange={(e) => setV({ ...v, website: e.target.value })} />
      <label className={`mt-5 flex items-start gap-2.5 rounded-[10px] bg-white p-3 text-[13px] leading-relaxed text-ink-2 ${bad('consent') ? 'outline outline-1 outline-orange' : ''}`}>
        <input type="checkbox" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })} className="mt-1 h-4 w-4 accent-[#111111]" />
        我同意時行創意僅為聯絡與評估是否適合試辦，使用我留下的資料。
      </label>
      {err && <p className="mt-3 text-[14px] font-bold text-orange" role="alert">{err}</p>}
      {sending && <p className="mt-3 text-[13px] text-ink-3">送出中…</p>}
    </form>
  );
}

function Done({ variant }: { variant: 'A' | 'B' }) {
  return (
    <section className="q-enter from-right">
      <span className="grid h-11 w-11 place-items-center rounded-[10px] bg-orange text-[20px] font-black text-ink">✓</span>
      <h1 className="mt-4 text-[24px] font-black leading-snug">{variant === 'A' ? '收到了，謝謝你的填寫。' : '謝謝你的填寫。'}</h1>
      <p className="mt-3 text-[15px] leading-[1.9] text-ink-2">
        {variant === 'A'
          ? '我們團隊會視情況，在工作空檔主動與你聯繫，先聊聊你的現況。如果合適，再一起安排到廠看看。'
          : '目前試辦的到廠名額，以北北基桃、約 30–50 人的工廠為優先，這一階段我們可能無法很快安排。你的資料我們會先收著，之後若有機會，會再與你聯繫。'}
      </p>
    </section>
  );
}
