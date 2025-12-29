import { generateText } from "ai";
import { openAIModel } from "./providers";

export async function rewritePost(content: string, tone: "formal" | "casual") {
  const result = await generateText({
    model: openAIModel,
    prompt: `Rewrite the following content in a ${tone} tone: ${content}`,
    maxOutputTokens: 600,
  });

  return result.text;
}