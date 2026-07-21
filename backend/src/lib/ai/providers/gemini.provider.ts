import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";
import { env } from "../../../config/env.js";
import { ProviderNotConfiguredError, InvalidApiKeyError } from "../types.js";
import type {
    ChatProvider,
    ChatRequest,
    ChatStreamChunk,
    ChatStreamResult,
} from "../types.js";

export interface GeminiProviderOptions {
    apiKey?: string;
    model?: string;
}

export class GeminiProvider implements ChatProvider {
    readonly info: { name: string; model: string };
    private apiKey?: string;
    private defaultModel: string;
    private client: GoogleGenerativeAI | null = null;

    constructor(options?: GeminiProviderOptions) {
        this.apiKey = options?.apiKey || env.GEMINI_API_KEY;
        this.defaultModel = options?.model || env.GEMINI_MODEL || "";
        this.info = {
            name: "gemini",
            model: this.defaultModel,
        };
    }

    private getClient(): GoogleGenerativeAI {
        if (this.client) return this.client;
        if (!this.apiKey) {
            throw new ProviderNotConfiguredError("gemini", "GEMINI_API_KEY");
        }
        this.client = new GoogleGenerativeAI(this.apiKey);
        return this.client;
    }

    private handleError(err: any): never {
        const msg = err?.message || String(err);
        if (/api_key_invalid/i.test(msg) || /invalid api key/i.test(msg) || /API key not valid/i.test(msg) || err?.status === 400 || err?.status === 401 || err?.status === 403) {
            if (/API key/i.test(msg)) {
                throw new InvalidApiKeyError("gemini", msg);
            }
        }
        throw err;
    }

    async listModels(): Promise<string[]> {
        if (!this.apiKey) return [];
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
            if (!res.ok) return [];
            const data: any = await res.json();
            if (data.models && Array.isArray(data.models)) {
                return data.models
                    .map((m: any) => (m.name ? m.name.replace(/^models\//, "") : ""))
                    .filter((name: string) => Boolean(name) && name.startsWith("gemini"));
            }
        } catch (err: any) {
            console.error("Gemini listModels failed:", err?.message || err);
        }
        return [];
    }

    private formatMessages(messages: ChatRequest["messages"]) {
        const history = [];
        let systemInstruction = "";

        for (const msg of messages) {
            if (msg.role === "system") {
                systemInstruction += msg.content + "\n";
            } else if (msg.role === "user") {
                history.push({ role: "user", parts: [{ text: msg.content }] });
            } else {
                history.push({ role: "model", parts: [{ text: msg.content }] });
            }
        }
        return { history, systemInstruction };
    }

    async stream(
        req: ChatRequest,
        onChunk: (chunk: ChatStreamChunk) => void,
    ): Promise<ChatStreamResult> {
        try {
            const client = this.getClient();
            const modelName = req.model || this.defaultModel;
            if (!modelName) {
                throw new Error("No model specified for Gemini provider. Please select a model in Settings → AI Providers.");
            }

            const { history, systemInstruction } = this.formatMessages(req.messages);

            const generationConfig: Record<string, any> = {};
            if (req.temperature !== undefined) generationConfig.temperature = req.temperature;
            if (req.maxTokens !== undefined) generationConfig.maxOutputTokens = req.maxTokens;

            const modelParams: Record<string, any> = {
                model: modelName,
                generationConfig,
            };
            if (systemInstruction) modelParams.systemInstruction = systemInstruction;

            const model = client.getGenerativeModel(modelParams as any);

            const chat = model.startChat({ history: history.slice(0, -1) });
            const lastMessage = history[history.length - 1]?.parts[0]?.text || "";

            const result = await chat.sendMessageStream(lastMessage);

            let full = "";
            for await (const chunk of result.stream) {
                if (req.signal?.aborted) break;
                const delta = chunk.text();
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

    private stripAdditionalProperties(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map(item => this.stripAdditionalProperties(item));
        } else if (obj !== null && typeof obj === 'object') {
            const newObj: any = {};
            for (const key in obj) {
                if (key !== 'additionalProperties') {
                    newObj[key] = this.stripAdditionalProperties(obj[key]);
                }
            }
            return newObj;
        }
        return obj;
    }

    async generateStructured<T = any>(
        req: ChatRequest,
        schema: any, // JSON schema
        schemaName = "output"
    ): Promise<T> {
        try {
            const client = this.getClient();
            const modelName = req.model || this.defaultModel;
            if (!modelName) {
                throw new Error("No model specified for Gemini provider. Please select a model in Settings → AI Providers.");
            }

            const { history, systemInstruction } = this.formatMessages(req.messages);

            const cleanSchema = this.stripAdditionalProperties(schema);

            const generationConfig: Record<string, any> = {
                responseMimeType: "application/json",
                responseSchema: cleanSchema as Schema,
            };
            if (req.temperature !== undefined) generationConfig.temperature = req.temperature;
            if (req.maxTokens !== undefined) generationConfig.maxOutputTokens = req.maxTokens;

            const modelParams: Record<string, any> = {
                model: modelName,
                generationConfig,
            };
            if (systemInstruction) modelParams.systemInstruction = systemInstruction;

            const model = client.getGenerativeModel(modelParams as any);

            const chat = model.startChat({ history: history.slice(0, -1) });
            const lastMessage = history[history.length - 1]?.parts[0]?.text || "";

            const result = await chat.sendMessage(lastMessage);
            const text = result.response.text();

            if (!text) {
                throw new Error("No content returned from Gemini");
            }

            return JSON.parse(text) as T;
        } catch (err: any) {
            this.handleError(err);
        }
    }
}
