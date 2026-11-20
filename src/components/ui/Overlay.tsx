import { useEffect, useRef, useState } from 'react';
import { LOGS, PEOPLE, ZONES, type Zone } from '../../content/factory';
import { useApp, type Mode } from '../../lib/store';
import { track } from '../../lib/track';
import { Avatar, Icon, I, Right, Status } from './Shared';

/* 切換模式：一律回到全景 */
export function useSwitchMode() {
  return (mode: Mode) => {
    const s = useApp.getState();
    if (mode === s.mode) return;
    s.set({ mode, zoneId: null, itemId: null, personId: null, follow: false, view: 'default', listOpen: false });
    track('mode_toggle', { mode });
  };
}

/* ---------------- 左上：優化前／後切換 ---------------- */
export function ModeToggle() {
  const mode = useApp((s) => s.mode);
  const switchMode = useSwitchMode();
  const before = mode === 'before';
  return (
    <div className="pointer-events-auto absolute left-3 top-3 z-30 md:left-5 md:top-5">
      <div className="flex rounded-[12px] bg-white p-1 shadow-[0_10px_30px_-14px_rgba(0,0,0,.5)]" role="tablist" aria-label="流程狀態">
        {(['before', 'after'] as const).map((m) => {
          const on = mode === m;
          return (
            <button key={m} type="button" role="tab" aria-selected={on} onClick={() => switchMode(m)}
              className={`flex w-[7.4rem] items-center justify-center gap-2 rounded-[8px] py-2.5 text-[14px] font-bold transition-colors md:w-36 ${on ? (m === 'before' ? 'bg-orange text-ink' : 'bg-green text-white') : 'text-ink-2 hover:bg-paper'}`}>
              {m === 'before' ? '流程優化前' : '流程優化後'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- 3D 區域右下：狀態提示 ---------------- */
export function StatusHint() {
  const before = useApp((s) => s.mode === 'before');
  return (
    <div className="pointer-events-none absolute bottom-5 right-5 z-20 hidden h-10 items-center rounded-[12px] bg-white px-4 shadow-[0_10px_30px_-14px_rgba(0,0,0,.5)] md:flex">
      <Status before={before}>{before ? '人人在救火：點地圖上的「!」看卡在哪' : '流程順了：每個環節都接得上'}</Status>
    </div>
  );
}

/* ---------------- 右上：工具列 ---------------- */
function Tool({ on, onClick, icon, label }: { on?: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`flex flex-col items-center gap-0.5 rounded-[8px] px-2.5 py-1.5 text-[11px] font-bold transition-colors ${on ? 'bg-ink text-white' : 'text-ink-2 hover:bg-paper'}`}>
      <Icon d={icon} />{label}
    </button>
  );
}
export function Toolbar() {
  const s = useApp();
  return (
    <div className="pointer-events-auto absolute right-3 top-3 z-30 hidden items-center gap-0.5 rounded-[12px] bg-white px-1.5 py-1 shadow-[0_10px_30px_-14px_rgba(0,0,0,.5)] md:right-5 md:top-5 md:flex">
      <Tool on={s.time === 'day'} onClick={() => s.set({ time: 'day' })} icon={I.sun} label="白天" />
      <Tool on={s.time === 'dusk'} onClick={() => s.set({ time: 'dusk' })} icon={I.dusk} label="黃昏" />
      <span className="mx-1 h-7 w-px bg-line" />
      <Tool on={s.labels} onClick={() => s.set({ labels: !s.labels })} icon={I.tag} label="名牌" />
      <Tool on={s.lines} onClick={() => s.set({ lines: !s.lines })} icon={I.link} label="協作線" />
      <Tool on={s.paused} onClick={() => s.set({ paused: !s.paused })} icon={s.paused ? I.play : I.pause} label={s.paused ? '播放' : '暫停'} />
      <Tool on={s.view === 'bird'} onClick={() => s.set({ view: s.view === 'bird' ? 'default' : 'bird', zoneId: null, itemId: null, personId: null, follow: false })} icon={I.bird} label="鳥瞰" />
      <Tool on={s.logOpen} onClick={() => s.set({ logOpen: !s.logOpen })} icon={I.log} label="日誌" />
      <span className="mx-1 h-7 w-px bg-line" />
      <Tool onClick={() => s.reset()} icon={I.home} label="全景" />
    </div>
  );
}
export function MobileHome() {
  const reset = useApp((s) => s.reset);
  return <button type="button" onClick={reset} aria-label="全景" className="pointer-events-auto absolute right-3 top-3 z-30 grid h-11 w-11 place-items-center rounded-[10px] bg-white shadow-md md:hidden"><Icon d={I.home} size={18} /></button>;
}

/* ---------------- 卡片外框 ---------------- */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel-in pointer-events-auto absolute inset-x-3 bottom-[5.6rem] z-40 flex max-h-[52dvh] flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,.55)] md:inset-x-auto md:bottom-5 md:left-5 md:top-[7.2rem] md:max-h-none md:w-[392px]">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </div>
  );
}
function SquareBtn({ onClick, label, d }: { onClick: () => void; label: string; d: string }) {
  return <button type="button" onClick={onClick} aria-label={label} className="grid h-9 w-9 place-items-center rounded-[8px] bg-white text-ink shadow-sm hover:bg-ink hover:text-white"><Icon d={d} size={15} /></button>;
}

/* 照片標頭 */
function PhotoHead({ zone, tall = true, onBack, onClose }: { zone: Zone; tall?: boolean; onBack?: () => void; onClose: () => void }) {
  return (
    <div className={`relative w-full shrink-0 overflow-hidden bg-ink ${tall ? 'aspect-[16/9]' : 'aspect-[21/9]'}`}>
      <img src={zone.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
      <div className="absolute inset-x-3 top-3 flex items-center justify-between">
        {onBack ? <button type="button" onClick={onBack} className="rounded-[8px] bg-white px-3 py-2 text-[13px] font-bold shadow-sm hover:bg-ink hover:text-white">返回 {zone.name}</button> : <span className="chip !bg-white"><span className="text-ink-3">{zone.no}</span>{zone.place}</span>}
        <SquareBtn onClick={onClose} label="關閉" d={I.close} />
      </div>
    </div>
  );
}

/* 表格式的一列 */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-3 border-t border-line py-2.5 text-[13.5px]">
      <span className="text-ink-3">{label}</span>
      <span className="font-medium text-ink">{children}</span>
    </div>
  );
}

/* 優化前／後對照：兩列表格，現在的模式用深色字、另一個淡化 */
function Compare({ b, a }: { b: { t: string; d: string }; a: { t: string; d: string } }) {
  const before = useApp((s) => s.mode === 'before');
  const row = (on: boolean, isBefore: boolean, x: { t: string; d: string }) => (
    <div className={`grid grid-cols-[4.5rem_1fr] gap-3 border-t border-line py-3 transition-opacity duration-500 ${on ? '' : 'opacity-45'}`}>
      <span className="flex items-start gap-1.5 pt-0.5 text-[12px] font-bold"><span className={`dot mt-1.5 ${isBefore ? 'bg-orange' : 'bg-green'}`} />{isBefore ? '優化前' : '優化後'}</span>
      <span>
        <span className="block text-[14.5px] font-bold leading-snug">{x.t}</span>
        <span className="mt-1 block text-[13px] leading-relaxed text-ink-2">{x.d}</span>
      </span>
    </div>
  );
  return <div className="border-b border-line">{row(before, true, b)}{row(!before, false, a)}</div>;
}

function CTA() {
  return (
    <a href="/quiz" onClick={() => track('cta_quiz', { from: 'panel' })} className="btn btn-dark group mt-5 w-full !justify-center !gap-2 !py-3 !pr-3">
      <span>開始測驗：你的工廠也這樣嗎？</span><Right />
    </a>
  );
}

/* ---------------- 浮出卡片 ---------------- */
export function DetailPanels() {
  const s = useApp();
  const zone = ZONES.find((z) => z.id === s.zoneId);
  const item = zone?.items.find((i) => i.id === s.itemId);
  const person = PEOPLE.find((p) => p.id === s.personId);
  const before = s.mode === 'before';

  if (item && zone) {
    const idx = zone.items.indexOf(item) + 1;
    return (
      <Shell>
        <PhotoHead zone={zone} tall={false} onBack={() => s.focusZone(zone.id)} onClose={() => s.reset()} />
        <div className="px-5 pb-5 pt-4">
          <p className={`eyebrow ${before ? '' : 'is-after'}`}>{zone.no} {zone.name}・細項 {idx}/{zone.items.length}</p>
          <h2 className="mt-2 text-[21px] font-black leading-snug">{item.title}</h2>
          <div className="mt-4"><Compare b={{ t: item.before.title, d: item.before.body }} a={{ t: item.after.title, d: item.after.body }} /></div>
          {zone.items.length > 1 && (
            <div className="mt-5">
              <div className="text-[12px] font-bold text-ink-3">同一區的其他卡關點</div>
              <ul className="mt-1.5">
                {zone.items.filter((i) => i.id !== item.id).map((it) => (
                  <li key={it.id}>
                    <button type="button" onClick={() => s.focusItem(zone.id, it.id)} className="flex w-full items-center justify-between border-t border-line py-2.5 text-left text-[13.5px] font-bold hover:text-ink-2">
                      {it.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <CTA />
        </div>
      </Shell>
    );
  }

  if (zone) {
    const t = before ? zone.before : zone.after;
    const people = PEOPLE.filter((p) => p.zone === zone.id);
    return (
      <Shell>
        <PhotoHead zone={zone} onClose={() => s.reset()} />
        <div className="px-5 pb-5 pt-4">
          <div className="flex items-center justify-between">
            <p className={`eyebrow ${before ? '' : 'is-after'}`}>ZONE {zone.no}</p>
            <Status before={before}>{before ? `卡關 ${zone.items.length} 處` : '已梳理'}</Status>
          </div>
          <h2 className="mt-1.5 text-[24px] font-black">{zone.name}</h2>
          <p className="mt-2 text-[15px] font-bold leading-snug">「{t.headline}」</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{t.body}</p>

          <div className="mt-5 flex items-baseline justify-between">
            <span className="text-[12px] font-bold text-ink-3">{before ? '卡關點' : '改善之後'}</span>
            <span className="text-[11px] text-ink-3">點一下拉近看</span>
          </div>
          <ol className="mt-1.5 border-b border-line">
            {zone.items.map((it, i) => (
              <li key={it.id}>
                <button type="button" onClick={() => s.focusItem(zone.id, it.id)} className="group grid w-full grid-cols-[1.75rem_1fr] items-center gap-2 border-t border-line py-2.5 text-left">
                  <span className="text-[12px] font-bold tabular-nums text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="flex items-center gap-1.5 text-[14px] font-bold"><span className={`dot ${before ? 'bg-orange' : 'bg-green'}`} />{it.title}</span>
                    <span className="block text-[12px] text-ink-3">{before ? it.before.title : it.after.title}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>

          {people.length > 0 && (
            <div className="mt-4">
              <div className="text-[12px] font-bold text-ink-3">在這裡工作的人</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {people.map((p) => (
                  <button key={p.id} type="button" onClick={() => s.focusPerson(p.id)} className="chip !py-1 !pl-1 hover:bg-ink hover:text-white">
                    <Avatar person={p} size={22} />{p.name}<span className="font-medium text-ink-3">{p.role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <CTA />
        </div>
      </Shell>
    );
  }

  if (person) {
    const z = ZONES.find((zz) => zz.id === person.zone);
    const t = before ? person.before : person.after;
    return (
      <Shell>
        <div className="px-5 pb-5 pt-5">
          <div className="flex items-start gap-3.5">
            <Avatar person={person} size={60} />
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="eyebrow">{person.role}</p>
              <h2 className="mt-1 text-[22px] font-black leading-none">{person.name}</h2>
            </div>
            <button type="button" onClick={() => s.focusPerson(null)} aria-label="關閉" className="grid h-9 w-9 place-items-center rounded-[8px] bg-paper hover:bg-ink hover:text-white"><Icon d={I.close} size={15} /></button>
          </div>

          <div className="mt-4 border-b border-line">
            <Row label="工作區域">{z ? `${z.no} ${z.name}・${z.place}` : '—'}</Row>
            <Row label="現在心情"><Status before={before}>{t.mood}</Status></Row>
            <Row label={before ? '每天在做' : '現在在做'}>{t.doing}</Row>
          </div>

          <p className={`eyebrow mt-5 ${before ? '' : 'is-after'}`}>{before ? '他的困擾' : '流程梳理之後'}</p>
          <blockquote className="mt-2 text-[19px] font-black leading-[1.45]">「{t.quote}」</blockquote>

          <div className="mt-5 text-[12px] font-bold text-ink-3">前後對照</div>
          <div className="mt-1.5"><Compare b={{ t: `「${person.before.quote}」`, d: person.before.doing }} a={{ t: `「${person.after.quote}」`, d: person.after.doing }} /></div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => s.set({ follow: !s.follow })} className={`btn ${s.follow ? 'btn-dark' : 'btn-ghost-dark'} !justify-center !px-3 !py-2.5`}>
              <Icon d={I.follow} size={14} />{s.follow ? '鏡頭跟隨中' : '鏡頭跟著他'}
            </button>
            {z && <button type="button" onClick={() => s.focusZone(z.id)} className="btn btn-ghost-dark !px-3 !py-2.5">看 {z.name}</button>}
          </div>
          <CTA />
        </div>
      </Shell>
    );
  }
  return null;
}

/* ---------------- 工廠日誌 ---------------- */
export function LogPanel() {
  const mode = useApp((s) => s.mode);
  const open = useApp((s) => s.logOpen);
  const paused = useApp((s) => s.paused);
  const panelOpen = useApp((s) => !!(s.zoneId || s.personId));
  const [rows, setRows] = useState<{ id: number; t: string; text: string; mode: string }[]>([]);
  const idx = useRef(0);
  const clock = useRef(8 * 60 + 30);

  useEffect(() => {
    if (paused) return;
    const push = () => {
      const list = LOGS[mode];
      const text = list[idx.current % list.length];
      idx.current++;
      clock.current += 3 + Math.floor(Math.random() * 6);
      const h = Math.floor(clock.current / 60) % 24, m = clock.current % 60;
      setRows((r) => [{ id: Date.now() + Math.random(), t: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, text, mode }, ...r].slice(0, 5));
    };
    push();
    const t = setInterval(push, mode === 'before' ? 2400 : 3200);
    return () => clearInterval(t);
  }, [mode, paused]);

  if (!open || panelOpen) return null;
  return (
    <div className="pointer-events-auto absolute bottom-5 left-5 z-20 hidden w-[340px] rounded-[14px] bg-white px-4 pb-2 pt-3.5 shadow-[0_16px_40px_-20px_rgba(0,0,0,.55)] md:block">
      <div className="flex items-center justify-between pb-2">
        <p className="eyebrow">LIVE・工廠日誌</p>
        <span className="text-[11px] font-bold text-ink-3">{paused ? '已暫停' : '即時'}</span>
      </div>
      <ul>
        {rows.map((r, i) => (
          <li key={r.id} className="log-row grid grid-cols-[2.6rem_1fr] gap-2 border-t border-line py-2 text-[12.5px] leading-snug" style={{ opacity: 1 - i * 0.15 }}>
            <span className="tabular-nums text-ink-3">{r.t}</span>
            <span className="flex gap-1.5"><span className={`dot mt-1.5 ${r.mode === 'before' ? 'bg-orange' : 'bg-green'}`} />{r.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- 切換過場 ---------------- */
export function ModeFlash() {
  const mode = useApp((s) => s.mode);
  const [show, setShow] = useState<null | 'before' | 'after'>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setShow(mode);
    const t = setTimeout(() => setShow(null), 1600);
    return () => clearTimeout(t);
  }, [mode]);
  if (!show) return null;
  const after = show === 'after';
  // 寬度沿用已確認的 360；只取參考圖的比例（白 36%／色 64%）與置中排版
  return (
    <div className="pointer-events-none absolute inset-0 z-40 grid place-items-center p-4">
      <div className="mode-flash w-[360px] max-w-full overflow-hidden rounded-[20px] shadow-2xl">
        <div className="bg-white py-[20px] text-center text-[15px] font-bold leading-[22px] text-[#7a7a7a]">
          {after ? '流程優化後' : '流程優化前'}
        </div>
        <div className={`py-[42px] text-center text-[28px] font-black leading-[30px] text-white ${after ? 'bg-green' : 'bg-orange'}`}>
          {after ? '每個環節都接得上了！' : '人人又開始救火了！'}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 導覽 ---------------- */
const INTRO = [
  { t: '這是一間台灣傳統工廠', b: '鐵皮屋廠房裡有七個環節：從報價接單、生管排程、倉庫備料，到產線、品管和出貨。點地圖上的環節，就能看到裡面的細項。' },
  { t: '先看流程還沒梳理的樣子', b: '資料到處抄、進度靠人問、系統硬塞進來，每個人都在救火。橘色的「!」標出了卡住的地方。' },
  { t: '再切到「流程優化後」', b: '按左上角的切換鈕，看看同一間工廠在流程梳理之後會變成什麼樣子。右側可以聽聽每個人遇到的問題。' },
];
export function Intro() {
  const step = useApp((s) => s.intro);
  const set = useApp((s) => s.set);
  if (step < 0) return null;
  const it = INTRO[step];
  const last = step === INTRO.length - 1;
  return (
    <div className="pointer-events-auto absolute inset-0 z-50 grid place-items-center bg-black/35 p-4 backdrop-blur-[2px]">
      <div className="intro-card w-full max-w-[420px] rounded-[14px] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="eyebrow">導覽 {step + 1} / {INTRO.length}</p>
          <span className="flex gap-1">{INTRO.map((_, i) => <span key={i} className={`h-1 w-5 rounded-full ${i <= step ? 'bg-ink' : 'bg-line'}`} />)}</span>
        </div>
        <h2 className="mt-3 text-[23px] font-black leading-snug">{it.t}</h2>
        <p className="mt-2.5 text-[14px] leading-relaxed text-ink-2">{it.b}</p>
        <div className="mt-6 flex items-center justify-between gap-2">
          <button type="button" onClick={() => set({ intro: -1 })} className="btn btn-ghost-dark">略過</button>
          <button type="button" onClick={() => set({ intro: last ? -1 : step + 1 })} className="btn btn-dark !py-2.5 !pr-4">{last ? '開始探索' : '下一步'}</button>
        </div>
      </div>
    </div>
  );
}
