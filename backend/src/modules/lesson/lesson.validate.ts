import { z } from "zod";

export const getLessonParamsSchema = z.object({
    courseId: z.string(),
    lessonId: z.string(),
});
