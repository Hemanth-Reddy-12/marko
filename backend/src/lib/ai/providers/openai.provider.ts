import OpenAI from "openai";
import { env } from "../../../config/env.js";
import { ProviderNotConfiguredError, InvalidApiKeyError } from "../types.js";
import type {
    ChatProvider,
    ChatRequest,
    ChatStreamChunk,
    ChatStreamResult,
} from "../types.js";

export interface OpenAIProviderOptions {
    apiKey?: string;
    baseURL?: string;
    model?: string;
}

export class OpenAIProvider implements ChatProvider {
    readonly info: { name: string; model: string };
    private apiKey?: string;
    private baseURL?: string;
    private defaultModel: string;
    private client: OpenAI | null = null;

    constructor(options?: OpenAIProviderOptions) {
        this.apiKey = options?.apiKey || env.OPENAI_API_KEY;
        this.baseURL = options?.baseURL || env.OPENAI_BASE_URL;
        this.defaultModel = options?.model || env.OPENAI_MODEL || "";
        this.info = {
            name: "openai",
            model: this.defaultModel,
        };
    }

    private getClient(): OpenAI {
        if (this.client) return this.client;
        if (!this.apiKey) {
            throw new ProviderNotConfiguredError(
                "openai",
                "OPENAI_API_KEY",
            );
        }
        this.client = new OpenAI({
            apiKey: this.apiKey,
            ...(this.baseURL ? { baseURL: this.baseURL } : {}),
        });
        return this.client;
    }

    private handleError(err: any): never {
        const status = err?.status || err?.statusCode;
        const code = err?.code || err?.error?.code;
        const msg = err?.message || err?.error?.message || String(err);

        if (status === 401 || status === 403 || code === "invalid_api_key" || /invalid api key/i.test(msg) || /incorrect api key/i.test(msg)) {
            throw new InvalidApiKeyError("openai", msg);
        }
        throw err;
    }

    async listModels(): Promise<string[]> {
        try {
            const client = this.getClient();
            const response = await client.models.list();
            const models = response.data
                .map((m) => m.id)
                .filter((id): id is string => Boolean(id));
            return models;
        } catch (err: any) {
            console.error("OpenAI/OpenRouter listModels failed:", err?.message || err);
            return [];
        }
    }

    async stream(
        req: ChatRequest,
        onChunk: (chunk: ChatStreamChunk) => void,
    ): Promise<ChatStreamResult> {
        try {
            const client = this.getClient();
            const modelToUse = req.model || this.defaultModel;
            if (!modelToUse) {
                throw new Error("No model specified for OpenAI provider. Please select a model in Settings → AI Providers.");
            }

            const body: OpenAI.ChatCompletionCreateParamsStreaming = {
                model: modelToUse,
                messages: req.messages.map(
                    (m): OpenAI.ChatCompletionMessageParam => ({
                        role: m.role,
                        content: m.content,
                    }),
                ),
                stream: true,
            };
            if (req.temperature !== undefined) {
                body.temperature = req.temperature;
            }
            if (req.maxTokens !== undefined) {
                body.max_tokens = req.maxTokens;
            }

            const stream = await client.chat.completions.create(body);

            let full = "";
            for await (const part of stream) {
                if (req.signal?.aborted) break;
                const delta = part.choices?.[0]?.delta?.content ?? "";
                if (delta) {
                    full += delta;
                    onChunk({ delta });
                }
            }

            return { fullText: full };
        } catch (err: any) {
            this.handleError(err);
        }
    }

    async generateStructured<T = any>(
        req: ChatRequest,
        schema: any,
        schemaName = "output"
    ): Promise<T> {
        try {
            const client = this.getClient();
            const modelToUse = req.model || this.defaultModel;
            if (!modelToUse) {
                throw new Error("No model specified for OpenAI provider. Please select a model in Settings → AI Providers.");
            }
            
            const messages = [...req.messages];
            const schemaInstruction = `\n\nYou MUST return your response as a valid JSON object matching this JSON Schema:\n${JSON.stringify(schema, null, 2)}`;
            
            const firstSystemMessageIndex = messages.findIndex(m => m.role === "system");
            if (firstSystemMessageIndex >= 0) {
                const systemMessage = messages[firstSystemMessageIndex]!;
                messages[firstSystemMessageIndex] = {
                    role: systemMessage.role,
                    content: systemMessage.content + schemaInstruction
                };
            } else {
                messages.unshift({ role: "system", content: schemaInstruction });
            }

            const body: OpenAI.ChatCompletionCreateParamsNonStreaming = {
                model: modelToUse,
                messages: messages.map(
                    (m): OpenAI.ChatCompletionMessageParam => ({
                        role: m.role,
                        content: m.content,
                    }),
                ),
                response_format: { type: "json_object" },
            };
            if (req.temperature !== undefined) {
                body.temperature = req.temperature;
            }
            if (req.maxTokens !== undefined) {
                body.max_tokens = req.maxTokens;
            }

            const completion = await client.chat.completions.create(body);
            const content = completion.choices[0]?.message?.content;
            
            if (!content) {
                throw new Error("No content returned from OpenAI");
            }
            
            return JSON.parse(content) as T;
        } catch (err: any) {
            this.handleError(err);
        }
    }
}
