import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";
import { env } from "../../../config/env.js";
import { ProviderNotConfiguredError } from "../types.js";
import type {
    ChatProvider,
    ChatRequest,
    ChatStreamChunk,
    ChatStreamResult,
} from "../types.js";

export class GeminiProvider implements ChatProvider {
    readonly info = {
        name: "gemini",
        model: env.GEMINI_MODEL,
    } as const;

    private client: GoogleGenerativeAI | null = null;

    private getClient(): GoogleGenerativeAI {
        if (this.client) return this.client;
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new ProviderNotConfiguredError("gemini", "GEMINI_API_KEY");
        }
        this.client = new GoogleGenerativeAI(apiKey);
        return this.client;
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
        const client = this.getClient();
        const modelName = req.model ?? env.GEMINI_MODEL;

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
    }

    async generateStructured<T = any>(
        req: ChatRequest,
        schema: any, // JSON schema
        schemaName = "output"
    ): Promise<T> {
        const client = this.getClient();
        const modelName = req.model ?? env.GEMINI_MODEL;

        const { history, systemInstruction } = this.formatMessages(req.messages);

        const generationConfig: Record<string, any> = {
            responseMimeType: "application/json",
            responseSchema: schema as Schema,
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
    }
}
