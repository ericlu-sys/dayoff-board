// config.example.js
// 複製此檔案並重新命名為 config.js，然後填寫你的設定

window.APP_CONFIG = {
  // 顯示相關
  title: "你的專案名稱之今天誰請假",
  logoUrl: "/static/logo.svg",
  locale: "zh-TW", // 預設語系 (zh-TW, en-US... 等)
  
  // 資料來源 
  // 例如：你的 Cloudflare Worker API 網址，該 API 負責回傳整理好的 Google Sheet JSON 資料
  dataApiUrl: "/api/portal?key=dayoff_json",

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
