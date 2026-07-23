import { fetchApi } from "../../../lib/api";

export interface TutorMessage {
    id?: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt?: string;
}

export interface TutorSession {
    id: string;
    title?: string;
    courseId?: string;
    messages: TutorMessage[];
}

export async function fetchTutorSession(courseId: string): Promise<{ session: TutorSession }> {
    return fetchApi<{ session: TutorSession }>(`/api/chat/tutor/${courseId}`);
}

export async function clearTutorHistory(courseId: string): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/api/chat/tutor/${courseId}`, {
        method: "DELETE",
    });
}
