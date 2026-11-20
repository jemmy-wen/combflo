import { create } from 'zustand';

export type Mode = 'before' | 'after';
export type TimeOfDay = 'day' | 'dusk';
export type View = 'default' | 'bird';

type State = {
  mode: Mode;
  time: TimeOfDay;
  paused: boolean;
  labels: boolean;
  lines: boolean;
  view: View;
  zoneId: string | null;
  itemId: string | null;
  personId: string | null;
  follow: boolean;
  logOpen: boolean;
  intro: number; // 導覽步驟，-1 表示關閉
  listOpen: boolean; // 手機版清單
  hoverZone: string | null;
  set: (p: Partial<State>) => void;
  focusZone: (id: string | null) => void;
  focusItem: (zoneId: string, itemId: string) => void;
  focusPerson: (id: string | null) => void;
  reset: () => void;
};

export const useApp = create<State>((set) => ({
  mode: 'before',
  time: 'day',
  paused: false,
  labels: false,
  lines: true,
  view: 'default',
  zoneId: null,
  itemId: null,
  personId: null,
  follow: false,
  logOpen: true,
  intro: 0,
  listOpen: false,
  hoverZone: null,
  set: (p) => set(p),
  focusZone: (id) => set({ zoneId: id, itemId: null, personId: null, follow: false, view: 'default', listOpen: false }),
  focusItem: (zoneId, itemId) => set({ zoneId, itemId, personId: null, follow: false, view: 'default', listOpen: false }),
  focusPerson: (id) => set({ personId: id, follow: !!id, zoneId: null, itemId: null, view: 'default', listOpen: false }),
  reset: () => set({ zoneId: null, itemId: null, personId: null, follow: false, view: 'default' }),
}));

// 每一幀由 Director 更新的共享數值（不觸發 React 重繪）
export const live = {
  blend: 0, // 0 = 優化前，1 = 優化後
  dusk: 0, // 0 = 白天，1 = 黃昏
  time: 0,
  people: new Map<string, { x: number; z: number }>(),
};
