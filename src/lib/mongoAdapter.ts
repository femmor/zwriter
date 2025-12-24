import { MongoClient } from 'mongodb';

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {};

let clientPromise: Promise<MongoClient> | null = null;

export default function getMongoClient(): Promise<MongoClient> {
    if (clientPromise) {
        return clientPromise;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('Please add your MongoDB URI to .env.local');
    }

    if (process.env.NODE_ENV === 'development') {
        if (!global._mongoClientPromise) {
            const client = new MongoClient(uri, options);
            global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
    } else {
        const client = new MongoClient(uri, options);
        clientPromise = client.connect();
    }

    return clientPromise;
}