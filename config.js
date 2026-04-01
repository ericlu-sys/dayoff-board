window.APP_CONFIG = {
  // 顯示相關
  title: "WPORT 之今天誰請假",
  logoUrl: "./static/logo.svg", // 改用相對路徑 ./ 以利部署
  locale: "zh-TW", // 預設語系 (zh-TW, en-US... 等)
  
  // 資料來源：Cloudflare Pages / KV 讀取網址
  // 【重要】因為前端是透過 GET 請求拿資料，所以必須加上「尾巴參數」?key=dayoff_json，Cloudflare 才知道要開那一個 KV 抽屜
  dataApiUrl: "https://wport-plugins.pages.dev/api/portal?key=dayoff_json",

  // 介面文字 (簡易 i18n)
  i18n: {
    searchPlaceholder: "🔍 哪隻蛙仔？",
    sortAscText: "按時間排序（今天放到最後面）",
    sortDescText: "按時間排序（今天開始）",
    noDataText: "目前沒有請假資料。",
    lastUpdatedText: "最後更新時間：",
    fetchErrorText: "無法取得遠端資料，改用預設資料顯示："
  }
};
