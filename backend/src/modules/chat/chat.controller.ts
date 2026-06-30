import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { initInterviewSchema } from "./chat.validate.js";
import { generateInterviewPlan } from "../../agents/interview.agent.js";

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
