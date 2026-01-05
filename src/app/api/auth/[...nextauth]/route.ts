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
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/signin',
        error: '/error',
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        },
        async jwt({ token, user }) {
            // Include role in the token when user signs in
            if (user?.role) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session }) {
            try {
                await connectDB();
                
                if (!session?.user?.email) {
                    return session;
                }

                let dbUser = await User.findOne({ email: session.user.email });

                if (!dbUser) {
                    // Create new user
                    // Check if this is the first user (make them admin)
                    const userCount = await User.countDocuments();
                    const isFirstUser = userCount === 0;
                    
                    dbUser = await User.create({
                        name: session.user.name || session.user.email,
                        email: session.user.email,
                        image: session.user.image || '',
                        role: isFirstUser ? 'ADMIN' : 'VIEWER'
                    });
                }

                session.user.role = dbUser.role || 'VIEWER';
                session.user.id = dbUser._id.toString();

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