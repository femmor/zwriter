import NextAuth, { AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import getMongoClient from "@/lib/mongoAdapter";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const authOptions: AuthOptions = {
    adapter: MongoDBAdapter(getMongoClient()),
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!
        })
    ],
    callbacks: {
        async session({ session }) {
            await connectDB();
            
            if (!session?.user?.email) {
                return session;
            }

            const dbUser = await User.findOne({ email: session.user.email });

            session.user.role = dbUser?.role || 'VIEWER';
            session.user.id = dbUser?._id.toString() || '';

            return session;
        }
    }
};
const authHandler = NextAuth(authOptions);

export { authHandler as GET, authHandler as POST };