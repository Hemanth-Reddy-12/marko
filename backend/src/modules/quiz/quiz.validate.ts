import { z } from "zod";
import { QuizAttemptPayloadSchema } from "./quiz.types.js";

export const attemptQuizSchema = z.object({
    body: QuizAttemptPayloadSchema,
});
