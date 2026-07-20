import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { getLessonParamsSchema } from "./lesson.validate.js";
import { runContentAgent } from "../../agents/content.agent.js";
import { GenerationStatus, LessonStatus, CourseStatus } from "../../generated/prisma/index.js";
import { sendNotification } from "../notification/notification.service.js";

export async function getLesson(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const paramsParse = getLessonParamsSchema.safeParse(req.params);
        if (!paramsParse.success) {
            res.status(400).json({ error: "Invalid parameters" });
            return;
        }

        const { courseId, lessonId } = paramsParse.data;

        // Verify the user owns the course
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }

        if (course.userId !== userId) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }

        let wasNewlyLocked = false;
        let currentLesson: any = null;

        // 1. Optimistic Lock Check & Update via Transaction
        await prisma.$transaction(async (tx) => {
            const lesson = await tx.lesson.findUnique({
                where: { id: lessonId, courseId },
            });

            if (!lesson) {
                return;
            }

            // Enforce sequential access
            if (lesson.status === LessonStatus.LOCKED) {
                throw new Error("Lesson is locked");
            }

            if (lesson.generationStatus === GenerationStatus.NOT_GENERATED) {
                // Lock it to GENERATING
                currentLesson = await tx.lesson.update({
                    where: { id: lessonId },
                    data: { generationStatus: GenerationStatus.GENERATING },
                });
                wasNewlyLocked = true;
            } else {
                currentLesson = lesson;
            }
        });

        if (!currentLesson) {
            res.status(404).json({ error: "Lesson not found" });
            return;
        }

        // If it's already generated or failed, return it instantly
        if ((currentLesson as any).generationStatus === GenerationStatus.GENERATED || (currentLesson as any).generationStatus === GenerationStatus.FAILED) {
            res.json(currentLesson);
            return;
        }

        // 2. Trigger Out-Of-Band Generation if we just acquired the lock
        if (wasNewlyLocked) {

            // Do NOT await this here so we can return 202 immediately
            runContentAgent({
                courseGoal: course.title,
                lessonTitle: (currentLesson as any).title,
                lessonOrder: (currentLesson as any).order,
                userId,
                courseId,
                lessonId,
            }).then(async (result) => {
                await prisma.lesson.update({
                    where: { id: lessonId },
                    data: {
                        content: result.content,
                        generationStatus: GenerationStatus.GENERATED,
                    },
                });
                await sendNotification(
                    userId,
                    "Lesson Ready",
                    `Lesson "${(currentLesson as any).title}" is now generated and ready to read!`
                );
            }).catch(async (error: any) => {
                console.error("Content Agent failed:", error);
                await prisma.lesson.update({
                    where: { id: lessonId },
                    data: {
                        generationStatus: GenerationStatus.FAILED,
                    },
                });
                await sendNotification(
                    userId,
                    "Lesson Generation Failed",
                    `Failed to generate lesson "${(currentLesson as any).title}": ${error.message || "Invalid API key"}`
                );
            });
        }

        // 3. Return 202 Accepted while generation is in progress
        res.status(202).json({
            status: "GENERATING",
            message: "Lesson content is currently being generated.",
        });

    } catch (error: any) {
        if (error.message === "Lesson is locked") {
            res.status(403).json({ error: error.message });
            return;
        }
        next(error);
    }
}

export async function regenerateLesson(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const paramsParse = getLessonParamsSchema.safeParse(req.params);
        if (!paramsParse.success) {
            res.status(400).json({ error: "Invalid parameters" });
            return;
        }

        const { courseId, lessonId } = paramsParse.data;

        // Verify the user owns the course
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }

        if (course.userId !== userId) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }

        let currentLesson = null;

        await prisma.$transaction(async (tx) => {
            const lesson = await tx.lesson.findUnique({
                where: { id: lessonId, courseId },
            });

            if (!lesson) {
                return;
            }

            if (lesson.status === LessonStatus.LOCKED) {
                throw new Error("Lesson is locked");
            }

            // Lock it to GENERATING
            currentLesson = await tx.lesson.update({
                where: { id: lessonId },
                data: { generationStatus: GenerationStatus.GENERATING, content: null },
            });
        });

        if (!currentLesson) {
            res.status(404).json({ error: "Lesson not found" });
            return;
        }

        // Trigger Out-Of-Band Generation
        runContentAgent({
            courseGoal: course.title,
            lessonTitle: (currentLesson as any).title,
            lessonOrder: (currentLesson as any).order,
            userId,
            courseId,
            lessonId,
        }).then(async (result) => {
            await prisma.lesson.update({
                where: { id: lessonId },
                data: {
                    content: result.content,
                    generationStatus: GenerationStatus.GENERATED,
                },
            });
        }).catch(async (error) => {
            console.error("Content Agent failed:", error);
            await prisma.lesson.update({
                where: { id: lessonId },
                data: {
                    generationStatus: GenerationStatus.FAILED,
                },
            });
        });

        res.status(202).json({
            status: "GENERATING",
            message: "Lesson content is currently being regenerated.",
        });

    } catch (error: any) {
        if (error.message === "Lesson is locked") {
            res.status(403).json({ error: error.message });
            return;
        }
        next(error);
    }
}
