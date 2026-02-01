import clientPromise from '../../lib/mongodb';

const DB_NAME = 'tradedb';
const COLLECTION_NAME = 'stocks';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);
        const symbols = await collection.distinct('symbol');

        return new Response(JSON.stringify(symbols), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any) {
        console.error('[symbols.json] ERROR:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500
        });
    }
}
