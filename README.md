# 📈 Stock View Dashboard

A high-performance stock analytics dashboard built with **Astro**, **Vue.js**, **Tailwind CSS**, and **MongoDB**. Features include real-time-like charts, advanced filtering with multi-criteria logic, and a stunning "Avalon" UI design.

## 🚀 Prerequisites

Before running the project, ensure you have:
*   **Node.js**: v18.14.1 or higher.
*   **MongoDB**: A running instance (Local or Atlas Cloud).

## 🛠️ Setup & Configuration

1.  **Clone the repository** (if you haven't already).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    The project uses an `.env` file to manage database connections.
    *   Open `.env` in the root directory.
    *   Set `MONGODB_URI` to your specific connection string.
    *   *Default*: Connects to the configured Cloud MongoDB instance.
    *   *Local*: Uncomment the local URI line to switch to `localhost:27017`.

## 📜 Scripts & Usage

### 1. Generating Mock Data
This script creates a robust dataset for **20 major Indian stocks** (RELIANCE, TCS, HDFCBANK, etc.) with over 30 technical indicators.
It implements a realistic **12-month tiered timeframe strategy**:
- **Last 7 Days**: High-resolution **1-minute** data.
- **Previous 23 Days**: Mid-resolution **1-hour** data.
- **Previous 11 Months**: Long-term **3-hour** data.

**It will clear any existing data in the `stock_view` database.**

```bash
npm run generate-data
```
*   **What it does**: Connects to the DB defined in `.env`, clears old data, generates ~30 days of 1-hour and 3 days of 1-minute OHLCV data, calculates indicators, and populates the database.

### 2. Testing Database Connection
Verify that your application can successfully connect to the configured MongoDB instance.

```bash
npm run test-connection
```
*   **What it does**: Loads `.env`, attempts a connection, and lists available collections. Use this to troubleshoot network or credential issues.

## 💻 Running the Project

### Development Mode
Start the local development server with hot-reload enabled.

```bash
npm run dev
```
*   Access the app at `http://localhost:4321`.

### Production Mode
To run the application as it would in a production environment (using the Node.js adapter):

1.  **Build the project**:
    ```bash
    npm run build
    ```
    *   This compiles the Astro/Vue app into a standalone Node.js server in the `dist/` folder.

2.  **Run the server**:
    ```bash
    node dist/server/entry.mjs
    ```
    *   The app will typically start on port `4321` (or the port defined by your host).

## 🧪 Testing

Currently, the primary test suite focuses on infrastructure and connectivity.

### Connection Tests
To verify valid database credentials and network access:
```bash
npm run test-connection
```

### Manual Verification
1.  **Data Integrity**: Run `npm run generate-data` and verify no errors are logged.
2.  **Search Logic**: Open the "Advanced Search" page and try complex queries (e.g., "RSI > 70 AND Close > 2000").
3.  **Chart Rendering**: Open "Market Pulse" to verify TradingView charts load data correctly.

---

**Built with ❤️ for Traders**
