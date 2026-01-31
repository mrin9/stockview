import clientPromise from '../../lib/mongodb';

const DB_NAME = 'tradedb';
const COLLECTION_NAME = 'stocks';

export const POST = async ({ request }: { request: Request }) => {
    try {
        const bodyText = await request.text();
        if (!bodyText) {
            return new Response(JSON.stringify({ error: 'No body provided' }), { status: 400 });
        }

        const { criteria } = JSON.parse(bodyText);
        if (!criteria || !Array.isArray(criteria) || criteria.length === 0) {
            return new Response(JSON.stringify({ error: 'Invalid criteria' }), { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const buildMongoCriterion = (c: any) => {
            let val: any = c.value;
            const isNonNumeric = ['symbol', 'resolution', 'timestamp'].includes(c.field);

            if (!isNonNumeric && val !== '' && !isNaN(val as any)) {
                val = parseFloat(val);
            }

            if (c.field === 'symbol' && typeof val === 'string' && val.length >= 3) {
                return { [c.field]: { $regex: val, $options: 'i' } };
            }

            switch (c.operator) {
                case '==': return { [c.field]: val };
                case '>': return { [c.field]: { $gt: val } };
                case '<': return { [c.field]: { $lt: val } };
                case '>=': return { [c.field]: { $gte: val } };
                case '<=': return { [c.field]: { $lte: val } };
                case 'contains': return { [c.field]: { $regex: val, $options: 'i' } };
                default: return { [c.field]: val };
            }
        };

        let currentQuery: any = buildMongoCriterion(criteria[0]);

        for (let i = 0; i < criteria.length - 1; i++) {
            const nextCrit = buildMongoCriterion(criteria[i + 1]);
            const joiner = criteria[i].joiner;

            if (joiner === 'AND') {
                currentQuery = { $and: [currentQuery, nextCrit] };
            } else {
                currentQuery = { $or: [currentQuery, nextCrit] };
            }
        }

        const results = await collection
            .find(currentQuery)
            .sort({ timestamp: -1 })
            .toArray();

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
