import { MongoClient } from 'mongodb';

const MONGO_URI = import.meta.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'tradedb';
const COLLECTION_NAME = 'stocks';

export async function GET({ url }: { url: URL }) {
    const symbol = url.searchParams.get('symbol') || 'RELIANCE';
    const resolution = url.searchParams.get('resolution');
    const limitParam = url.searchParams.get('limit');
    const fromParam = url.searchParams.get('from');

    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        let query: any = { symbol };
        let options: any = { sort: { timestamp: -1 } };

        if (fromParam) {
            // Range Query: Fetch all mixed resolution data from this time
            const fromDate = new Date(parseInt(fromParam));
            query.timestamp = { $gte: fromDate };
            // No limit for ranges to ensure full graph
        } else {
            // Legacy / Default: Limit by resolution and count
            if (resolution) query.resolution = resolution;
            options.limit = parseInt(limitParam || '100');
        }

        const data = await collection
            .find(query, options)
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
