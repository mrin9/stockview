import { MongoClient } from 'mongodb';

const MONGO_URI = import.meta.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'tradedb';
const COLLECTION_NAME = 'stocks';

export async function GET({ url }: { url: URL }) {
    const symbol = url.searchParams.get('symbol') || 'RELIANCE';
    const resolution = url.searchParams.get('resolution');
    const limitParam = url.searchParams.get('limit');
    const fromParam = url.searchParams.get('from');

    console.log('[stocks.json] Request params:', { symbol, resolution, limitParam, fromParam });
    console.log('[stocks.json] MONGO_URI:', MONGO_URI ? `${MONGO_URI.substring(0, 20)}...` : 'NOT SET');

    const client = new MongoClient(MONGO_URI);
    try {
        console.log('[stocks.json] Connecting to MongoDB...');
        await client.connect();
        console.log('[stocks.json] Connected successfully');

        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        let query: any = { symbol };
        let options: any = { sort: { timestamp: -1 } };

        if (fromParam) {
            const fromDate = new Date(parseInt(fromParam));
            query.timestamp = { $gte: fromDate };
            console.log('[stocks.json] Range query from:', fromDate.toISOString());
        } else {
            if (resolution) query.resolution = resolution;
            options.limit = parseInt(limitParam || '100');
        }

        console.log('[stocks.json] Query:', JSON.stringify(query));

        const data = await collection
            .find(query, options)
            .toArray();

        console.log('[stocks.json] Records found:', data.length);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any) {
        console.error('[stocks.json] ERROR:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500
        });
    } finally {
        await client.close();
        console.log('[stocks.json] Connection closed');
    }
}
