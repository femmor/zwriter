import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import getMongoClient from "@/lib/mongoAdapter";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getUserRoleFromCache, setUserRoleInCache } from "@/lib/cache";

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
            try {
                if (new URL(url).origin === new URL(baseUrl).origin) return url
            } catch (error) {
                console.error('Redirect URL error:', error);
            }

            return baseUrl;
        },
        async jwt({ token, user }) {
            // Include role in the token when user signs in
            if (user?.role) {
                token.role = user.role;
            }
            
            // If no role in token but we have user email, check cache first, then database
            if (!token.role && token.email) {
                try {
                    // First, try to get role from cache
                    const cachedUserData = getUserRoleFromCache(token.email);
                    
                    if (cachedUserData) {
                        // Use cached data
                        token.role = cachedUserData.role;
                        token.userId = cachedUserData.userId;
                    } else {
                        // Cache miss - fetch from database
                        await connectDB();
                        const dbUser = await User.findOne({ email: token.email });
                        
                        if (dbUser) {
                            const role = dbUser.role || 'VIEWER';
                            const userId = dbUser._id.toString();
                            
                            // Update token
                            token.role = role;
                            token.userId = userId;
                            
                            // Cache the result
                            setUserRoleInCache(token.email, role, userId);
                        } else {
                            // User not found in database
                            token.role = 'VIEWER';
                        }
                    }
                } catch (error) {
                    console.error(
                        `JWT callback error while fetching user role from database for email: ${token.email ?? 'unknown'}`,
                        error)
                    token.role = 'VIEWER';
                }
            }
            
            return token;
        },
        async session({ session }) {
            try {
                if (!session?.user?.email) {
                    return session;
                }

                // Try cache first
                const cachedUserData = getUserRoleFromCache(session.user.email);
                
                if (cachedUserData) {
                    // Use cached data
                    session.user.role = cachedUserData.role;
                    session.user.id = cachedUserData.userId;
                    return session;
                }

                // Cache miss - fetch from database
                await connectDB();
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

                const role = dbUser.role || 'VIEWER';
                const userId = dbUser._id.toString();

                // Cache the result
                setUserRoleInCache(session.user.email, role, userId);

                session.user.role = role;
                session.user.id = userId;

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