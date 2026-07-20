import {
    ProviderNotConfiguredError,
    InvalidApiKeyError,
} from "../types.js";
import type {
    ChatProvider,
    ChatRequest,
    ChatStreamChunk,
    ChatStreamResult,
} from "../types.js";

export interface AnthropicProviderOptions {
    apiKey?: string;
    baseURL?: string;
    model?: string;
}

export class AnthropicProvider implements ChatProvider {
    readonly info: { name: string; model: string };
    private apiKey?: string;
    private baseURL?: string;
    private defaultModel: string;

    constructor(options?: AnthropicProviderOptions) {
        this.apiKey = options?.apiKey || process.env.ANTHROPIC_API_KEY;
        this.baseURL = options?.baseURL || process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
        this.defaultModel = options?.model || process.env.ANTHROPIC_MODEL || "";
        this.info = {
            name: "anthropic",
            model: this.defaultModel,
        };
    }

    async listModels(): Promise<string[]> {
        const apiKey = this.apiKey;
        if (!apiKey) return [];
        try {
            const endpoint = `${this.baseURL.replace(/\/+$/, "")}/v1/models`;
            const res = await fetch(endpoint, {
                headers: {
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                },
            });
            if (res.ok) {
                const data = await res.json();
                if (data.data && Array.isArray(data.data)) {
                    return data.data.map((m: any) => m.id);
                }
            }
        } catch (err: any) {
            console.error("Anthropic listModels failed:", err?.message || err);
        }
        return [];
    }

    private getApiKey(): string {
        if (!this.apiKey) {
            throw new ProviderNotConfiguredError("anthropic", "ANTHROPIC_API_KEY");
        }
        return this.apiKey;
    }

    async stream(
        req: ChatRequest,
        onChunk: (chunk: ChatStreamChunk) => void,
    ): Promise<ChatStreamResult> {
        const apiKey = this.getApiKey();
        const modelName = req.model || this.defaultModel;
        if (!modelName) {
            throw new Error("No model specified for Anthropic provider. Please select a model in Settings → AI Providers.");
        }

        const systemMessage = req.messages.find((m) => m.role === "system")?.content;
        const userAndAssistantMessages = req.messages
            .filter((m) => m.role !== "system")
            .map((m) => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: m.content,
            }));

        const body: Record<string, any> = {
            model: modelName,
            messages: userAndAssistantMessages,
            max_tokens: req.maxTokens || 4096,
            stream: true,
        };

        if (systemMessage) {
            body.system = systemMessage;
        }
        if (req.temperature !== undefined) {
            body.temperature = req.temperature;
        }

        const endpoint = `${this.baseURL.replace(/\/+$/, "")}/v1/messages`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 401 || response.status === 403 || /authentication_error|invalid x-api-key/i.test(errorText)) {
                throw new InvalidApiKeyError("anthropic", errorText);
            }
            throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
        }

        if (!response.body) {
            throw new Error("No response body returned from Anthropic");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        while (true) {
            if (req.signal?.aborted) break;
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const dataStr = line.slice(6).trim();
                    if (!dataStr || dataStr === "[DONE]") continue;
                    try {
                        const parsed = JSON.parse(dataStr);
                        if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                            const delta = parsed.delta.text;
                            fullText += delta;
                            onChunk({ delta });
                        }
                    } catch {
                        // ignore unparseable stream chunks
                    }
                }
            }
        }

        return { fullText };
    }

    async generateStructured<T = any>(
        req: ChatRequest,
        schema: any,
        schemaName = "output"
    ): Promise<T> {
        const apiKey = this.getApiKey();
        const modelName = req.model || this.defaultModel;
        if (!modelName) {
            throw new Error("No model specified for Anthropic provider. Please select a model in Settings → AI Providers.");
        }

        const schemaInstruction = `\n\nCRITICAL: You MUST respond with ONLY valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`;
        
        const messages = req.messages.map((m) => ({ ...m }));
        const firstSys = messages.find((m) => m.role === "system");
        if (firstSys) {
            firstSys.content += schemaInstruction;
        } else {
            messages.unshift({ role: "system", content: schemaInstruction });
        }

        const systemMessage = messages.find((m) => m.role === "system")?.content;
        const userAndAssistantMessages = messages
            .filter((m) => m.role !== "system")
            .map((m) => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: m.content,
            }));

        const body: Record<string, any> = {
            model: modelName,
            messages: userAndAssistantMessages,
            max_tokens: req.maxTokens || 4096,
        };

        if (systemMessage) {
            body.system = systemMessage;
        }
        if (req.temperature !== undefined) {
            body.temperature = req.temperature;
        }

        const endpoint = `${this.baseURL.replace(/\/+$/, "")}/v1/messages`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 401 || response.status === 403 || /authentication_error|invalid x-api-key/i.test(errorText)) {
                throw new InvalidApiKeyError("anthropic", errorText);
            }
            throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const content = data.content?.[0]?.text;

        if (!content) {
            throw new Error("No content returned from Anthropic");
        }

        // Clean JSON markdown blocks if present
        const jsonText = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
        return JSON.parse(jsonText) as T;
    }
}
