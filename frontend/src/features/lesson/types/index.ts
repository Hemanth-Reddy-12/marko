export interface Lesson {
    id: string;
    title: string;
    order: number;
    status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
    generationStatus: "NOT_GENERATED" | "GENERATING" | "GENERATED" | "FAILED";
    content: string | null;
    courseId: string;
    createdAt: string;
    updatedAt: string;
}

export interface LessonResponse extends Lesson {}
