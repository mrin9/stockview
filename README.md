# 📈 Stock View Dashboard

A high-performance stock analytics dashboard built with **Astro**, **Vue.js**, **Tailwind CSS**, and **MongoDB**. Features include real-time-like charts, advanced filtering with multi-criteria logic, and a stunning "Avalon" UI design.

## 🚀 Prerequisites

*   **Node.js**: v18.14.1 or higher.
*   **MongoDB**: A running instance (Local or Atlas Cloud).

## 🛠️ Setup & Configuration

1.  **Clone the repository**.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    Edit `.env` in the root directory to set `MONGODB_URI` to your connection string.

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run gen-data` | Generate mock stock data |
| `npm run test-db-conn` | Test MongoDB connection |

### Generating Mock Data

Creates data for **20 Indian stocks** with 30+ technical indicators using a tiered timeframe:

| Range | Interval |
|---|---|
| Last 1 Day | 1 minute |
| 2nd Day | 15 minutes |
| 2nd - 30th Day | 1 hour |
| 30th Day - 1 Year | 3 hours |

```bash
npm run gen-data
```

## 💻 Running the App

### Development
```bash
npm run dev
```
Access at `http://localhost:4321`.

### Production
```bash
# Build
npm run build

# Start server
node dist/server/entry.mjs
```

---

**Built with ❤️ for Traders**
