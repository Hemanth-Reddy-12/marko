import { runAgent } from "../lib/agent-run.js";
import { AgentType } from "../generated/prisma/index.js";
import { plannerSystemPrompt, getPlannerUserPrompt } from "./prompts/planner.prompt.js";

export interface PlannerInput {
    goal: string;
    durationDays: number;
    userId?: string;
    courseId: string;
}

export interface PlannedLesson {
    title: string;
    order: number;
    weight: "light" | "medium" | "heavy";
}

export interface PlannerOutput {
    title: string;
    description: string;
    lessons: PlannedLesson[];
}

const PLANNER_SCHEMA = {
    type: "object",
    properties: {
        title: {
            type: "string",
            description: "The clear, concise title of the course",
        },
        description: {
            type: "string",
            description: "A summary of what the course covers and its objectives",
        },
        lessons: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: {
                        type: "string",
                        description: "The specific title/topic of this lesson",
                    },
                    order: {
                        type: "integer",
                        description: "The sequential 1-indexed order of this lesson",
                    },
                    weight: {
                        type: "string",
                        enum: ["light", "medium", "heavy"],
                        description: "The complexity/importance weight of the lesson (light = basics/introduction, medium = core standard topics, heavy = advanced/comprehensive/capstone topics)",
                    },
                },
                required: ["title", "order", "weight"],
                additionalProperties: false,
            },
            description: "The list of lessons in chronological order",
        },
    },
    required: ["title", "description", "lessons"],
    additionalProperties: false,
};

export async function runPlannerAgent(input: PlannerInput): Promise<PlannerOutput> {
    const context: {
        agent: AgentType;
        entityType: string;
        entityId: string;
        promptVersion: string;
        userId?: string;
    } = {
        agent: AgentType.PLANNER,
        entityType: "Course",
        entityId: input.courseId,
        promptVersion: "1.0.0",
    };
    
    if (input.userId) {
        context.userId = input.userId;
    }

    return runAgent<PlannerOutput>(
        context,
        {
            messages: [
                { role: "system", content: plannerSystemPrompt },
                { role: "user", content: getPlannerUserPrompt(input.goal, input.durationDays) },
            ],
        },
        PLANNER_SCHEMA,
        "course_planner"
    );
}
