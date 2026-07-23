import { getChatProvider } from "../lib/ai/index.js";
import type { ChatMessage } from "../lib/ai/types.js";
import { tutorSystemPrompt, getTutorUserPrompt } from "./prompts/tutor.prompt.js";

export interface StreamTutorTurnInput {
    userId: string;
    courseTitle: string;
    courseDescription?: string | null;
    lessonTitle?: string | null;
    lessonContent?: string | null;
    chatHistory: { role: "user" | "assistant" | "system"; content: string }[];
    userQuery: string;
}

export async function streamTutorTurn(
    input: StreamTutorTurnInput,
    onChunk: (chunk: { delta: string }) => void
): Promise<string> {
    const provider = await getChatProvider(input.userId);

    const messages: ChatMessage[] = [
        { role: "system", content: tutorSystemPrompt },
        ...input.chatHistory.map((m) => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
        })),
        {
            role: "user",
            content: getTutorUserPrompt(
                input.courseTitle,
                input.courseDescription,
                input.lessonTitle,
                input.lessonContent,
                input.userQuery
            ),
        },
    ];

    const result = await provider.stream(
        {
            messages,
        },
        onChunk
    );

    return result.fullText;
}
