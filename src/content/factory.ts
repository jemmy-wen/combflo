// 流程工廠的內容：七個環節、細項（優化前／後）、角色、日誌
// 座標單位約等於公尺；廠房內部 x: -32～32、z: -20～20

export type Vec3 = [number, number, number];

export type Item = {
  id: string;
  title: string;
  pos: Vec3;
  before: { title: string; body: string };
  after: { title: string; body: string };
};

export type Zone = {
  id: string;
  photo: string;
  no: string;
  name: string;
  place: string;
  center: [number, number];
  size: [number, number];
  before: { headline: string; body: string };
  after: { headline: string; body: string };
  items: Item[];
};

export const ZONES: Zone[] = [
  {
    id: 'sales', photo: '/photos/sales.jpg', no: '01', name: '報價與接單', place: '業務辦公室',
    center: [-23, -12], size: [16, 12],
    before: { headline: '同一張訂單，要在不同系統反覆建檔。', body: '訂單從 LINE 進來，抄進 Excel，再輸入系統。同一份資料經手好幾次，每多一次就多一次出錯的機會。' },
    after: { headline: '訂單輸入一次，後面的環節直接沿用。', body: '先盤點資料從哪裡來、經過誰、最後要用在哪裡，再把重複輸入的環節接起來。' },
    items: [
      { id: 'sales-line', title: '訂單從 LINE 進來', pos: [-26, 1.2, -14],
        before: { title: '手抄三次的訂單', body: '客戶用 LINE 傳訂單，業務先抄進 Excel，再輸入系統，數字常常在某一次抄錯。' },
        after: { title: '一次輸入，自動帶到後面', body: '訂單資料只輸入一次，生管、倉庫、出貨直接沿用同一份資料。' } },
      { id: 'sales-quote', title: '報價單的版本', pos: [-20, 1.2, -9],
        before: { title: '最新的是哪一份？', body: '報價單散在 Email、LINE 和紙本，每個人手上都有一份，最新的是哪一份要問才知道。' },
        after: { title: '報價紀錄集中查詢', body: '歷次報價集中在同一處，業務查歷史報價不用到處翻。' } },
      { id: 'sales-change', title: '客戶改單', pos: [-17, 1.2, -15],
        before: { title: '改單只停在一個人身上', body: '客戶來電改數量，消息只停在接電話的人身上，產線常常最後才知道。' },
        after: { title: '變更同步給相關的人', body: '訂單一變更，生管與倉庫同時看到，不用再一個一個轉告。' } },
    ],
  },
  {
    id: 'planning', photo: '/photos/planning.jpg', no: '02', name: '排程與生管', place: '生管室',
    center: [-8, -12], size: [12, 12],
    before: { headline: '想確認生產進度，卻得一個一個問。', body: '生管要跑產線、打電話、翻白板，才拼得出今天的進度。臨時插單，整面白板就要重排。' },
    after: { headline: '進度看得到，插單看得出影響。', body: '進度集中在同一個畫面，管理者不用追人，臨時插單也能先看出會影響哪些訂單。' },
    items: [
      { id: 'plan-board', title: '排程白板', pos: [-11, 2.6, -17.4],
        before: { title: '白板又要重畫了', body: '排程寫在白板上，臨時插單就要整面重排，擦掉的資訊也找不回來。' },
        after: { title: '排程跟著訂單調整', body: '排程依訂單與產能安排，插單時先看出影響，再決定怎麼排。' } },
      { id: 'plan-track', title: '進度追蹤', pos: [-5, 1.2, -9],
        before: { title: '今天到底做到哪了？', body: '想知道進度只能打電話、跑現場，問了三個人還拼不出完整的狀況。' },
        after: { title: '進度一眼掌握', body: '各站完成的數量集中呈現，管理者不用再追人。' } },
    ],
  },
  {
    id: 'warehouse', photo: '/photos/warehouse.jpg', no: '03', name: '採購與備料', place: '原料倉庫',
    center: [9, -12], size: [18, 12],
    before: { headline: '料到了沒，要打電話問。', body: '接單後靠人工確認物料需求，常常算漏或重複叫料；帳上庫存和架上數量也對不起來。' },
    after: { headline: '依訂單算出備料，帳料一致。', body: '依訂單與用料清單計算需求，進出料隨手記錄，庫存數字對得上。' },
    items: [
      { id: 'wh-bom', title: '物料需求', pos: [4, 1.2, -9],
        before: { title: '漏算、重複叫料', body: '每張訂單要用多少料，靠倉管翻單據人工計算，常常漏算或重複叫料。' },
        after: { title: '備料需求自動算出', body: '依訂單與用料清單算出需要的物料，倉管照清單備料。' } },
      { id: 'wh-stock', title: '庫存數字', pos: [13, 3.2, -17],
        before: { title: '帳上有，架上沒有', body: '進出料沒有隨手記錄，帳上庫存和架上數量對不起來，要用時才發現缺料。' },
        after: { title: '進出料隨手記錄', body: '進料、領料都留下紀錄，庫存數字和架上一致。' } },
    ],
  },
  {
    id: 'production', photo: '/photos/production.jpg', no: '04', name: '加工產線', place: '生產線',
    center: [-2, 8], size: [26, 14],
    before: { headline: '資深員工一請假，整條線就卡住。', body: '機台參數和眉角都在老師傅的腦袋裡，紙本工單跟著料件走，看不清楚就得回頭問。' },
    after: { headline: '經驗寫下來，誰都接得上。', body: '關鍵作業整理成 SOP，工單資訊在現場隨時查得到，新人也能照著做。' },
    items: [
      { id: 'prod-master', title: '老師傅的眉角', pos: [-10, 2, 6],
        before: { title: '這台只有他會調', body: '機台參數和調整的眉角只存在資深師傅的腦袋裡，他一請假，整台機器就停擺。' },
        after: { title: '眉角寫成 SOP', body: '把關鍵作業整理成步驟與參數，新人照著做也接得上。' } },
      { id: 'prod-order', title: '紙本工單', pos: [2, 1.6, 10],
        before: { title: '工單跟著料件跑', body: '紙本工單跟著料件在產線間移動，弄髒、遺失或看不清楚，就得回頭問生管。' },
        after: { title: '工單資訊隨時查得到', body: '工單在現場就能查詢，不用再回頭問。' } },
      { id: 'prod-line', title: '產線節奏', pos: [8, 1.6, 4],
        before: { title: '做到一半在等料', body: '上一站的料沒到、下一站不知道要做什麼，機台常常在空等。' },
        after: { title: '前後站接得上', body: '各站知道下一批要做什麼，等料與空轉的時間變少。' } },
    ],
  },
  {
    id: 'qc', photo: '/photos/qc.jpg', no: '05', name: '品管檢驗', place: '品管區',
    center: [17, 8], size: [10, 14],
    before: { headline: '出錯靠事後補救，重工吃掉產能。', body: '檢驗結果記在紙上，問題要到出貨前才發現，只能整批重做。' },
    after: { headline: '問題早一點發現，少一點重工。', body: '檢驗紀錄集中，異常可以在早期就被看見，減少出錯與重工。' },
    items: [
      { id: 'qc-record', title: '檢驗紀錄', pos: [16, 1.4, 5],
        before: { title: '紀錄都在紙上', body: '檢驗結果寫在紙本表格，問題要到月底整理時才看得出趨勢。' },
        after: { title: '紀錄集中，異常早發現', body: '檢驗紀錄集中保存，同樣的問題反覆出現時可以及早處理。' } },
      { id: 'qc-rework', title: '整批重工', pos: [19, 1.2, 12],
        before: { title: '出貨前才發現', body: '不良品到出貨前才被發現，只能整批退回重做。' },
        after: { title: '檢查點往前移', body: '在前段工序就設檢查點，減少出錯與重工。' } },
    ],
  },
  {
    id: 'dock', photo: '/photos/dock.jpg', no: '06', name: '出貨與對帳', place: '出貨碼頭',
    center: [28, 0], size: [8, 34],
    before: { headline: '出貨和請款資料對不起來。', body: '出貨單要重新打一次，數量常常和訂單對不上，月底只能加班對帳。' },
    after: { headline: '出貨資料直接沿用訂單。', body: '出貨單從訂單資料產生，出貨與請款自動彙整，對帳不用再加班。' },
    items: [
      { id: 'dock-slip', title: '出貨單', pos: [27, 1.4, -6],
        before: { title: '再打一次出貨單', body: '出貨單要依訂單重新打一次，數量和品項常常對不上。' },
        after: { title: '從訂單直接產生', body: '出貨單直接沿用訂單資料，不用重新輸入。' } },
      { id: 'dock-bill', title: '月底對帳', pos: [27, 1.4, 8],
        before: { title: '月底加班對帳', body: '出貨紀錄與請款資料分散在不同地方，月底要逐筆比對。' },
        after: { title: '出貨與請款自動彙整', body: '出貨資料自動彙整成對帳資料，會計不用再逐筆核對。' } },
    ],
  },
  {
    id: 'system', photo: '/photos/system.jpg', no: '07', name: '系統導入', place: '會議室',
    center: [-24, 8], size: [14, 14],
    before: { headline: '強硬導入新系統，團隊一片混亂。', body: '流程還沒定下來，系統就先買了。新系統一夕上線，沒人教、沒人管，最後變成人去配合系統。' },
    after: { headline: '先理解流程，再導入合適的工具。', body: '先訪談、到廠了解現場，再分階段導入適合的流程與工具，並陪員工上手。' },
    items: [
      { id: 'sys-buy', title: '先買系統', pos: [-27, 1.2, 5],
        before: { title: '流程沒定，系統先買了', body: '先買再想怎麼用，最後變成人去配合系統。' },
        after: { title: '先盤點，再決定工具', body: '先把流程看清楚，再決定要補工具、整合現有系統，還是導入自動化。' } },
      { id: 'sys-launch', title: '一夕上線', pos: [-21, 2.4, 3],
        before: { title: '沒人教，兩套一起做', body: '新系統一夕上線，沒有人教、沒有人管，員工只好舊方法、新系統兩套一起做。' },
        after: { title: '分階段導入，陪員工上手', body: '先訪談、到廠了解現場，分階段導入，並陪員工熟悉新的做法。' } },
      { id: 'sys-form', title: '表單對不上', pos: [-24, 1.2, 12],
        before: { title: '表單明明不是訂單', body: '系統裡的表單和實際作業對不上，表單明明不是訂單，卻顯示成訂單。' },
        after: { title: '讓系統配合實際作業', body: '依實際作業調整系統與表單，而不是讓員工配合系統。' } },
    ],
  },
];

