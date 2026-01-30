import { MongoClient } from 'mongodb';

const MONGO_URI = import.meta.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'tradedb';
const COLLECTION_NAME = 'stocks';

export async function GET() {
    console.log('[symbols.json] Request received');
    console.log('[symbols.json] MONGO_URI:', MONGO_URI ? `${MONGO_URI.substring(0, 20)}...` : 'NOT SET');

    const client = new MongoClient(MONGO_URI);
    try {
        console.log('[symbols.json] Connecting to MongoDB...');
        await client.connect();
        console.log('[symbols.json] Connected successfully');

        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const symbols = await collection.distinct('symbol');
        console.log('[symbols.json] Symbols found:', symbols.length, symbols);

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
    } finally {
        await client.close();
        console.log('[symbols.json] Connection closed');
    }
}
