import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'stock_view';
const COLLECTION_NAME = 'stock_data';

export async function GET({ url }: { url: URL }) {
    const symbol = url.searchParams.get('symbol') || 'RELIANCE';
    const resolution = url.searchParams.get('resolution') || '1m';
    const limit = parseInt(url.searchParams.get('limit') || '100');

    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const data = await collection
            .find({ symbol, resolution })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500
        });
    } finally {
        await client.close();
    }
}
