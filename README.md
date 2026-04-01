# Dayoff Board 🎉

<p align="center">
  <a href="./README_zh-TW.md">繁體中文說明 (Traditional Chinese)</a>
</p>

A pure frontend static web tool for displaying "Who's on leave today" or "Upcoming leaves" in your team. 
By integrating with your team's Google Calendar, you can get a clear overview of everyone's leave status directly on this dashboard.

**Architecture Motivation:**
We use **Google Apps Script (GAS)** in the background to fetch Google Calendar info and convert it into a simple JSON array for the frontend. The reason we don't fetch Google APIs directly from the frontend or GitHub Actions is because **GAS seamlessly handles Google's tedious Authentication (OAuth) process** with zero overhead. Meanwhile, the lightweight frontend (`index.html`) can be easily deployed to services like Cloudflare Pages!

## ✨ Features
- 🚀 **Pure Frontend Architecture**: Contains only HTML/JS/CSS (with Tailwind CSS). It can be directly deployed to any static site hosting service like GitHub Pages, Cloudflare Pages, or Vercel.
- 🔄 **Auto-Refresh**: Automatically refreshes data every 5 minutes to ensure the latest leave status is displayed.
- 📱 **Responsive Design**: Fully responsive, works seamlessly on both desktop and mobile devices.
- 🛠️ **Framework-Agnostic**: Does not rely on complex frameworks like React or Vue; uses native ES Modules (Vanilla JS).
- 💰 **Zero Server Cost**: Uses Google Apps Script (GAS) as a free middleware microservice, perfectly resolving the headache of Google Calendar API Authentication.
---

## 🚀 Quick Start

### 1. Clone the Project
Clone the repository to your local machine:
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name/dayoff
```

### 2. Configure Your Environment
We have decoupled the configuration to protect your privacy and make open-sourcing easier. Please duplicate the example configuration file:
```bash
cp config.example.js config.js
```
Open `config.js` and fill in your settings:
- `dataApiUrl`: Enter your Cloudflare Worker or API URL (see architecture tutorial below).
- `title`: Set your project title and company name.
- `logoUrl`: Replace with your own company logo path or URL.
- Other i18n texts can be customized as well.

> 💡 **Note**: `config.js` is added to `.gitignore`, so it won't be pushed to the public repository. Feel free to modify the private links inside without worrying about leaking secrets.

### 3. Local Preview
Since we use native ES Modules (`type="module"`), directly double-clicking `index.html` might cause CORS errors in the browser console.
It is highly recommended to use a local server for previewing:
```bash
# If you have Node.js installed
npx http-server .

# Or using Python
python3 -m http.server
```

---

## 🛠️ Architecture Tutorial: Google Calendar to Cloudflare Pages

Our recommended data source architecture:
`[Google Calendar] -> [Google Apps Script (Handles Auth & Formats Data)] -> [Static Frontend Webpage (Hosted on Cloudflare Pages)]`

### Expected JSON Data Format
Regardless of the technology you use, your API must return a JSON array in the following format:
```json
[
  {
    "title": "John Doe",
    "calendarName": "Personal Leave",
    "startTime": "2024-04-01T08:00:00Z",
    "endTime": "2024-04-01T17:00:00Z"
  },
  {
    "title": "Jane Smith",
    "calendarName": "Annual Leave",
    "startTime": "2024-05-15T00:00:00Z",
    "endTime": "2024-05-18T00:00:00Z"
  }
]
```
*(The `startTime` and `endTime` will be parsed by the system to determine if it overlaps with "today". If it does, the event card background will be highlighted!)*

### 👉 Implementation Option 1: Cloudflare Worker (as a Proxy)
If you already have a working URL (e.g., your Google Apps Script Web App), but you don't want to expose this URL directly in the frontend `config.js`, you can set up a Cloudflare Worker as a proxy:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **Create application** > **Create Worker**
3. Example of core code routing:
```javascript
export default {
  async fetch(request, env, ctx) {
    // Resolve CORS issues so the frontend can fetch directly
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Max-Age": "86400",
    };
    if (request.method === "OPTIONS") { return new Response(null, { headers: corsHeaders }); }

    // Your actual Google Apps Script (Web App) or internal API URL
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
4. After deployment, insert the Worker URL (e.g., `https://dayoff-api.your-username.workers.dev`) into your `config.js`.

## 🎯 License
MIT License
