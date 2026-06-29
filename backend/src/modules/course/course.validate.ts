import { z } from "zod";

export const createCourseSchema = z.object({
    goal: z.string().min(5, "Goal must be at least 5 characters long").max(500, "Goal is too long"),
    durationDays: z.number().int().min(1, "Duration must be at least 1 day"),
});
