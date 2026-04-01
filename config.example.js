// config.example.js
// 複製此檔案並重新命名為 config.js，然後填寫你的設定

window.APP_CONFIG = {
  // 顯示相關
  title: "你的專案名稱之今天誰請假",
  logoUrl: "/static/logo.svg",
  locale: "zh-TW", // 預設語系 (zh-TW, en-US... 等)
  
  // 資料來源：你的 Cloudflare Pages/Worker 收發 API 網址
  // 【重要】如果你是使用我們推薦的 KV 架構，這是負責「讀取」的端點，前端使用 GET 拿資料。
  // 因此，網址後方必須帶有「尾巴參數（例如 ?key=dayoff_json）」，Cloudflare 才知道該撈取哪個 KV 資料。
  dataApiUrl: "https://your-worker.workers.dev/api/portal?key=dayoff_json",

  // 介面文字 (簡易 i18n)
  i18n: {
    searchPlaceholder: "🔍 哪隻蛙仔？ (搜尋姓名)",
    sortAscText: "按時間排序（今天放到最後面）",
    sortDescText: "按時間排序（今天開始）",
    noDataText: "目前沒有請假資料。",
    lastUpdatedText: "最後更新時間：",
    fetchErrorText: "無法取得遠端資料，改用預設資料顯示："
  }
};
