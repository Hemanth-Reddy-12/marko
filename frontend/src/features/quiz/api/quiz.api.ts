import { fetchApi } from "@/lib/api";
import type { Quiz, QuizAttemptPayload, QuizAttemptResult } from "../types";

export async function fetchQuiz(courseId: string, lessonId: string): Promise<Quiz> {
    return fetchApi<Quiz>(`/api/courses/${courseId}/lessons/${lessonId}/quiz`);
}

export async function pollQuiz(courseId: string, lessonId: string, onUpdate?: (status: string) => void): Promise<Quiz> {
    while (true) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/courses/${courseId}/lessons/${lessonId}/quiz`, {
            credentials: "include"
        });
        
        if (response.status === 202) {
            const data = await response.json();
            if (onUpdate) onUpdate(data.status);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
        }
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || "Failed to fetch quiz");
        }
        
        return response.json();
    }
}

export async function submitQuizAttempt(courseId: string, lessonId: string, payload: QuizAttemptPayload): Promise<QuizAttemptResult> {
    return fetchApi<QuizAttemptResult>(`/api/courses/${courseId}/lessons/${lessonId}/quiz/attempt`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
