import clientPromise from '../../lib/mongodb';

const DB_NAME = 'tradedb';
const COLLECTION_NAME = 'stocks';

export async function GET({ url }: { url: URL }) {
    const symbol = url.searchParams.get('symbol') || 'RELIANCE';
    const resolution = url.searchParams.get('resolution');
    const limitParam = url.searchParams.get('limit');
    const fromParam = url.searchParams.get('from');
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        let query: any = { symbol };
        let options: any = { sort: { timestamp: -1 } };

        if (fromParam) {
            const fromDate = new Date(parseInt(fromParam));
            query.timestamp = { $gte: fromDate };
        } else {
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
        console.error('[stocks.json] ERROR:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500
        });
    }
}
