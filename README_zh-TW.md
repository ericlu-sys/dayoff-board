# 今天誰請假 (Dayoff Board) 🎉

<p align="center">
  <a href="./README.md">English Documentation</a>
</p>

這是一個用來顯示團隊「今天誰請假」或「未來預計請假」的純前端靜態網頁工具。
我們將資料儲存在 Google Sheet，透過 API（例如 Cloudflare Worker 或 Google Apps Script）轉換成 JSON，並由前端直接抓取顯示，無需部署專屬的後端伺服器！

## ✨ 特色
- 🚀 **純前端架構**：僅包含 HTML/JS/CSS（加上 Tailwind CSS），可直接部署在 GitHub Pages、Cloudflare Pages 或 Vercel 等任何靜態網站託管服務。
- 🔄 **自動更新**：每隔 5 分鐘自動刷新資料，確保顯示最新請假動態。
- 📱 **RWD 設計**：支援電腦桌機、手機，皆可完美瀏覽。
- 🛠️ **不綁死框架**：不依賴 React / Vue 等複雜框架，使用原生的 ES Module (Vanilla JS)。
- 💰 **無伺服器成本**：使用 Google Sheet 儲存資料，並透過免費的中繼 API 提供服務。

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

## 🛠️ 架構教學：Google Sheet 到 API 輸出

我們的資料來源建議架構如下： 
`[Google Sheet] -> [API Middleware (GAS 或 Cloudflare Worker)] -> [純前端網頁]`

### 回傳的 JSON 資料格式
無論你使用哪種技術，你的 API 必須回傳如下格式的 JSON 陣列給前端讀取：
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

### 👉 實作方式一：Cloudflare Worker (擔任 Proxy)
如果你本身已經有一個可以撈出資料的網址（例如你原本的 `/api/portal?key=dayoff_json`，或者 Google Apps Script 發布的 Web App），但不希望直接把這個網址曝露在前端 `config.js` 裡面。
你可以架設一個 Cloudflare Worker 作為主機：

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 進入 **Workers & Pages** > **Create application** > **Create Worker**
3. 核心程式碼範例如下：
```javascript
export default {
  async fetch(request, env, ctx) {
    // 解決 CORS 問題讓前端可直接 fetch
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Max-Age": "86400",
    };
    if (request.method === "OPTIONS") { return new Response(null, { headers: corsHeaders }); }

    // 你真實的 Google Apps Script (Web App) 或內部 API 網址
    const realApiUrl = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
    
    try {
      const response = await fetch(realApiUrl);
      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          ...corsHeaders
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Fetch failed" }), { status: 500, headers: corsHeaders });
    }
  }
};
```
4. 部署後，將取得的 Worker 網址（例如 `https://dayoff-api.your-username.workers.dev`）填入 `config.js`。

## 🎯 授權條款
MIT License
