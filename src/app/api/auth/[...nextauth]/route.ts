import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import getMongoClient from "@/lib/mongoAdapter";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// Environment variable validation function
function validateEnvironmentVariables() {
    const requiredEnvVars = {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        MONGODB_URI: process.env.MONGODB_URI,
    };

    // Only validate at runtime, not during build
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
        for (const [key, value] of Object.entries(requiredEnvVars)) {
            if (!value) {
                console.warn(`Warning: Missing environment variable: ${key}`);
                // Don't throw during build, just log warning
                if (process.env.NODE_ENV === 'production') {
                    throw new Error(`Missing required environment variable: ${key}`);
                }
            }
        }
    }
}

// Call validation
validateEnvironmentVariables();

export const authOptions: AuthOptions = {
    adapter: MongoDBAdapter(getMongoClient()),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
        })
    ],
    callbacks: {
        async session({ session }) {
            try {
                await connectDB();
                
                if (!session?.user?.email) {
                    return session;
                }

                const dbUser = await User.findOne({ email: session.user.email });

                if (dbUser) {
                    session.user.role = dbUser.role || 'VIEWER';
                    session.user.id = dbUser._id.toString();
                } else {
                    session.user.role = 'VIEWER';
                    session.user.id = '';
                }

                return session;
            } catch (error) {
                console.error('Session callback error:', error);
                // Return session even if database operations fail
                return {
                    ...session,
                    user: {
                        ...session.user,
                        role: 'VIEWER',
                        id: ''
                    }
                };
            }
        }
    }
};

const authHandler = NextAuth(authOptions);

export { authHandler as GET, authHandler as POST };