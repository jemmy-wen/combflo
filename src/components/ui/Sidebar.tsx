import { PEOPLE, PHOTO_CREDITS } from '../../content/factory';
import { useApp } from '../../lib/store';
import { track } from '../../lib/track';
import { Avatar, Icon, I, Logo, Right } from './Shared';

function QuizCard() {
  return (
    <div className="rounded-[22px] bg-white p-3">
      <div className="px-3 pb-5 pt-3">
        <p className="eyebrow">流程盤點測驗</p>
        <div className="mt-2 text-[19px] font-black leading-snug">你的工廠，卡在哪裡？</div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">回答 9 個問題，看看你的公司有哪些潛在問題，立即取得初步改善方向。</p>
      </div>
      <a href="/quiz" onClick={() => track('cta_quiz', { from: 'sidebar' })}
        className="group flex h-14 items-center justify-center gap-2 rounded-[16px] bg-orange text-[16px] font-black text-ink transition-colors hover:bg-[#ff8a45]">
        立即開始測驗<Right size={18} />
      </a>
    </div>
  );
}

function PeopleList() {
  const s = useApp();
  const before = s.mode === 'before';
  return (
    <ul className="overflow-hidden rounded-[14px] bg-white">
      {PEOPLE.map((p, i) => {
        const active = s.personId === p.id;
        const t = before ? p.before : p.after;
        return (
          <li key={p.id} className={i ? 'border-t border-line' : ''}>
            <button type="button" onClick={() => s.focusPerson(p.id)}
              className={`grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-3.5 py-3 text-left transition-colors ${active ? 'bg-ink text-white' : 'hover:bg-paper'}`}>
              <Avatar person={p} size={40} />
              <span className="min-w-0">
                <span className="flex items-baseline gap-1.5">
                  <span className="text-[14px] font-bold">{p.name}</span>
                  <span className={`text-[11.5px] ${active ? 'text-white/60' : 'text-ink-3'}`}>{p.role}</span>
                </span>
                <span className={`mt-0.5 block truncate text-[12.5px] ${active ? 'text-white/80' : 'text-ink-2'}`}>「{t.quote}」</span>
              </span>
              <span className={`flex items-center gap-1 text-[11px] font-bold ${active ? 'text-white/80' : 'text-ink-3'}`}>
                <span className={`dot ${before ? 'bg-orange' : 'bg-green'}`} />{t.mood}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function Sidebar() {
  const s = useApp();
  return (
    <>
      <aside className={`sidebar pointer-events-auto z-40 flex flex-col bg-cream ${s.listOpen ? 'is-open' : ''}`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <Logo />
          <button type="button" className="grid h-9 w-9 place-items-center rounded-[8px] bg-white md:hidden" onClick={() => s.set({ listOpen: false })} aria-label="收合"><Icon d={I.down} size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <div className="hidden md:block">
            <p className="eyebrow mt-5">CombFlo — 製造業流程優化服務</p>
            <h1 className="mt-2.5 text-[25px] font-black leading-[1.3]">少一點重複作業，<br />多一點<span className="text-orange">有效產能</span>。</h1>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-2">從報價、接單到出貨，找出拖慢工廠效率的工作流程，讓現有的人力與工具發揮更大的價值。</p>
            <div className="mt-4"><QuizCard /></div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="eyebrow">工廠裡的 {PEOPLE.length} 個人</p>
            <span className="text-[11px] text-ink-3">點一下，鏡頭走到他身邊</span>
          </div>
          <h2 className="mt-2 text-[18px] font-black leading-snug">聽聽員工跟管理人員遇到什麼問題？</h2>
          <div className="mt-3"><PeopleList /></div>

          <p className="mt-6 text-[11px] leading-relaxed text-ink-3">
            廠房、人物與事件皆為示意，依中小型製造業常見的流程問題整理，不對應任何一家真實企業。<br />
            Photos on <a href="https://unsplash.com/?utm_source=combflo&utm_medium=referral" className="underline">Unsplash</a> by {PHOTO_CREDITS.map((c, i) => <span key={c.url}><a href={c.url} target="_blank" rel="noopener" className="underline">{c.name}</a>{i < PHOTO_CREDITS.length - 1 ? ', ' : ''}</span>)}
          </p>
        </div>
      </aside>

      {/* 手機版：底部大按鈕 */}
      <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex items-center gap-2 border-t border-line bg-cream px-3 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] pt-2.5 md:hidden">
        <button type="button" onClick={() => s.set({ listOpen: !s.listOpen, zoneId: null, itemId: null, personId: null, follow: false })}
          className={`grid h-[3rem] w-[3rem] shrink-0 place-items-center rounded-[10px] ${s.listOpen ? 'bg-ink text-white' : 'bg-white text-ink'}`} aria-label="人物清單"><Icon d={I.users} size={20} /></button>
        <a href="/quiz" onClick={() => track('cta_quiz', { from: 'mobile_bar' })} className="btn btn-dark group h-[3rem] flex-1 !justify-center !gap-2 !pr-3 !text-[15px]">
          <span>開始測驗・看你的工廠卡在哪</span><Right />
        </a>
      </div>
    </>
  );
}
