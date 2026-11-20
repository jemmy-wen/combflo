import { useState } from 'react';
import type { Person } from '../../content/factory';

export function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
}

/* 提案一的斜上箭頭 */
export function Arrow({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.5 11.5l7-7M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/* 開始測驗用的向右箭頭（方向固定） */
export function Right({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

export const I = {
  sun: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  dusk: 'M3 18h18M6 14a6 6 0 0 1 12 0M12 4v3M4.9 7.9l1.4 1.4M19.1 7.9l-1.4 1.4',
  tag: 'M3 12V4h8l10 10-8 8L3 12zM7.5 7.5h.01',
  link: 'M4 17c3-6 5-10 8-10s5 4 8 10',
  pause: 'M9 5v14M15 5v14',
  play: 'M8 5l11 7-11 7z',
  bird: 'M12 3v4M12 17v4M3 12h4M17 12h4M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  log: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
  home: 'M3 11l9-7 9 7M5 10v10h14V10',
  close: 'M6 6l12 12M18 6 6 18',
  back: 'M15 6l-6 6 6 6',
  next: 'M9 6l6 6-6 6',
  follow: 'M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  down: 'M6 9l6 6 6-6',
  users: 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21 19v-1a4 4 0 0 0-3-3.9M15.5 4.1a3 3 0 0 1 0 5.8',
};

/* 頭像：public/avatars/<id>.png 存在就顯示，否則顯示衣服色＋姓氏 */
export function Avatar({ person, size = 40 }: { person: Pick<Person, 'id' | 'name' | 'shirt'>; size?: number }) {
  const [ok, setOk] = useState(true);
  return (
    <span className="relative grid shrink-0 place-items-center overflow-hidden rounded-[10px] font-bold text-white"
      style={{ width: size, height: size, background: person.shirt, fontSize: size * 0.4 }}>
      {ok ? <img src={`/avatars/${person.id}.png`} alt="" onError={() => setOk(false)} className="absolute inset-0 h-full w-full object-cover" /> : person.name.slice(0, 1)}
    </span>
  );
}

/* 提案一的 Logo */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="#111111" />
        <g fill="none" strokeLinecap="round" strokeWidth="5">
          <path d="M14 20c10 0 12 12 22 12h14" stroke="#f6f5f2" /><path d="M14 32h36" stroke="#ff6b1a" /><path d="M14 44c10 0 12-12 22-12h14" stroke="#f6f5f2" />
        </g>
      </svg>
      <span className="text-[16px] font-black tracking-tight">CombFlo</span>
      <span className="border-l border-line pl-2.5 text-[12px] text-ink-2">梳理流程，順出產能</span>
    </span>
  );
}

/* 狀態小標：色點＋文字（不用色塊底） */
export function Status({ before, children }: { before: boolean; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-bold leading-none text-ink">
      <span className={`dot ${before ? 'bg-orange' : 'bg-green'}`} />{children}
    </span>
  );
}
