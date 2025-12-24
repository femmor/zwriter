import { MongoClient } from 'mongodb';

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {};

let clientPromise: Promise<MongoClient>;

export default function getMongoClient(): Promise<MongoClient> {
    const uri = process.env.MONGODB_URI;
    
    // During build phase, return a mock client to prevent build failures
    if (process.env.NEXT_PHASE === 'phase-production-build' || !uri) {
        if (!uri) {
            console.warn('MongoDB URI not found, using placeholder during build');
            return Promise.resolve({} as MongoClient);
        }
    }

    if (!uri) {
        throw new Error('Please add your MongoDB URI to .env.local');
    }

    if (process.env.NODE_ENV === 'development') {
        // In development mode, use a global variable so that the value
        // is preserved across module reloads caused by HMR (Hot Module Replacement).
        if (!global._mongoClientPromise) {
            const client = new MongoClient(uri, options);
            global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
    } else {
        // In production mode, it's best to not use a global variable.
        const client = new MongoClient(uri, options);
        clientPromise = client.connect();
    }

    return clientPromise;
}