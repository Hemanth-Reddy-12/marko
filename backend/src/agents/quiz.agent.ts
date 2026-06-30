import { runAgent } from "../lib/agent-run.js";
import { AgentType } from "../generated/prisma/index.js";
import { quizSystemPrompt, getQuizUserPrompt } from "./prompts/quiz.prompt.js";

export interface QuizInput {
    lessonTitle: string;
    lessonContent: string;
    userId?: string;
    lessonId: string;
    quizId: string;
    limit: number;
}

export interface QuizOutput {
    questions: {
        id: string;
        text: string;
        options: string[];
        correctAnswerIndex: number;
        rationale: string;
    }[];
}

const QUIZ_SCHEMA = {
    type: "object",
    properties: {
        questions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    text: { type: "string" },
                    options: {
                        type: "array",
                        items: { type: "string" },
                    },
                    correctAnswerIndex: { type: "integer" },
                    rationale: { type: "string" },
                },
                required: ["id", "text", "options", "correctAnswerIndex", "rationale"],
                additionalProperties: false,
            },
        },
    },
    required: ["questions"],
    additionalProperties: false,
};

export async function runQuizAgent(input: QuizInput): Promise<QuizOutput> {
    const context = {
        agent: AgentType.QUIZ,
        entityType: "Quiz",
        entityId: input.quizId,
        promptVersion: "1.0.0",
        ...(input.userId ? { userId: input.userId } : {}),
    };

    return runAgent<QuizOutput>(
        context,
        {
            messages: [
                { role: "system", content: quizSystemPrompt(input.limit) },
                { role: "user", content: getQuizUserPrompt(input.lessonTitle, input.lessonContent, input.limit) },
            ],
        },
        QUIZ_SCHEMA,
        "lesson_quiz"
    );
}
