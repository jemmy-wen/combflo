// 計分規則（初稿）：工具軸看 Q4、Q5；流程軸看 Q2、Q3、Q6。
// 指標：重複輸入度＝Q2，依賴單一人度＝Q3，資料連通度＝Q5。Q7 選「有」只加一句說明，不改類型。
import type { TypeKey } from '../content/quiz.ts';

export type Answers = Record<string, string | string[]>;
export type Level = 1 | 2 | 3; // 低 / 中 / 高

export type Result = {
  type: TypeKey;
  toolScore: number; // 0–100
  processScore: number; // 0–100
  toolsHigh: boolean;
  processHigh: boolean;
  repeat: Level;
  reliance: Level;
  connect: Level;
  systemNote: boolean;
};

const one = (a: Answers, k: string) => (Array.isArray(a[k]) ? (a[k] as string[])[0] : (a[k] as string)) ?? '';
const many = (a: Answers, k: string) => (Array.isArray(a[k]) ? (a[k] as string[]) : a[k] ? [a[k] as string] : []);

export function score(a: Answers): Result {
  // 工具軸：Q4 的數位工具數（紙本不算）＋ Q5 串接程度
  const digital = many(a, 'q4').filter((v) => v !== '1').length; // 0–4
  const q5 = one(a, 'q5');
  const linkBonus = { '1': 0.5, '2': 1, '3': 2, '4': 0 }[q5] ?? 0;
  const toolRaw = digital + linkBonus; // 0–6
  const toolScore = Math.round((toolRaw / 6) * 100);

  // 流程軸：Q2（重複越少越好）、Q3（有人接手越好）、Q6（有文件且照做越好）
  const q2 = { '1': 2, '2': 1, '3': 0, '4': 0.5 }[one(a, 'q2')] ?? 0;
  const q3 = { '1': 2, '2': 1, '3': 0 }[one(a, 'q3')] ?? 0;
  const q6 = { '1': 0, '2': 1, '3': 2 }[one(a, 'q6')] ?? 0;
  const processRaw = q2 + q3 + q6 * 1.5; // 0–7
  const processScore = Math.round((processRaw / 7) * 100);

  const toolsHigh = toolRaw >= 2.5;
  const processHigh = processScore >= 55;

  const type: TypeKey = processHigh ? (toolsHigh ? 'ready' : 'clear') : toolsHigh ? 'collector' : 'master';

  const repeat = ({ '1': 1, '2': 2, '3': 3, '4': 2 }[one(a, 'q2')] ?? 2) as Level;
  const reliance = ({ '1': 1, '2': 2, '3': 3 }[one(a, 'q3')] ?? 2) as Level;
  const connect = ({ '1': 1, '2': 2, '3': 3, '4': 1 }[q5] ?? 1) as Level;

  return { type, toolScore, processScore, toolsHigh, processHigh, repeat, reliance, connect, systemNote: one(a, 'q7') === '1' };
}

export const LEVEL_LABEL: Record<Level, string> = { 1: '低', 2: '中', 3: '高' };
