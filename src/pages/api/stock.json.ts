import clientPromise from '../../lib/mongodb';

const DB_NAME = 'tradedb';

export const prerender = false;

export async function GET({ url }: { url: URL }) {
    const symbol = url.searchParams.get('symbol');

    if (!symbol) {
        return new Response(JSON.stringify({ error: 'Symbol is required' }), { status: 400 });
    }

    try {
        const client = await clientPromise;
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
    }
}
