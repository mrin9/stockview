import { MongoClient } from 'mongodb';

const uri = import.meta.env.MONGODB_URI || process.env.MONGODB_URI;

if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable (via .env or docker -e)');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (import.meta.env.DEV) {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!(globalThis as any)._mongoClientPromise) {
        client = new MongoClient(uri);
        (globalThis as any)._mongoClientPromise = client.connect();
    }
    clientPromise = (globalThis as any)._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
