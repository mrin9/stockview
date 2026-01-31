import { MongoClient } from 'mongodb';

const MONGO_URI = import.meta.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'tradedb';

export const prerender = false;

export async function GET({ params }) {
    const { symbol } = params;

    if (!symbol) {
        return new Response(JSON.stringify({ error: 'Symbol is required' }), { status: 400 });
    }

    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const upperSymbol = symbol.toUpperCase();

        const [
            profile,
            fundamentals,
            financials,
            shareholdings,
            actions,
            peers,
            history
        ] = await Promise.all([
            db.collection('stock_profiles').findOne({ symbol: upperSymbol }),
            db.collection('stock_fundamentals').findOne({ symbol: upperSymbol }),
            db.collection('stock_financials').findOne({ symbol: upperSymbol }),
            db.collection('stock_shareholdings').findOne({ symbol: upperSymbol }),
            db.collection('stock_actions').findOne({ symbol: upperSymbol }),
            db.collection('stock_peers').findOne({ symbol: upperSymbol }),
            db.collection('stocks')
                .find({ symbol: upperSymbol })
                .sort({ timestamp: -1 })
                .limit(500)
                .toArray()
        ]);

        if (!profile) {
            return new Response(JSON.stringify({ error: 'Stock details not found' }), { status: 404 });
        }

        const aggregatedData = {
            symbol: upperSymbol,
            profile: profile || {},
            fundamentals: fundamentals || {},
            financials: financials || {},
            shareholdings: shareholdings?.history || [],
            actions: actions?.events || [],
            peers: peers?.list || [],
            history: history.reverse()
        };

        return new Response(JSON.stringify(aggregatedData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Database Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    } finally {
        await client.close();
    }
}
