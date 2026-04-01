const config = window.APP_CONFIG || {
  title: "WPORT 之今天誰請假",
  logoUrl: "/static/logo.svg",
  locale: "zh-TW",
  dataApiUrl: "/api/portal?key=dayoff_json",
  i18n: {
    searchPlaceholder: "🔍 哪隻蛙仔？",
    sortAscText: "按時間排序（今天放到最後面）",
    sortDescText: "按時間排序（今天開始）",
    noDataText: "目前沒有請假資料。",
    lastUpdatedText: "最後更新時間：",
    fetchErrorText: "無法取得遠端資料，改用預設資料顯示："
  }
};

let allEvents = [];
let currentFilter = "";
let currentSortOrder = "desc";

function applyConfigToDOM() {
  const pageTitle = document.getElementById("pageTitle");
  if (pageTitle) pageTitle.innerText = config.title;

  const favicon = document.getElementById("favicon");
  if (favicon && config.logoUrl) favicon.href = config.logoUrl;

  const logoImg = document.getElementById("logoImg");
  if (logoImg && config.logoUrl) logoImg.src = config.logoUrl;

  const mainTitle = document.getElementById("mainTitle");
  if (mainTitle) mainTitle.innerText = config.title;

  const filterInput = document.getElementById("filterInput");
  if (filterInput) filterInput.placeholder = config.i18n.searchPlaceholder;

  const sortAscOption = document.getElementById("sortAscOption");
  if (sortAscOption) sortAscOption.innerText = config.i18n.sortAscText;

  const sortDescOption = document.getElementById("sortDescOption");
  if (sortDescOption) sortDescOption.innerText = config.i18n.sortDescText;

  const noEvents = document.getElementById("noEvents");
  if (noEvents) noEvents.innerText = config.i18n.noDataText;

  document.documentElement.lang = config.locale;
}

async function init() {
  applyConfigToDOM();

  // 1. 先設定一組預設資料（測試用），確保畫面不會空白
  allEvents = [{
    title: "測試人員",
    calendarName: "測試請假",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 86400000).toISOString() // 明天
  }];

  try {
    // 2. 嘗試從 API 抓取正式資料
    const response = await fetch(config.dataApiUrl);
    if (response.ok) {
      const data = await response.json();
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      // Handle both {data: [...]} and [...] formats
      allEvents = Array.isArray(parsed) ? parsed : (parsed.data || parsed);
      console.log("成功取得遠端資料");
    }
  } catch (err) {
    // 3. 如果失敗了，只在 Console 報錯，不打斷畫面渲染
    console.warn(config.i18n.fetchErrorText, err.message);
  }

  // 4. 不管 API 成功或失敗，都執行渲染
  if (allEvents && allEvents.length > 0) {
    applyFilterAndSort(); // 預設按時間排序（今天開始）
    setupEventListeners();
  } else {
    document.getElementById("noEvents").style.display = "block";
    document.getElementById("eventList").style.display = "none";
  }

  // 5. 更新「最後更新時間」
  updateLastUpdatedTime();
}

function updateLastUpdatedTime() {
  const lastUpdatedEl = document.getElementById("lastUpdated");
  if (lastUpdatedEl) {
    const now = new Date();
    lastUpdatedEl.innerText = `${config.i18n.lastUpdatedText}${now.toLocaleString(config.locale)}`;
  }
}

function renderEvents(events) {
  const list = document.getElementById("eventList");
  const noEvents = document.getElementById("noEvents");

  list.innerHTML = ""; // Clear existing list

  if (events.length === 0) {
    noEvents.style.display = "block";
    list.style.display = "none";
    return;
  }

  noEvents.style.display = "none";
  list.style.display = "flex";

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - 1;

  events.forEach(event => {
    const item = document.createElement("div");
    item.className = "bg-white rounded-3xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-lg hover:border-[#56C7BB]";

    const eventStartTime = new Date(event.startTime).getTime();
    const eventEndTime = new Date(event.endTime).getTime();

    // Highlight if today is within the event duration
    const isToday = (todayStart <= eventEndTime) && (todayEnd >= eventStartTime);
    if (isToday) {
      item.classList.add("bg-[#56C7BB]", "text-white");
      item.classList.remove("bg-white", "border-slate-100");
    }

    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);

    item.innerHTML = `
      <div class="flex flex-col gap-3">
        <h3 class="text-xl font-bold ${isToday ? 'text-white' : 'text-slate-800'}">${event.title}</h3>
        <div class="flex flex-col gap-2 text-sm ${isToday ? 'text-white/90' : 'text-slate-500'}">
          <div class="flex items-center gap-2">
            <i class="fa-regular fa-calendar-days w-4"></i>
            <span>${startDate.toLocaleString(config.locale)} ~ ${endDate.toLocaleString(config.locale)}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fa-regular fa-folder w-4"></i>
            <span>${event.calendarName}</span>
          </div>
        </div>
      </div>
    `;

    list.appendChild(item);
  });
}

function filterEvents(keyword) {
  currentFilter = keyword;
  applyFilterAndSort();
}

function sortEvents(order) {
  currentSortOrder = order;
  applyFilterAndSort();
}

function applyFilterAndSort() {
  // First apply filter
  let filtered = allEvents;
  if (currentFilter.trim()) {
    const lower = currentFilter.trim().toLowerCase();
    filtered = allEvents.filter(event =>
      event.title.toLowerCase().includes(lower) ||
      event.calendarName.toLowerCase().includes(lower)
    );
  }

  // Then apply sort
  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.startTime);
    const dateB = new Date(b.startTime);
    return currentSortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  renderEvents(sorted);
}

function setupEventListeners() {
  // Event listener for search/filtering
  const filterInput = document.getElementById("filterInput");
  if (filterInput) {
    filterInput.addEventListener("input", function () {
      filterEvents(this.value);
    });
  }

  // Event listener for sorting by time
  const sortOrder = document.getElementById("sortOrder");
  if (sortOrder) {
    sortOrder.addEventListener("change", function () {
      sortEvents(this.value);
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// 每 5 分鐘自動刷新一次資料
setInterval(init, 5 * 60 * 1000);
