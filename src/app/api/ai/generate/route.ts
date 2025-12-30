/* 
    A dedicated AI route handler for streaming responses
*/

import { streamText } from "ai";
import { openAIModel } from "@/ai/providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request): Promise<Response> {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role === "VIEWER") {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const { prompt } = await req.json();

        const result = await streamText({
            model: openAIModel,
            prompt,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Error in AI generate route:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}