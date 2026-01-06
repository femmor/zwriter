import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import getMongoClient from "@/lib/mongoAdapter";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyPassword } from "@/utils/password";

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
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { 
                    label: "Email", 
                    type: "email", 
                    placeholder: "your@email.com" 
                },
                password: { 
                    label: "Password", 
                    type: "password" 
                }
            },
            async authorize(credentials) {
                
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    await connectDB();
                    
                    // Find user with password included
                    const user = await User.findOne({ 
                        email: credentials.email.toLowerCase() 
                    }).select('+password');

                    if (!user || !user.password) {
                        return null;
                    }

                    // Verify password
                    const isValidPassword = await verifyPassword(
                        credentials.password, 
                        user.password
                    );

                    if (!isValidPassword) {
                        return null;
                    }

                    // Return user object (password excluded)
                    const userObj = {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        image: user.image || null,
                        role: user.role
                    };
                    return userObj;
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
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

            return `${baseUrl}/admin`; // Default to admin dashboard
        },
        async jwt({ token, user }) {
            
            // On sign in, add user info to token
            if (user) {
                token.role = user.role;
                token.userId = user.id;
                token.email = user.email;
                token.name = user.name;
                return token;
            }
            
            // For subsequent calls, token should already have the role
            return token;
        },
        async session({ session, token }) {
            
            if (session?.user && token) {
                session.user.role = token.role || 'VIEWER';
                session.user.id = token.userId || '';
            }
            
            return session;
        }
    }
};

const authHandler = NextAuth(authOptions);

export { authHandler as GET, authHandler as POST };