import { generateText } from "ai";
import { openAIModel } from "./providers";
import { SEO_PROMPT } from "./prompts";

export async function generateSEO(content: string) {
  const result = await generateText({
    model: openAIModel,
    prompt: SEO_PROMPT(content),
    maxOutputTokens: 200,
  });

  return result.text;
}