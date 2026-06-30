import { z } from "zod";

export const initInterviewSchema = z.object({
    courseId: z.string(),
});
