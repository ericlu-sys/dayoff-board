# 今天誰請假 (Dayoff Board) 🎉

<p align="center">
  <a href="./README.md">English Documentation</a>
</p>

這是一個用來顯示團隊「今天誰請假」或「未來預計請假」的純前端靜態網頁工具。
透過串接其他服務，讓你在這個畫面上能一目了然地看到所有同仁的請假動態。

**為什麼這樣設計？**
我們使用 **Google Apps Script (GAS)** 在背後抓取大家的 Google Calendar (日曆) 資訊，並將其轉換成 JSON 給前端讀取。之所以不直接把 Google API 寫在前端或是 GitHub Actions 上，是因為 **GAS 可以極其方便地無縫處理 Google 的權限認證 (Auth) 問題**。而實作出來的前端網頁 (index.html) 則可以輕巧地部署在 Cloudflare Pages 等環境上！

## ✨ 特色
- 🚀 **純前端架構**：僅包含 HTML/JS/CSS（加上 Tailwind CSS），可直接部署在 GitHub Pages、Cloudflare Pages 或 Vercel 等任何靜態網站託管服務。
- 🔄 **自動更新**：每隔 5 分鐘自動刷新資料，確保顯示最新請假動態。
- 📱 **RWD 設計**：支援電腦桌機、手機，皆可完美瀏覽。
- 🛠️ **不綁死框架**：不依賴 React / Vue 等複雜框架，使用原生的 ES Module (Vanilla JS)。
- 💰 **無伺服器成本**：使用 Google Apps Script (GAS) 充當免錢的中繼微服務，且完美解決了存取 Google Calendar 時惱人的 Auth 難題。
---

## 🚀 快速開始

### 1. 準備你的專案
將專案 Clone 下來：
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name/dayoff
```

### 2. 設定你的環境
我們將設定檔拆分出來，以保護你的隱私並方便開源。請複製範例設定檔：
```bash
cp config.example.js config.js
```
打開 `config.js`，依照你的需求填寫相關設定：
- `dataApiUrl`：填入你的 Cloudflare Worker 或 API 網址（下方有架構教學）。
- `title`：設定專案標題與公司名稱。
- `logoUrl`：替換為專屬的公司 Logo 路徑或網址。
- 其他語系（i18n）文字可自由修改。

> 💡 **注意**：`config.js` 已經被加入 `.gitignore` 中，不會被推送到外網，請放心修改裡面的私密連結。

### 3. 本地預覽
因為我們使用了 ES Module 預設載入 JS (`type="module"`)，如果你直接雙擊點開 `index.html`，瀏覽器開發者工具可能會報 CORS 的相關錯誤並無法載入腳本。
建議使用本地伺服器來預覽：
```bash
# 如果你有安裝 Node.js
npx http-server .

# 或是使用 Python
python3 -m http.server
```

---

## 🛠️ 架構教學：Google Apps Script 推送資料至 Cloudflare KV

為了達到最佳的載入效能與承受高併發讀取，我們推薦以下的高效能架構：
`[Google 日曆] -> [GAS 定時整理 JSON] -> (推送 POST) -> [Cloudflare KV] -> [前端網頁讀取 KV API]`

也就是說，前端「不會」直接呼叫 Google 拿資料，而是去讀取儲存在 Cloudflare 邊緣節點上的快取資料。這不僅網頁秒開，也保護了 Google API 額度。

### 1. Google Apps Script (GAS) 端設定
1. 在 Google Apps Script 建立新專案，將本專案 `gas/Code.js` 的內容貼上。
2. **替換 `API_URL`**：在 `Code.js` 中有一行 `var API_URL = "https://...";`。這個網址是你的 Cloudflare 接收端。**備註：這個 API URL 主要負責使用 Cloudflare KV 的方式去接收 JSON 檔案，而此 JSON 檔案是透過 GAS 單向產生並放進 KV 的。** 請務必將它替換成你自己的 Cloudflare Endpoint。
3. **設定定期觸發 (Triggers)**：在 GAS 中設定「時間驅動的觸發器」，讓 `getDayOffData()` 函數每 5~15 分鐘自動執行一次，隨時把最新請假資料撈出來並推送到你的 KV 中。

### 2. Cloudflare Pages + KV 端設定
你需要建立一個 Cloudflare Pages 專案與 KV 命名空間來接收與儲存資料：
1. **建立 KV 命名空間**：在 Cloudflare Dashboard 建立一個 KV 空間用來存資料。
2. **寫一支接收 API (Functions)**：透過 Cloudflare Pages Functions（例如建立 `/functions/api/portal.js`），寫一段簡單邏輯：
   - 當收到 `POST` 時：接住 GAS 傳來的 JSON 資料，並把它存進綁定好的 KV 中。
   - 當收到 `GET` 時：將 KV 裡面的最新 JSON 吐出來，供 Dayoff-board 前端網頁（也就是 `config.js` 的 `dataApiUrl`）讀取。

### 回傳的 JSON 資料格式範例
不管底層怎麼儲存，你最後吐給前端的 API 必須回傳如下格式的 JSON 陣列：
```json
[
  {
    "title": "王大明",
    "calendarName": "事假",
    "startTime": "2024-04-01T08:00:00Z",
    "endTime": "2024-04-01T17:00:00Z"
  },
  {
    "title": "陳小美",
    "calendarName": "特休",
    "startTime": "2024-05-15T00:00:00Z",
    "endTime": "2024-05-18T00:00:00Z"
  }
]
```
*(上述的 `startTime` / `endTime` 會由系統判斷是否與「今天」重疊，如果是，卡片就會亮底色！)*

## 🎯 授權條款
MIT License
