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

## 🛠️ Architecture Tutorial: Push from GAS to Cloudflare KV

To achieve optimal loading performance and handle high concurrency, we highly recommend the following high-performance architecture:
`[Google Calendar] -> [GAS (Scheduled JSON Generator)] -> (POST Request) -> [Cloudflare KV] -> [Frontend Webpage fetches KV]`

This means the frontend does not directly call Google API. Instead, it reads the cached data from Cloudflare's Edge Network (KV). This guarantees lightning-fast loading speeds and prevents hitting Google's API rate limits.

### 1. Google Apps Script (GAS) Setup
1. Create a new Google Apps Script project and paste the contents of `gas/Code.js` from this repository.
2. **Replace `API_URL`**: In `Code.js`, there is a variable `var API_URL = "https://...";`. This URL represents your Cloudflare receiver endpoint. **Note: This API URL is specifically used to receive the JSON file through Cloudflare KV. The JSON is generated periodically via GAS and pushed directly into KV.** Please replace it with your own Cloudflare Endpoint.
3. **Set up Triggers**: Configure a time-driven trigger in GAS to automatically run the `getDayOffData()` function every 5-15 minutes. This ensures the JSON data is correctly formatted & pushed to KV regularly.

### 2. Cloudflare Pages + KV Setup
You need a Cloudflare Pages project with a bound KV namespace to receive and store the data:
1. **Create a KV Namespace**: Set up a KV namespace in your Cloudflare Dashboard.
2. **Create the Receiver API**: Using Cloudflare Pages Functions (e.g., creating `/functions/api/portal.js`), write a logic that:
   - On `POST`: Receives the pushed JSON from GAS and stores it into the bound KV.
   - On `GET`: Retrieves the latest JSON from KV and serves it to the frontend webpage (this corresponds to the `dataApiUrl` in your `config.js`).

### Expected JSON Data Format
Regardless of your backend approach, your final API endpoint must return a JSON array in the following format:
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

## 🎯 License
MIT License
