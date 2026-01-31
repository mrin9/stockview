import { MongoClient } from 'mongodb';
import 'dotenv/config';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'tradedb';

const STOCKS = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
    'BHARTIARTL', 'SBIN', 'LICI', 'HINDUNILVR', 'ITC',
    'KOTAKBANK', 'AXISBANK', 'LT', 'BAJFINANCE', 'MARUTI',
    'HCLTECH', 'TITAN', 'SUNPHARMA', 'ASIANPAINT', 'ULTRACEMCO'
];

async function generateDetails() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        const db = client.db(DB_NAME);

        // Collections
        const collProfiles = db.collection('stock_profiles');
        const collFundamentals = db.collection('stock_fundamentals');
        const collFinancials = db.collection('stock_financials');
        const collShareholdings = db.collection('stock_shareholdings');
        const collActions = db.collection('stock_actions');
        const collPeers = db.collection('stock_peers');

        // Clear existing
        await Promise.all([
            collProfiles.deleteMany({}),
            collFundamentals.deleteMany({}),
            collFinancials.deleteMany({}),
            collShareholdings.deleteMany({}),
            collActions.deleteMany({}),
            collPeers.deleteMany({})
        ]);
        console.log('🧹 Cleared existing detailed collections');

        const profiles = [];
        const fundamentals = [];
        const financials = [];
        const shareholdings = [];
        const actions = [];
        const peers = [];

        for (const symbol of STOCKS) {
            profiles.push(generateProfile(symbol));
            fundamentals.push(generateFundamentals(symbol));
            financials.push(generateFinancials(symbol));
            shareholdings.push(generateShareholding(symbol));
            actions.push(generateActions(symbol));
            peers.push(generatePeers(symbol));
        }

        await collProfiles.insertMany(profiles);
        await collFundamentals.insertMany(fundamentals);
        await collFinancials.insertMany(financials);
        await collShareholdings.insertMany(shareholdings);
        await collActions.insertMany(actions);
        await collPeers.insertMany(peers);

        console.log(`✅ Inserted data for ${STOCKS.length} stocks across 6 collections`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

function generateProfile(symbol) {
    return {
        symbol,
        companyName: `${symbol} Industries Ltd.`,
        description: `${symbol} is a leading Indian company operating in key sectors. Known for its strong corporate governance and steady growth history.`,
        sector: ['Technology', 'Finance', 'Energy', 'Consumer Goods', 'Auto'][Math.floor(Math.random() * 5)],
        website: `https://www.${symbol.toLowerCase()}.com`
    };
}

function generateFundamentals(symbol) {
    return {
        symbol,
        marketCap: (Math.random() * 1000000 + 50000).toFixed(0),
        pe: (Math.random() * 80 + 10).toFixed(2),
        pb: (Math.random() * 15 + 1).toFixed(2),
        roe: (Math.random() * 25 + 5).toFixed(2) + '%',
        roce: (Math.random() * 30 + 5).toFixed(2) + '%',
        divYield: (Math.random() * 4).toFixed(2) + '%',
        bookValue: (Math.random() * 2000 + 100).toFixed(2),
        faceValue: 10,
        debtToEquity: (Math.random() * 2).toFixed(2),
        pros: [
            "Company is virtually debt free.",
            "Stock is providing a good dividend yield.",
            "Company has delivered good profit growth of 20% CAGR over last 5 years"
        ],
        cons: [
            "Stock is trading at 10x book value",
            "Promoter holding has decreased by 2% over last quarter"
        ]
    };
}

function generateFinancials(symbol) {
    return {
        symbol,
        quarterly: generateQuarterly(),
        pnl: generatePnL(),
        balanceSheet: generateBS(),
        cashFlow: generateCF(),
        ratios: generateRatios()
    };
}

function generateRatios() {
    const years = ['Mar 2024', 'Mar 2023', 'Mar 2022', 'Mar 2021', 'Mar 2020'];
    return years.map(y => ({
        year: y,
        roce: (Math.random() * 25 + 10).toFixed(0) + '%',
        roe: (Math.random() * 25 + 10).toFixed(0) + '%',
        debtToEquity: (Math.random()).toFixed(2),
        inventoryTurnover: (Math.random() * 10 + 2).toFixed(1),
        debtorDays: (Math.random() * 60 + 10).toFixed(0),
        interestCoverage: (Math.random() * 10 + 2).toFixed(1)
    }));
}

function generateQuarterly() {
    const periods = ['Jun 2024', 'Mar 2024', 'Dec 2023', 'Sep 2023'];
    return periods.map(p => ({
        period: p,
        sales: (Math.random() * 5000 + 2000).toFixed(0),
        expenses: (Math.random() * 4000 + 1500).toFixed(0),
        operatingProfit: (Math.random() * 1000 + 500).toFixed(0),
        opm: (Math.random() * 20 + 10).toFixed(0) + '%',
        otherIncome: (Math.random() * 200).toFixed(0),
        interest: (Math.random() * 100).toFixed(0),
        depreciation: (Math.random() * 200).toFixed(0),
        pbt: (Math.random() * 900 + 400).toFixed(0),
        tax: (Math.random() * 25 + 20).toFixed(0) + '%',
        netProfit: (Math.random() * 700 + 300).toFixed(0),
        eps: (Math.random() * 15 + 5).toFixed(2)
    }));
}

function generatePnL() {
    const years = ['Mar 2024', 'Mar 2023', 'Mar 2022', 'Mar 2021', 'Mar 2020'];
    return years.map(y => ({
        year: y,
        sales: (Math.random() * 50000 + 20000).toFixed(0),
        materialCost: (Math.random() * 10).toFixed(0) + '%', // % of sales
        employeeCost: (Math.random() * 10).toFixed(0) + '%', // % of sales
        operatingProfit: (Math.random() * 15000 + 5000).toFixed(0),
        opm: (Math.random() * 25 + 15).toFixed(0) + '%',
        otherIncome: (Math.random() * 2000).toFixed(0),
        interest: (Math.random() * 1000).toFixed(0),
        depreciation: (Math.random() * 3000).toFixed(0),
        pbt: (Math.random() * 12000 + 4000).toFixed(0),
        tax: (Math.random() * 30 + 10).toFixed(0) + '%',
        netProfit: (Math.random() * 10000 + 3000).toFixed(0),
        eps: (Math.random() * 100 + 20).toFixed(2),
        divPayout: (Math.random() * 40).toFixed(0) + '%'
    }));
}

function generateBS() {
    const years = ['Mar 2024', 'Mar 2023', 'Mar 2022', 'Mar 2021', 'Mar 2020'];
    return years.map(y => ({
        year: y,
        shareCapital: 500,
        reserves: (Math.random() * 50000 + 10000).toFixed(0),
        borrowings: (Math.random() * 10000).toFixed(0),
        otherLiabilities: (Math.random() * 15000 + 5000).toFixed(0),
        totalLiabilities: 0, // Calculated below
        fixedAssets: (Math.random() * 40000 + 10000).toFixed(0),
        cwip: (Math.random() * 2000).toFixed(0),
        investments: (Math.random() * 20000).toFixed(0),
        otherAssets: (Math.random() * 10000).toFixed(0),
        totalAssets: 0 // Calculated below
    })).map(x => {
        x.totalLiabilities = (parseFloat(x.shareCapital) + parseFloat(x.reserves) + parseFloat(x.borrowings) + parseFloat(x.otherLiabilities)).toFixed(0);
        x.totalAssets = x.totalLiabilities; // Always balances
        return x;
    });
}

function generateCF() {
    const years = ['Mar 2024', 'Mar 2023', 'Mar 2022', 'Mar 2021', 'Mar 2020'];
    return years.map(y => ({
        year: y,
        cashFromOperating: (Math.random() * 20000).toFixed(0),
        cashFromInvesting: (-(Math.random() * 10000)).toFixed(0),
        cashFromFinancing: (-(Math.random() * 5000)).toFixed(0),
        netCashFlow: 0
    })).map(x => {
        x.netCashFlow = (parseFloat(x.cashFromOperating) + parseFloat(x.cashFromInvesting) + parseFloat(x.cashFromFinancing)).toFixed(0);
        return x;
    });
}

function generateShareholding(symbol) {
    const quarters = ['Jun 2024', 'Mar 2024', 'Dec 2023', 'Sep 2023', 'Jun 2023'];
    return {
        symbol,
        history: quarters.map(q => ({
            period: q,
            promoters: (50 + Math.random() * 5).toFixed(2),
            fii: (20 + Math.random() * 5).toFixed(2),
            dii: (15 + Math.random() * 5).toFixed(2),
            public: (10 + Math.random() * 5).toFixed(2)
        }))
    };
}

function generateActions(symbol) {
    return {
        symbol,
        events: [
            { date: '2024-05-12', type: 'Dividend', description: 'Final Dividend of Rs. 10/share' },
            { date: '2024-02-01', type: 'Result', description: 'Q3 Financial Results' },
            { date: '2023-11-15', type: 'Split', description: 'Stock Split 10:2' }
        ]
    };
}

function generatePeers(symbol) {
    const allStocks = STOCKS.filter(s => s !== symbol);
    const peers = [];
    for (let i = 0; i < 5; i++) {
        const rand = allStocks[Math.floor(Math.random() * allStocks.length)];
        if (!peers.find(p => p.symbol === rand)) {
            peers.push({
                symbol: rand,
                cmp: (Math.random() * 5000 + 100).toFixed(2),
                pe: (Math.random() * 60 + 15).toFixed(2),
                marCap: (Math.random() * 500000).toFixed(0),
                divYield: (Math.random() * 3).toFixed(2) + '%',
                roe: (Math.random() * 25).toFixed(2) + '%'
            });
        }
    }
    return { symbol, list: peers };
}

generateDetails();
