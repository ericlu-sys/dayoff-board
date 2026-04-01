var web_title = "WPORT之今天誰請假";
var name_of_day_off = "請假";
var how_long = 30;
var API_URL = "https://wport-plugins.pages.dev/api/portal";

// ❌ 不需要 doGet() 函数了，因为 HTML 由 Cloudflare Pages 提供
// function doGet() {
//   const template = HtmlService.createTemplateFromFile('index');
//   template.web_title = web_title;
//   return template.evaluate().setTitle(web_title);
// }

function getDayOffData() {
  var calendars = CalendarApp.getAllCalendars();
  var start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - how_long); // 30 days ago

  var end = new Date();
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() + how_long); // 30 days forward

  var results = [];
  calendars.forEach(function(calendar) {
    if (calendar.getName().includes(name_of_day_off)) {
      var events = calendar.getEvents(start, end);
      events.forEach(function(event) {
        results.push({
          calendarName: calendar.getName(),
          title: event.getTitle(),
          startTime: event.getStartTime().toISOString(),
          endTime: event.getEndTime().toISOString()
        });
      });
    }
  });

  Logger.log('Found ' + results.length + ' events');

  var dataToStore = results.length > 0 ? { data: results } : { data: [] };
  var jsonData = JSON.stringify(dataToStore);

  // 寫入 KV 存储
  try {
    var response = UrlFetchApp.fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        key: 'dayoff_json',
        value: jsonData
      })
    });

    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    
    Logger.log('API Response Code: ' + responseCode);
    Logger.log('API Response: ' + responseText);

    if (responseCode === 200) {
      Logger.log('✅ 成功！資料已存入 KV 存储：dayoff_json');
    } else {
      Logger.log('❌ 寫入失敗: ' + responseText);
    }
  } catch (error) {
    Logger.log('❌ 寫入 KV 時發生錯誤: ' + error.toString());
  }

  return dataToStore;
}
