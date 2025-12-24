import NextAuth, { AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import getMongoClient from "@/lib/mongoAdapter";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// Environment variable validation
const requiredEnvVars = {
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
};

// Only validate in production or when not in build mode
const shouldValidateEnv = process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE !== 'phase-production-build';

if (shouldValidateEnv) {
    for (const [key, value] of Object.entries(requiredEnvVars)) {
        if (!value) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    }
}

export const authOptions: AuthOptions = {
    adapter: MongoDBAdapter(getMongoClient()),
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID || 'placeholder',
            clientSecret: process.env.GITHUB_SECRET || 'placeholder'
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