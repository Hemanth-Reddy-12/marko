export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export async function streamChat(
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (error: string) => void,
): Promise<void> {
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const url = `${base}/chat/stream`;

    try {
        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages }),
        });

        if (!response.ok) {
            const text = await response.text();
            let errMsg = `${response.status} ${response.statusText}`;
            try {
                const parsed = JSON.parse(text);
                errMsg = parsed.error ?? JSON.stringify(parsed);
            } catch (_) {}
            onError(errMsg);
            return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
            onError("No response body");
            return;
        }

        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            onChunk(chunk);
        }

        onDone();
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        onError(message);
    }
}
