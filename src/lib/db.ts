import mongoose from "mongoose";

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache | undefined;
}

// This is to prevent multiple connections in development
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    // Check for environment variable only when connection is attempted
    const MONGODB_URI = process.env.MONGODB_URI;
    
    // During build phase, return early to prevent build failures
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return {} as typeof mongoose;
    }
    
    if (!MONGODB_URI) {
        throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
    }

    if (cached?.conn) {
        return cached.conn;
    }

    if (!cached?.promise) {
        const opts = {
            bufferCommands: false,
        };
        
        cached!.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
        cached!.conn = await cached!.promise;
        return cached!.conn;
    } catch (error) {
        // Reset the promise so we can retry
        cached!.promise = null;
        throw error;
    }
}