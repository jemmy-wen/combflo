export type Question = {
  id: string;
  part: 1 | 2 | 3;
  title: string;
  kind: 'single' | 'multi' | 'text';
  max?: number;
  optional?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

export const PARTS: Record<1 | 2 | 3, string> = {
  1: '第一部分｜卡點在哪',
  2: '第二部分｜現在用什麼',
  3: '第三部分｜想往哪走',
};

const opts = (labels: string[]) => labels.map((label, i) => ({ value: String(i + 1), label }));

export const QUESTIONS: Question[] = [
  {
    id: 'q1', part: 1, kind: 'multi', max: 2,
    title: '哪些環節最耗時？（最多選 2 項）',
    options: opts(['報價', '接單與訂單處理', '排程與生管', '採購備料', '出貨與對帳', '品質紀錄', '其他']),
  },
  {
    id: 'q2', part: 1, kind: 'single',
    title: '同一份資料（例如訂單），要在幾個地方重複輸入？',
    options: opts(['1 個地方', '2 個', '3 個以上', '不確定']),
  },
  {
    id: 'q3', part: 1, kind: 'single',
    title: '若負責某環節的人明天不在，會怎樣？',
    options: opts(['有人接手，沒影響', '會慢，但能撐', '整件事會卡住']),
  },
  {
    id: 'q4', part: 2, kind: 'multi',
    title: '目前主要用什麼記錄訂單與生產？',
    options: opts(['紙本', 'Excel 或 Google 試算表', 'LINE', '現成 ERP 或套裝系統', '自己開發的系統']),
  },
  {
    id: 'q5', part: 2, kind: 'single',
    title: '這些工具之間的資料怎麼連？',
    options: opts(['靠人複製貼上', '部分可匯出匯入', '已自動串接', '沒有連']),
  },
  {
    id: 'q6', part: 2, kind: 'single',
    title: '作業流程是否寫下來？',
    options: opts(['沒有，在人的腦袋裡', '部分有文件', '有，而且大家照著做']),
  },
  {
    id: 'q7', part: 2, kind: 'single',
    title: '有沒有買過系統，但用不順、對不上流程？',
    options: opts(['有', '沒有', '還沒買過系統']),
  },
  {
    id: 'q8', part: 3, kind: 'single',
    title: '最想先改善哪一件事？',
    options: opts(['少花時間在重複工作', '資料一目了然', '不依賴特定一個人', '減少出錯']),
  },
  {
    id: 'q9', part: 3, kind: 'text', optional: true,
    title: '一句話形容你最大的困擾？',
    placeholder: '例如：訂單一改，每個人手上的資料就對不起來。',
  },
];

export type TypeKey = 'master' | 'collector' | 'clear' | 'ready';

export const TYPES: Record<TypeKey, { name: string; tagline: string; summary: string; situation: string; next: string }> = {
  master: {
    name: '老師傅型',
    tagline: '經驗都在人身上。',
    summary: '經驗都在人身上，流程大多靠熟手記得。',
    situation: '流程大多靠熟手記得，工具以紙本、LINE、Excel 為主。',
    next: '先把關鍵流程寫下來，定出誰負責什麼。',
  },
  collector: {
    name: '工具收集型',
    tagline: '買了不少工具，但彼此對不上。',
    summary: '買了不少工具，但彼此對不上，資料要靠人搬來搬去。',
    situation: '用了多個工具，資料要靠人搬來搬去，流程也還沒定。',
    next: '先釐清流程，再決定哪些工具留下、哪些整合。',
  },
  clear: {
    name: '流程明白型',
    tagline: '想清楚了，工具還沒跟上。',
    summary: '想清楚了，工具還沒跟上。',
    situation: '流程大致有文件，但還靠紙本或 Excel 在跑。',
    next: '挑最耗時的一兩個環節，補上合適的工具。',
  },
  ready: {
    name: '蓄勢待發型',
    tagline: '可以往自動化走了。',
    summary: '流程明確、資料大致集中，可以往自動化走了。',
    situation: '流程明確，資料大致集中。',
    next: '找出重複性最高的環節，評估自動化或 AI。',
  },
};

export const SYSTEM_NOTE = '你提到買過系統卻用不順。這通常不是系統本身的問題，而是系統沒有配合你的流程。';

export const REGIONS = ['台北市', '新北市', '基隆市', '桃園市', '其他縣市'];
export const HEADCOUNTS = ['30 人以下', '30–50 人', '51–100 人', '100 人以上'];
export const CONTACT_TIMES = ['平日上午', '平日下午', '平日晚上', '都可以'];
