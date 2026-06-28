import OpenAI from "openai";
import { env } from "../../../config/env.js";
import {
    ProviderNotConfiguredError,
} from "../types.js";
import type {
    ChatProvider,
    ChatRequest,
    ChatStreamChunk,
    ChatStreamResult,
} from "../types.js";

export class OpenAIProvider implements ChatProvider {
    readonly info = {
        name: "openai",
        model: env.OPENAI_MODEL,
    } as const;

    private client: OpenAI | null = null;

    private getClient(): OpenAI {
        if (this.client) return this.client;
        const apiKey = env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new ProviderNotConfiguredError(
                "openai",
                "OPENAI_API_KEY",
            );
        }
        this.client = new OpenAI({
            apiKey,
            ...(env.OPENAI_BASE_URL
                ? { baseURL: env.OPENAI_BASE_URL }
                : {}),
        });
        return this.client;
    }

    async stream(
        req: ChatRequest,
        onChunk: (chunk: ChatStreamChunk) => void,
    ): Promise<ChatStreamResult> {
        const client = this.getClient();
        const body: OpenAI.ChatCompletionCreateParamsStreaming = {
            model: req.model ?? env.OPENAI_MODEL,
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
            const delta =
                part.choices?.[0]?.delta?.content ?? "";
            if (delta) {
                full += delta;
                onChunk({ delta });
            }
        }

        return { fullText: full };
    }

    async generateStructured<T = any>(
        req: ChatRequest,
        schema: any,
        schemaName = "output"
    ): Promise<T> {
        const client = this.getClient();
        const body: OpenAI.ChatCompletionCreateParamsNonStreaming = {
            model: req.model ?? env.OPENAI_MODEL,
            messages: req.messages.map(
                (m): OpenAI.ChatCompletionMessageParam => ({
                    role: m.role,
                    content: m.content,
                }),
            ),
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: schemaName,
                    strict: true,
                    schema: schema,
                },
            },
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
    }
}
