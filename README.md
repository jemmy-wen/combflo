# CombFlo 流程工廠（提案三）

以 3D 台灣傳統工廠呈現製造業流程「優化前／優化後」的互動網站，並導向流程盤點測驗與免費諮詢預約。

- 首頁 `/`：3D 鐵皮屋工廠（Three.js / React Three Fiber）。七個環節、17 個卡關點、13 位角色；可切換優化前後、白天黃昏、鳥瞰、協作線，點環節或人物會拉近並顯示說明卡片。
- 測驗頁 `/quiz`：9 題流程盤點 → 結果 → 預約免費諮詢表單。
- 表單 API `/api/lead`：驗證欄位後轉送至 Google Apps Script（寫入 Google 試算表）。

## 開發

```bash
npm install
npm run dev      # http://localhost:4323
npm run build
npm test         # 計分邏輯單元測試
```

## 環境變數

複製 `.env.example` 為 `.env` 後填入：

- `SHEETS_WEBHOOK_URL`、`SHEETS_WEBHOOK_SECRET`：Google Apps Script 網頁應用程式網址與共用密鑰（未設定時，送出的資料只會印在伺服器 log）
- `PUBLIC_TURNSTILE_SITE_KEY`、`TURNSTILE_SECRET`：Cloudflare Turnstile（選用）
- `PUBLIC_LINE_URL`：LINE 官方帳號連結（選用）
- `PUBLIC_GA_ID`：GA4（選用）

## 素材

- `public/photos/`：環節照片，來源 Unsplash（攝影師署名見網站側欄底部）
- `public/avatars/`：角色頭像；需求規格見 `docs/avatar-brief.md`
- `docs/quiz-ux.md`：測驗頁的表單設計原則

廠房、人物與事件皆為示意，不對應任何一家真實企業。
