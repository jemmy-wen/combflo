# CombFlo｜製造業流程優化服務

像素風形象網站與「流程盤點」問卷。純靜態 HTML／CSS／JS，不需要建置。

## 頁面

| 檔案 | 內容 |
|---|---|
| `dist/index.html` | 首頁：視差 hero、置頂捲動區塊（痛點疊卡、關卡地圖、案例橫向捲動） |
| `dist/check.html` | 流程盤點：9 題 → 計分 → 四種結果卡（可存成圖片）→ 預約表單 → 送出後 A／B 版 |
| `dist/privacy.html` | 隱私說明 |
| `dist/illustrations.html` | 插畫素材總覽 |
| `dist/components.html` | 早期元件提案（舊版樣式，僅供參考） |

## 本機預覽

```bash
cd dist && python3 -m http.server 8000
# http://localhost:8000
```

## 設定

`dist/site.js` 開頭：

- `LINE_URL`：LINE 官方帳號連結。留空時所有「加入 LINE」按鈕都不顯示。
- `FORM_ENDPOINT`：預約表單送出的 API。留空時為示意模式，送出一律視為成功、不會傳出資料。

## 部署

`vercel.json` 讓 Vercel 不執行建置，直接發布 `dist/`。

## 插畫

素材清單、編號與規格見 `illustration-list.md`；插畫製作規則見 `AGENTS.md`。
