import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

const DB_NAME = 'tradedb';
const COLLECTION_NAME = 'trade_triggers';

// Utility for placeholder username
const getRandomUser = () => {
    const users = ['alpha_trader', 'market_guru', 'swift_bot', 'quant_dev', 'bull_rider'];
    return users[Math.floor(Math.random() * users.length)];
};

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const triggers = await collection.find({}).sort({ createdAt: -1 }).toArray();

        return new Response(JSON.stringify(triggers), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function POST({ request }: { request: Request }) {
    try {
        const data = await request.json();
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const newTrigger = {
            triggerId: crypto.randomUUID(),
            username: getRandomUser(),
            createdAt: new Date().toISOString(),
            criteria: data.criteria || [],
            lifetime: data.lifetime || { value: 15, unit: 'DAYS' },
            frequency: data.frequency || 5, // minutes
            status: 'ACTIVE'
        };

        const result = await collection.insertOne(newTrigger);

        return new Response(JSON.stringify({ ...newTrigger, _id: result.insertedId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function PUT({ request }: { request: Request }) {
    try {
        const data = await request.json();
        const { _id, ...updateData } = data;

        if (!_id) {
            return new Response(JSON.stringify({ error: 'Missing trigger ID' }), { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        await collection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: updateData }
        );

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function DELETE({ url }: { url: URL }) {
    try {
        const id = url.searchParams.get('id');
        if (!id) {
            return new Response(JSON.stringify({ error: 'Missing trigger ID' }), { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        await collection.deleteOne({ _id: new ObjectId(id) });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
