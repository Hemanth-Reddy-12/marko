import type { ChatProvider } from "./types.js";
import { env } from "../../config/env.js";
import { OpenAIProvider } from "./providers/openai.provider.js";
import { GeminiProvider } from "./providers/gemini.provider.js";
import { AnthropicProvider } from "./providers/anthropic.provider.js";
import { MockProvider } from "./providers/mock.provider.js";
import { ProviderNotConfiguredError, InvalidApiKeyError } from "./types.js";
import { decryptKey } from "../crypto.js";
import prisma from "../../config/db.js";

let cached: ChatProvider | null = null;

export function createProviderInstance(
    providerType: string,
    options?: { apiKey?: string; baseURL?: string; model?: string }
): ChatProvider {
    switch (providerType) {
        case "openai":
            return new OpenAIProvider(options);
        case "gemini":
            return new GeminiProvider(options);
        case "anthropic":
            return new AnthropicProvider(options);
        case "mock":
            return new MockProvider();
        default:
            return new GeminiProvider(options);
    }
}

export async function getChatProvider(userId?: string): Promise<ChatProvider> {
    if (userId) {
        try {
            const userConfig = await prisma.aiProviderConfig.findUnique({
                where: { userId },
            });

            if (userConfig && userConfig.activeProvider && userConfig.activeModel) {
                const providerType = userConfig.activeProvider;
                const model = userConfig.activeModel;
                let apiKey: string | undefined;
                let baseURL: string | undefined;

                if (providerType === "gemini") {
                    // Decrypt stored key, fall back to env
                    apiKey = decryptKey(userConfig.geminiApiKey) || env.GEMINI_API_KEY;
                } else if (providerType === "openai") {
                    apiKey = decryptKey(userConfig.openaiApiKey) || env.OPENAI_API_KEY;
                    baseURL = userConfig.openaiBaseUrl || env.OPENAI_BASE_URL;
                } else if (providerType === "anthropic") {
                    apiKey = decryptKey(userConfig.anthropicApiKey) || undefined;
                    baseURL = userConfig.anthropicBaseUrl || undefined;
                } else if (providerType === "mock") {
                    return createProviderInstance("mock");
                }

                if (!apiKey && providerType !== "mock") {
                    throw new ProviderNotConfiguredError(
                        providerType,
                        `No API key configured for ${providerType}. Add your key in Settings → AI Providers.`
                    );
                }

                const opts: { apiKey?: string; baseURL?: string; model?: string } = {};
                if (apiKey) opts.apiKey = apiKey;
                if (baseURL) opts.baseURL = baseURL;
                if (model) opts.model = model;
                return createProviderInstance(providerType, opts);
            }
        } catch (err: any) {
            console.error("[AI] User provider config error:", err?.message || err);
            if (err instanceof ProviderNotConfiguredError || err instanceof InvalidApiKeyError) {
                throw err;
            }
        }
    }

    if (cached) return cached;
    cached = createProviderInstance(env.AI_PROVIDER);
    return cached;
}

export function resetChatProviderCache(): void {
    cached = null;
}
