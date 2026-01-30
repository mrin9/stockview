import { MongoClient } from 'mongodb';
import 'dotenv/config';
import TI from 'technicalindicators';
const {
    SMA, EMA, RSI, MACD, BollingerBands, ATR, Stochastic, ADX, CCI, WilliamsR, OBV, IchimokuCloud, PSAR, MFI, ROC, TRIX, KeltnerChannels, WMA
} = TI;
import { subDays, subMonths, addMinutes, addHours, isBefore } from 'date-fns';

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = 'tradedb';
const COLLECTION_NAME = 'stocks';

const STOCKS = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
    'BHARTIARTL', 'SBIN', 'LICI', 'HINDUNILVR', 'ITC',
    'KOTAKBANK', 'AXISBANK', 'LT', 'BAJFINANCE', 'MARUTI',
    'HCLTECH', 'TITAN', 'SUNPHARMA', 'ASIANPAINT', 'ULTRACEMCO'
];

async function generateData() {
    if (!MONGO_URI) {
        console.error('❌ MONGODB_URI is missing in .env');
        process.exit(1);
    }

    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Clear existing data
        await collection.deleteMany({});
        console.log('🧹 Cleared existing data');

        const now = new Date();
        const twoDaysAgo = subDays(now, 2);
        const thirtyDaysAgo = subDays(now, 30);
        const twelveMonthsAgo = subMonths(now, 12);

        for (const symbol of STOCKS) {
            console.log(`📈 Generating data for ${symbol}...`);
            let allTicks = [];

            // Random start price between 500 and 2500
            let lastClose = 500 + Math.random() * 2000;

            // Phase 1: 3h intervals (12 Months ago -> 30 Days ago)
            let currentTime = twelveMonthsAgo;
            while (isBefore(currentTime, thirtyDaysAgo)) {
                const tick = generateOHLC(symbol, currentTime, lastClose, '3h', 3);
                allTicks.push(tick);
                lastClose = tick.close;
                currentTime = addHours(currentTime, 3);
            }

            // Phase 2: 1h intervals (30 Days ago -> 7 Days ago)
            currentTime = thirtyDaysAgo;
            while (isBefore(currentTime, twoDaysAgo)) {
                const tick = generateOHLC(symbol, currentTime, lastClose, '1h', 1);
                allTicks.push(tick);
                lastClose = tick.close;
                currentTime = addHours(currentTime, 1);
            }

            // Phase 3: 1m intervals (7 Days ago -> Now)
            currentTime = twoDaysAgo;
            while (isBefore(currentTime, now)) {
                const tick = generateOHLC(symbol, currentTime, lastClose, '1m', 0.016); // ~1 min fraction of hour for vol scaling broadly
                allTicks.push(tick);
                lastClose = tick.close;
                currentTime = addMinutes(currentTime, 1);
            }

            // Calculate indicators on the FULL dataset to ensure continuity
            console.log(`   Detailed data points: ${allTicks.length}. Calculating indicators...`);
            const ticksWithIndicators = calculateIndicators(allTicks);

            // Insert in chunks
            const chunkSize = 2000;
            let insertedCount = 0;
            for (let i = 0; i < ticksWithIndicators.length; i += chunkSize) {
                const chunk = ticksWithIndicators.slice(i, i + chunkSize);
                await collection.insertMany(chunk);
                insertedCount += chunk.length;
            }
            console.log(`   ✅ Inserted ${insertedCount} ticks for ${symbol}`);
        }

        console.log('🎉 Data generation complete!');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

function generateOHLC(symbol, time, lastClose, resolution, timeScaleHours) {
    // scale volatility based on time interval duration to keep price movements realistic
    // 1h vol ~ 1%, 3h vol ~ 1.7%, 1m vol ~ 0.1%
    let volatility = 0.002; // default 1m
    if (resolution === '1h') volatility = 0.01;
    if (resolution === '3h') volatility = 0.015;

    const change = lastClose * volatility * (Math.random() - 0.5);
    const open = lastClose;
    const close = open + change;
    const high = Math.max(open, close) + (Math.random() * (open * volatility * 0.5));
    const low = Math.min(open, close) - (Math.random() * (open * volatility * 0.5));
    const volume = Math.floor(Math.random() * (100000 + (resolution === '1m' ? 0 : 500000)));

    return {
        symbol,
        timestamp: time,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume,
        resolution
    };
}

function calculateIndicators(ticks) {
    const highs = ticks.map(t => t.high);
    const lows = ticks.map(t => t.low);
    const closes = ticks.map(t => t.close);
    const volumes = ticks.map(t => t.volume);

    const results = {
        sma10: SMA.calculate({ period: 10, values: closes }),
        sma20: SMA.calculate({ period: 20, values: closes }),
        sma50: SMA.calculate({ period: 50, values: closes }),
        sma200: SMA.calculate({ period: 200, values: closes }),
        ema10: EMA.calculate({ period: 10, values: closes }),
        ema20: EMA.calculate({ period: 20, values: closes }),
        ema50: EMA.calculate({ period: 50, values: closes }),
        ema200: EMA.calculate({ period: 200, values: closes }),
        rsi: RSI.calculate({ period: 14, values: closes }),
        macd: MACD.calculate({ fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, values: closes }),
        bb: BollingerBands.calculate({ period: 20, stdDev: 2, values: closes }),
        atr: ATR.calculate({ period: 14, high: highs, low: lows, close: closes }),
        stoch: Stochastic.calculate({ period: 14, signalPeriod: 3, low: lows, high: highs, close: closes }),
        adx: ADX.calculate({ period: 14, high: highs, low: lows, close: closes }),
        cci: CCI.calculate({ period: 20, high: highs, low: lows, close: closes }),
        wpr: WilliamsR.calculate({ period: 14, high: highs, low: lows, close: closes }),
        obv: OBV.calculate({ close: closes, volume: volumes }),
        ichimoku: IchimokuCloud.calculate({ conversionPeriod: 9, basePeriod: 26, spanPeriod: 52, displacement: 26, high: highs, low: lows }),
        psar: PSAR.calculate({ step: 0.02, max: 0.2, high: highs, low: lows }),
        mfi: MFI.calculate({ period: 14, high: highs, low: lows, close: closes, volume: volumes }),
        roc: ROC.calculate({ period: 12, values: closes }),
        trix: TRIX.calculate({ period: 18, values: closes }),
        keltner: KeltnerChannels.calculate({ maPeriod: 20, atrPeriod: 10, multiplier: 1, high: highs, low: lows, close: closes }),
        wma: WMA.calculate({ period: 20, values: closes }),
    };

    const N = ticks.length;

    return ticks.map((tick, i) => {
        const indicators = {};

        const mapSimple = (key, data) => {
            if (!data) return;
            const M = data.length;
            const dataIdx = i - (N - M);
            if (dataIdx >= 0) indicators[key] = data[dataIdx];
        };

        const mapComplex = (prefix, data) => {
            if (!data) return;
            const M = data.length;
            const dataIdx = i - (N - M);
            if (dataIdx >= 0) {
                const item = data[dataIdx];
                for (const [k, v] of Object.entries(item)) {
                    indicators[`${prefix}_${k}`] = v;
                }
            }
        };

        mapSimple('sma10', results.sma10);
        mapSimple('sma20', results.sma20);
        mapSimple('sma50', results.sma50);
        mapSimple('sma200', results.sma200);
        mapSimple('ema10', results.ema10);
        mapSimple('ema20', results.ema20);
        mapSimple('ema50', results.ema50);
        mapSimple('ema200', results.ema200);
        mapSimple('rsi', results.rsi);
        mapComplex('macd', results.macd);
        mapComplex('bb', results.bb);
        mapSimple('atr', results.atr);
        mapComplex('stoch', results.stoch);
        mapComplex('adx', results.adx);
        mapSimple('cci', results.cci);
        mapSimple('wpr', results.wpr);
        mapSimple('obv', results.obv);
        mapComplex('ichimoku', results.ichimoku);
        mapSimple('psar', results.psar);
        mapSimple('mfi', results.mfi);
        mapSimple('roc', results.roc);
        mapSimple('trix', results.trix);
        mapComplex('keltner', results.keltner);
        mapSimple('wma', results.wma);

        return { ...tick, ...indicators };
    });
}

generateData();
