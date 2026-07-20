import { fetchApi } from "../../../lib/api";

export interface InitInterviewParams {
    courseId: string;
}

export interface InitInterviewResponse {
    sessionId: string;
    milestones: { topic: string; rationale: string }[];
}

export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
    createdAt?: string;
}

export interface SessionMessagesResponse {
    messages: ChatMessage[];
    isComplete: boolean;
    score: number | null;
    passed: boolean | null;
    feedbackData: any | null;
}

export interface SendMessageResponse {
    userMessage: ChatMessage;
    assistantMessage?: ChatMessage;
    isComplete: boolean;
    score?: number | null;
    passed?: boolean | null;
    feedbackData?: any | null;
}

export async function initInterview(params: InitInterviewParams): Promise<InitInterviewResponse> {
    return fetchApi<InitInterviewResponse>("/api/interviews", {
        method: "POST",
        body: JSON.stringify(params),
    });
}

export async function getSessionMessages(sessionId: string): Promise<SessionMessagesResponse> {
    return fetchApi<SessionMessagesResponse>(`/api/interviews/sessions/${sessionId}/messages`, {
        method: "GET",
    });
}

export async function sendSessionMessage(sessionId: string, content: string): Promise<SendMessageResponse> {
    return fetchApi<SendMessageResponse>(`/api/interviews/sessions/${sessionId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
    });
}
