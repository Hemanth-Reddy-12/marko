import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { initInterviewSchema } from "./chat.validate.js";
import { generateInterviewPlan, evaluateInterview, type Milestone } from "../../agents/interview.agent.js";
import { CourseStatus, ChatSessionType } from "../../generated/prisma/index.js";

const runInterviewTurn = async (sessionId: string, userId: string) => {
    if (!userId) throw new Error("Unauthorized");
    const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
    });
    if (!session) throw new Error("Session not found");

    const interview = await prisma.interview.findFirst({
        where: { userId },
        include: { course: true },
    });
    if (!interview) throw new Error("Interview not found");

    // If already complete, return status
    if (interview.passed !== null) {
        return {
            isComplete: true,
            score: interview.score,
            passed: interview.passed,
            feedbackData: interview.feedback,
        };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
    });

    const chatHistory = messages.map(m => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
    }));

    const milestones = (interview.transcript ?? []) as unknown as Milestone[];

    const aiResponse = await evaluateInterview({
        courseId: interview.courseId,
        userId,
        studentName: user.name,
        courseTitle: interview.course.title,
        courseDescription: interview.course.description,
        chatHistory,
        milestones,
    });

    const assistantMsg = await prisma.chatMessage.create({
        data: {
            sessionId,
            role: "assistant",
            content: aiResponse.message,
        },
    });

    if (aiResponse.isComplete) {
        const feedbackData = {
            feedback: aiResponse.feedback ?? null,
            strengths: aiResponse.strengths ?? [],
            areasOfImprovement: aiResponse.areasOfImprovement ?? [],
            failReason: aiResponse.failReason ?? null,
        };

        const feedbackJson = JSON.parse(JSON.stringify(feedbackData));

        await prisma.interview.update({
            where: { id: interview.id },
            data: {
                score: aiResponse.score ?? null,
                passed: aiResponse.passed ?? null,
                feedback: feedbackJson,
            }
        });

        await prisma.course.updateMany({
            where: { id: interview.courseId },
            data: { status: CourseStatus.COMPLETED },
        }).catch(err => console.error("Failed to mark course COMPLETED:", err));

        return {
            assistantMessage: assistantMsg,
            isComplete: true,
            score: aiResponse.score,
            passed: aiResponse.passed,
            feedbackData,
        };
    }

    return {
        assistantMessage: assistantMsg,
        isComplete: false,
    };
};

export const initInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const bodyParse = initInterviewSchema.safeParse(req.body);
        if (!bodyParse.success) {
            res.status(400).json({ error: bodyParse.error.message });
            return;
        }

        const { courseId } = bodyParse.data;

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { lessons: true }
        });

        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }

        if (course.userId !== userId) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }

        const plan = await generateInterviewPlan({
            courseId: course.id,
            courseTitle: course.title,
            description: course.description,
            lessons: course.lessons.map(l => ({ title: l.title, content: l.content })),
            userId,
        });

        let interview = await prisma.interview.findUnique({ where: { courseId } });
        if (!interview) {
            interview = await prisma.interview.create({
                data: {
                    courseId,
                    userId,
                    transcript: plan.milestones as any,
                }
            });
        }

        const chatSession = await prisma.chatSession.create({
            data: {
                userId,
                title: `Capstone Interview: ${course.title}`,
            }
        });

        res.status(201).json({ sessionId: chatSession.id, milestones: plan.milestones });
    } catch (error) {
        next(error);
    }
};

export const getInterviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const interviews = await prisma.interview.findMany({
            where: { userId },
            include: {
                course: {
                    select: {
                        title: true,
                        description: true,
                        status: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.json(interviews);
    } catch (error) {
        next(error);
    }
};

export const getSessionMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { sessionId } = req.params;
        if (typeof sessionId !== "string") {
            res.status(400).json({ error: "Invalid sessionId parameter" });
            return;
        }

        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            res.status(404).json({ error: "Session not found" });
            return;
        }

        if (session.userId !== userId) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }

        let messages = await prisma.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: "asc" },
        });

        // Check if session has 0 messages, kick off the first question
        if (messages.length === 0) {
            const turnResult = await runInterviewTurn(sessionId, userId);
            if (turnResult.assistantMessage) {
                messages = [turnResult.assistantMessage];
            }
        }

        const interview = await prisma.interview.findFirst({
            where: { userId },
        });

        const isComplete = interview?.passed !== null;

        res.json({
            messages,
            isComplete,
            score: interview?.score ?? null,
            passed: interview?.passed ?? null,
            feedbackData: interview?.feedback ?? null,
        });
    } catch (error) {
        next(error);
    }
};

export const postSessionMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { sessionId } = req.params;
        if (typeof sessionId !== "string") {
            res.status(400).json({ error: "Invalid sessionId parameter" });
            return;
        }
        const { content } = req.body;

        if (!content || typeof content !== "string" || !content.trim()) {
            res.status(400).json({ error: "Content is required" });
            return;
        }

        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            res.status(404).json({ error: "Session not found" });
            return;
        }

        if (session.userId !== userId) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }

        // Add the user message
        const userMsg = await prisma.chatMessage.create({
            data: {
                sessionId,
                role: "user",
                content,
            },
        });

        // Run the turn
        const turnResult = await runInterviewTurn(sessionId, userId);

        res.json({
            userMessage: userMsg,
            ...turnResult
        });
    } catch (error) {
        next(error);
    }
};

export const getTutorSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { courseId } = req.params;
        if (typeof courseId !== "string") {
            res.status(400).json({ error: "Invalid courseId" });
            return;
        }

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }

        let session = await prisma.chatSession.findFirst({
            where: {
                userId,
                courseId,
                type: ChatSessionType.TUTOR,
            },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!session) {
            session = await prisma.chatSession.create({
                data: {
                    userId,
                    courseId,
                    type: ChatSessionType.TUTOR,
                    title: `Tutor Chat: ${course.title}`,
                },
                include: {
                    messages: {
                        orderBy: { createdAt: "asc" },
                    },
                },
            });
        }

        res.json({ session });
    } catch (error) {
        next(error);
    }
};

export const clearTutorSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { courseId } = req.params;
        if (typeof courseId !== "string") {
            res.status(400).json({ error: "Invalid courseId" });
            return;
        }

        const sessions = await prisma.chatSession.findMany({
            where: {
                userId,
                courseId,
            },
            select: { id: true },
        });

        if (sessions.length > 0) {
            const sessionIds = sessions.map((s) => s.id);
            await prisma.chatMessage.deleteMany({
                where: { sessionId: { in: sessionIds } },
            });
        }

        res.json({ message: "Tutor chat history cleared" });
    } catch (error) {
        next(error);
    }
};