// 協作線依流程順序連接：報價接單 → 生管 → 倉庫 → 產線 → 品管 → 出貨
// 照片來源（Unsplash）
export const PHOTO_CREDITS = [
  { name: 'Campaign Creators', url: 'https://unsplash.com/photos/774sCXD0dDU' },
  { name: 'Carlos Muza', url: 'https://unsplash.com/photos/hpjSkU2UYSU' },
  { name: 'PJ Wallace', url: 'https://unsplash.com/photos/iE8gGyIrAAw' },
  { name: 'Shoeib Abolhassani', url: 'https://unsplash.com/photos/Sy2Zo3iULG8' },
  { name: 'Spencer Davis', url: 'https://unsplash.com/photos/QTKwYmMumfk' },
  { name: 'Afinis Group', url: 'https://unsplash.com/photos/3F2tve6w5Pw' },
  { name: 'Vitaly Gariev', url: 'https://unsplash.com/photos/_4tpElFQemQ' },
];

export const FLOW_ORDER = ['sales', 'planning', 'warehouse', 'production', 'qc', 'dock'];

export type Person = {
  id: string;
  name: string;
  role: string;
  zone: string;
  shirt: string;
  hat: string | null;
  hair: string;
  before: { mood: string; quote: string; doing: string };
  after: { mood: string; quote: string; doing: string };
  route: [number, number][];
};

