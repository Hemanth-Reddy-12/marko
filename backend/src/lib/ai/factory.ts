import type { ChatProvider } from "./types.js";
import { env } from "../../config/env.js";
import { OpenAIProvider } from "./providers/openai.provider.js";
import { GeminiProvider } from "./providers/gemini.provider.js";
import { MockProvider } from "./providers/mock.provider.js";

let cached: ChatProvider | null = null;

export function getChatProvider(): ChatProvider {
    if (cached) return cached;
    switch (env.AI_PROVIDER) {
        case "openai":
            cached = new OpenAIProvider();
            break;
        case "gemini":
            cached = new GeminiProvider();
            break;
        case "mock":
            cached = new MockProvider();
            break;
    }
    return cached;
}

export function resetChatProviderCache(): void {
    cached = null;
}
