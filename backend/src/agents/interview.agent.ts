import { runAgent } from "../lib/agent-run.js";
import { AgentType } from "../generated/prisma/index.js";
import { interviewGenerateSystemPrompt, getInterviewGenerateUserPrompt, interviewEvaluateSystemPrompt } from "./prompts/interview.prompt.js";

export interface InterviewGenerateInput {
    courseId: string;
    courseTitle: string;
    description: string | null;
    lessons: { title: string; content: string | null }[];
    userId: string;
}

export interface Milestone {
    topic: string;
    rationale: string;
}

export interface InterviewGenerateOutput {
    milestones: Milestone[];
}

const INTERVIEW_GENERATE_SCHEMA = {
    type: "object",
    properties: {
        milestones: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    topic: { type: "string" },
                    rationale: { type: "string" }
                },
                required: ["topic", "rationale"],
                additionalProperties: false
            }
        }
    },
    required: ["milestones"],
    additionalProperties: false
};

export async function generateInterviewPlan(input: InterviewGenerateInput): Promise<InterviewGenerateOutput> {
    const context = {
        agent: AgentType.INTERVIEW,
        entityType: "Course",
        entityId: input.courseId,
        promptVersion: "1.0.0",
        userId: input.userId,
    };

    return runAgent<InterviewGenerateOutput>(
        context,
        {
            messages: [
                { role: "system", content: interviewGenerateSystemPrompt },
                { role: "user", content: getInterviewGenerateUserPrompt(input.courseTitle, input.description, input.lessons) }
            ]
        },
        INTERVIEW_GENERATE_SCHEMA,
        "interview_generate"
    );
}

export interface InterviewEvaluateInput {
    courseId: string;
    userId: string;
    chatHistory: { role: "system" | "user" | "assistant"; content: string }[];
}

export interface InterviewEvaluateOutput {
    message: string;
    isComplete: boolean;
    score?: number;
    passed?: boolean;
    feedback?: string;
    strengths?: string[];
    areasOfImprovement?: string[];
    failReason?: string;
}

const INTERVIEW_EVALUATE_SCHEMA = {
    type: "object",
    properties: {
        message: { type: "string", description: "The next question or response to the user." },
        isComplete: { type: "boolean", description: "Whether the interview has concluded." },
        score: { type: "number", description: "Final score (0-100). Provide only if isComplete is true." },
        passed: { type: "boolean", description: "Whether the student passed. Provide only if isComplete is true." },
        feedback: { type: "string", description: "General feedback. Provide only if isComplete is true." },
        strengths: { type: "array", items: { type: "string" }, description: "Provide only if isComplete is true." },
        areasOfImprovement: { type: "array", items: { type: "string" }, description: "Provide only if isComplete is true." },
        failReason: { type: "string", description: "Reason for failure if passed is false. Provide only if isComplete is true." }
    },
    required: ["message", "isComplete"],
    additionalProperties: false
};

export async function evaluateInterview(input: InterviewEvaluateInput): Promise<InterviewEvaluateOutput> {
    const context = {
        agent: AgentType.INTERVIEW,
        entityType: "Course",
        entityId: input.courseId,
        promptVersion: "1.0.0",
        userId: input.userId,
    };

    const messages = [
        { role: "system", content: interviewEvaluateSystemPrompt },
        // Cast input.chatHistory so TS is happy if needed, though structure matches loosely.
        ...input.chatHistory as any[]
    ];

    return runAgent<InterviewEvaluateOutput>(
        context,
        { messages },
        INTERVIEW_EVALUATE_SCHEMA,
        "interview_evaluate"
    );
}
