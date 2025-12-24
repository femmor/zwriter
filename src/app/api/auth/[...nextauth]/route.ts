import NextAuth, { AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongoAdapter";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const authOptions: AuthOptions = {
    adapter: MongoDBAdapter(clientPromise),
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
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };