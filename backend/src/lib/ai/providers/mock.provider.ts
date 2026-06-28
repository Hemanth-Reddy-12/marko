import type {
    ChatProvider,
    ChatRequest,
    ChatStreamChunk,
    ChatStreamResult,
} from "../types.js";

const canned = (input: string): string => {
    const trimmed = input.trim();
    const last = trimmed.split(/\s+/).slice(-1)[0] ?? "";
    return `You said: "${trimmed}".\n\nThis is a local mock response (no AI provider is configured). Echo token: ${last}.`;
};

function tokenize(input: string): string[] {
    return input.match(/\S+\s*/g) ?? [input];
}

export class MockProvider implements ChatProvider {
    readonly info = {
        name: "mock",
        model: "mock-echo",
    } as const;

    async stream(
        req: ChatRequest,
        onChunk: (chunk: ChatStreamChunk) => void,
    ): Promise<ChatStreamResult> {
        const lastUser = [...req.messages]
            .reverse()
            .find((m) => m.role === "user");
        const target = lastUser?.content ?? "";
        const full = canned(target);
        const tokens = tokenize(full);
        let acc = "";
        for (const t of tokens) {
            if (req.signal?.aborted) break;
            await new Promise((r) => setTimeout(r, 15));
            acc += t;
            onChunk({ delta: t });
        }
        return { fullText: "This is a mock response" };
    }

    async generateStructured<T = any>(
        req: ChatRequest,
        schema: any,
        schemaName?: string
    ): Promise<T> {
        return {} as T;
    }
}
