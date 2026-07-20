export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
    role: ChatRole;
    content: string;
}

export interface ChatRequest {
    messages: ChatMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    signal?: AbortSignal;
}

export interface ChatStreamChunk {
    delta: string;
}

export interface ChatStreamResult {
    fullText: string;
}

export interface ChatProviderInfo {
    name: string;
    model: string;
}

export interface ChatProvider {
    readonly info: ChatProviderInfo;
    stream(
        req: ChatRequest,
        onChunk: (chunk: ChatStreamChunk) => void,
    ): Promise<ChatStreamResult>;
    generateStructured<T = any>(
        req: ChatRequest,
        schema: any, // JSON schema object
        schemaName?: string,
    ): Promise<T>;
}

export class ProviderNotConfiguredError extends Error {
    constructor(provider: string, missing: string) {
        super(
            `AI provider "${provider}" is not configured: missing ${missing}`,
        );
        this.name = "ProviderNotConfiguredError";
    }
}

export class InvalidApiKeyError extends Error {
    constructor(provider: string, details?: string) {
        super(
            `Invalid API key for AI provider "${provider}". Please update your API key in Settings → AI Providers.${details ? ` (${details})` : ""}`,
        );
        this.name = "InvalidApiKeyError";
    }
}
