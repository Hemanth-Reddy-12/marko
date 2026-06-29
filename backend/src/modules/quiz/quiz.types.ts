import { z } from "zod";

export const QuestionSchema = z.object({
    id: z.string(),
    text: z.string(),
    options: z.array(z.string()),
    correctAnswerIndex: z.number().int(),
    rationale: z.string(),
});

export type Question = z.infer<typeof QuestionSchema>;

export const QuizAttemptPayloadSchema = z.object({
    answers: z.array(z.number().int()),
});

export type QuizAttemptPayload = z.infer<typeof QuizAttemptPayloadSchema>;
