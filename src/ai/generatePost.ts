import { generateText } from "ai";
import { openAIModel } from "./providers";
import { POST_GENERATION_PROMPT } from "./prompts";

export async function generatePostDraft(topic: string) {
  const result = await generateText({
    model: openAIModel,
    prompt: POST_GENERATION_PROMPT(topic),
    maxOutputTokens: 800,
  });

  return result.text;
}