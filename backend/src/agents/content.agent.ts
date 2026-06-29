import { runAgent } from "../lib/agent-run.js";
import { AgentType } from "../generated/prisma/index.js";
import { contentSystemPrompt, getContentUserPrompt } from "./prompts/content.prompt.js";

export interface ContentInput {
    courseGoal: string;
    lessonTitle: string;
    lessonOrder: number;
    userId?: string;
    courseId: string;
    lessonId: string;
}

export interface ContentOutput {
    content: string;
}

const CONTENT_SCHEMA = {
    type: "object",
    properties: {
        content: {
            type: "string",
            description: "The comprehensive markdown-formatted lesson content",
        },
    },
    required: ["content"],
    additionalProperties: false,
};

export async function runContentAgent(input: ContentInput): Promise<ContentOutput> {
    const context = {
        agent: AgentType.CONTENT,
        entityType: "Lesson",
        entityId: input.lessonId,
        promptVersion: "1.0.0",
        ...(input.userId ? { userId: input.userId } : {}),
    };

    return runAgent<ContentOutput>(
        context,
        {
            messages: [
                { role: "system", content: contentSystemPrompt },
                { role: "user", content: getContentUserPrompt(input.courseGoal, input.lessonTitle, input.lessonOrder) },
            ],
        },
        CONTENT_SCHEMA,
        "lesson_content"
    );
}
