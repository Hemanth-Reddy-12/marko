export interface LessonResponse {
    id: string;
    title: string;
    order: number;
    status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
    generationStatus: "NOT_GENERATED" | "GENERATING" | "GENERATED" | "FAILED";
    content: string | null;
    courseId: string;
    createdAt: Date;
    updatedAt: Date;
}
