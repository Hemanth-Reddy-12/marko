import { fetchApi } from "@/lib/api";
import type { LessonResponse } from "../types";

export const fetchLesson = async (courseId: string, lessonId: string): Promise<LessonResponse> => {
    return fetchApi<LessonResponse>(`/api/courses/${courseId}/lessons/${lessonId}`);
};

export const pollLesson = async (
    courseId: string, 
    lessonId: string, 
    onProgress?: (status: string) => void
): Promise<LessonResponse> => {
    let delay = 3000;
    
    while (true) {
        try {
            // Using fetch directly to catch 202 without throwing
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/courses/${courseId}/lessons/${lessonId}`, {
                credentials: "include"
            });

            if (response.status === 202) {
                const data = await response.json();
                if (onProgress) onProgress(data.status);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay = Math.min(delay * 1.2, 5000); // Exponential backoff up to 5s
                continue;
            }
            
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to fetch lesson");
            }
            
            return response.json();
        } catch (error) {
            throw error;
        }
    }
};
