import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { connectDB } from "@/lib/db";
import { typeDefs } from "@/graphql/schema";
import { resolvers } from "@/graphql/resolvers";

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// Ensure database connection before handling requests
let dbConnectionPromise: Promise<unknown> | null = null;
async function ensureDbConnection(): Promise<unknown> {
    if (!dbConnectionPromise) {
        dbConnectionPromise = connectDB();
    }
    return dbConnectionPromise;
}

const handler = startServerAndCreateNextHandler(server, {
    context: async () => {
        await ensureDbConnection();
        return {};
    },
});

export { handler as GET, handler as POST };