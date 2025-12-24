export const ENV = {
    MONGODB_URI: process.env.MONGODB_URI || "",
}

// Validate required environment variables at module load
if (!ENV.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}