export const PEOPLE: Person[] = [
  { id: 'boss', name: '陳董', role: '工廠老闆', zone: 'system', shirt: '#2f3a56', hat: null, hair: '#bdbdbd',
    before: { mood: '頭痛', quote: '又買了一套系統，怎麼還是這麼亂？', doing: '在會議室盯著一直跳錯誤的新系統。' },
    after: { mood: '放心', quote: '問題在哪裡看得到了，投資比較放心。', doing: '和顧問一起看改善的順序。' },
    route: [[-27, 6], [-21, 6], [-21, 11], [-27, 11]] },
  { id: 'heir', name: 'Kevin', role: '二代接班人', zone: 'system', shirt: '#4b6cc1', hat: null, hair: '#2b2b2b',
    before: { mood: '焦慮', quote: '系統上線了，可是大家都不會用。', doing: '一張桌子一張桌子教大家怎麼操作。' },
    after: { mood: '有信心', quote: '先梳理流程再導入，大家才跟得上。', doing: '帶著團隊分階段導入新做法。' },
    route: [[-22, 4], [-14, -3], [-2, -3], [-14, -3]] },
  { id: 'sales', name: '小美', role: '業務', zone: 'sales', shirt: '#e98f8f', hat: null, hair: '#3a2a20',
    before: { mood: '崩潰', quote: '這張單我已經打第三次了。', doing: '在 LINE、Excel 和系統之間來回抄訂單。' },
    after: { mood: '從容', quote: '訂單輸入一次就好。', doing: '把時間留給客戶，而不是抄單。' },
    route: [[-27, -14], [-20, -14], [-20, -9], [-27, -9]] },
  { id: 'clerk', name: '美玲', role: '會計', zone: 'sales', shirt: '#9b7fd1', hat: null, hair: '#2b2b2b',
    before: { mood: '疲憊', quote: '月底又要加班對帳了。', doing: '抱著一疊出貨單逐筆核對。' },
    after: { mood: '準時下班', quote: '出貨資料自動彙整，對帳快多了。', doing: '核對自動彙整好的對帳資料。' },
    route: [[-18, -16], [-18, -8], [-26, -8]] },
  { id: 'planner', name: '阿明', role: '生管', zone: 'planning', shirt: '#5aa6a0', hat: null, hair: '#2b2b2b',
    before: { mood: '慌張', quote: '白板又要重畫了……', doing: '拿著白板筆在產線和辦公室之間奔波。' },
    after: { mood: '冷靜', quote: '插單也看得出會影響誰。', doing: '在同一個畫面上調整排程。' },
    route: [[-11, -14], [-5, -14], [-5, -8], [-11, -8]] },
  { id: 'manager', name: '林廠長', role: '廠長', zone: 'production', shirt: '#3d6e4f', hat: '#f2c230', hair: '#2b2b2b',
    before: { mood: '焦頭爛額', quote: '今天到底做到哪了？我已經問了三個人。', doing: '跑遍整間工廠追進度。' },
    after: { mood: '掌握全局', quote: '進度一眼就看得到，不用再追人。', doing: '巡視產線，處理真正需要判斷的事。' },
    route: [[-12, -3], [12, -3], [12, 14], [-12, 14]] },
  { id: 'storekeeper', name: '阿雄', role: '倉管', zone: 'warehouse', shirt: '#c98a3c', hat: '#f2c230', hair: '#2b2b2b',
    before: { mood: '手忙腳亂', quote: '料到底到了沒？', doing: '在料架之間翻找物料。' },
    after: { mood: '有條不紊', quote: '備料清單直接出來了。', doing: '照著備料清單把物料送到產線。' },
    route: [[2, -9], [16, -9], [16, -6], [2, -6]] },
  { id: 'master', name: '老王', role: '資深師傅', zone: 'production', shirt: '#6b7a8f', hat: '#f2c230', hair: '#bdbdbd',
    before: { mood: '分身乏術', quote: '這台機器只有我會調。', doing: '被叫來叫去，一台一台幫忙調機。' },
    after: { mood: '傳承中', quote: '我的眉角都寫成 SOP 了。', doing: '帶新人照著 SOP 操作機台。' },
    route: [[-12, 5], [-6, 5], [-6, 11], [-12, 11]] },
  { id: 'rookie', name: '阿傑', role: '新進作業員', zone: 'production', shirt: '#d9a441', hat: '#f2c230', hair: '#2b2b2b',
    before: { mood: '不知所措', quote: '師傅請假，我不知道怎麼做。', doing: '站在機台前等人來救援。' },
    after: { mood: '上手了', quote: '照著 SOP 也做得出來。', doing: '照著 SOP 獨立操作機台。' },
    route: [[-4, 6], [4, 6], [4, 11], [-4, 11]] },
  { id: 'operator', name: '阿德', role: '作業員', zone: 'production', shirt: '#7e9c4a', hat: '#f2c230', hair: '#2b2b2b',
    before: { mood: '空等', quote: '上一站的料還沒來……', doing: '在機台旁等料。' },
    after: { mood: '順手', quote: '下一批要做什麼，一看就知道。', doing: '照工單把料送到下一站。' },
    route: [[6, 4], [11, 4], [11, 12], [6, 12]] },
  { id: 'inspector', name: '淑芬', role: '品檢', zone: 'qc', shirt: '#d46a7e', hat: '#ffffff', hair: '#3a2a20',
    before: { mood: '心累', quote: '又要整批重做……', doing: '把整批不良品搬回產線。' },
    after: { mood: '安心', quote: '問題早一點發現，少很多重工。', doing: '在前段工序就做抽檢。' },
    route: [[14, 4], [20, 4], [20, 12], [14, 12]] },
  { id: 'driver', name: '阿財', role: '貨運司機', zone: 'dock', shirt: '#4f6d8f', hat: '#e05a3a', hair: '#2b2b2b',
    before: { mood: '不耐煩', quote: '貨還沒好嗎？我等一個小時了。', doing: '在碼頭來回踱步等貨。' },
    after: { mood: '準時', quote: '一到就能裝車。', doing: '照出貨單把貨裝上車。' },
    route: [[26, -10], [26, 10], [30, 10], [30, -10]] },
  { id: 'consultant', name: 'CombFlo 顧問', role: '流程顧問', zone: 'system', shirt: '#2d5bff', hat: null, hair: '#2b2b2b',
    before: { mood: '觀察中', quote: '先了解現場，再決定怎麼改。', doing: '拿著筆記板，到每個環節訪談。' },
    after: { mood: '陪伴導入', quote: '流程對了，工具才會好用。', doing: '和團隊一起確認新的流程是否順手。' },
    route: [[-24, -3], [0, -3], [20, -3], [0, -3]] },
];

// 工廠日誌：即時跳動的事件（依模式）
export const LOGS = {
  before: [
    '業務小美 第 3 次重新輸入訂單 #A-1024',
    '生管阿明 擦掉白板，重排明天的排程',
    '倉管阿雄 找不到 6061 鋁料，打電話問供應商',
    '老王請假，2 號機台停機等待',
    '品檢淑芬 退回整批 120 件重工',
    '司機阿財 在碼頭等貨 47 分鐘',
    '新系統跳出錯誤：表單類型不符',
    '林廠長 打第 4 通電話確認進度',
    '客戶來電改單，訊息沒有傳到產線',
    '會計美玲 加班比對出貨單與請款單',
  ],
  after: [
    '訂單 #A-1024 已同步到生管與倉庫',
    '排程更新：插單已排入，影響 2 張訂單',
    '備料清單已產生：6061 鋁料 × 40',
    '2 號機台依 SOP 由阿傑接手操作',
    '前段抽檢通過，進入下一站',
    '出貨單已從訂單產生，準備裝車',
    '新流程第 2 階段導入，訪談完成',
    '林廠長 在同一個畫面查看各站進度',
    '客戶改單已同步給生管與產線',
    '本月出貨資料已彙整為對帳表',
  ],
};
