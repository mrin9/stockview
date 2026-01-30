import { MongoClient } from 'mongodb';
import 'dotenv/config';

async function testConnection() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('❌ Error: MONGODB_URI is not defined in .env file');
        process.exit(1);
    }

    console.log('🔄 Attempting to connect to MongoDB...');
    console.log(`📍 URI: ${uri.replace(/(:.*@)/, ':****@')}`); // Mask credentials

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Success: Connected to MongoDB!');

        const db = client.db('stock_view');
        // Optional: List collections to verify read access
        const collections = await db.listCollections().toArray();
        console.log(`📚 Accessible Collections: ${collections.map(c => c.name).join(', ') || 'None'}`);

    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        process.exit(1);
    } finally {
        await client.close();
        console.log('👋 Connection closed.');
    }
}

testConnection();
