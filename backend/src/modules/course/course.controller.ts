import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { runPlannerAgent } from "../../agents/planner.agent.js";
import { createCourseSchema } from "./course.validate.js";
import { CourseStatus, LessonStatus, GenerationStatus } from "../../generated/prisma/index.js";
import { sendNotification } from "../notification/notification.service.js";

export async function createCourse(
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

        const bodyParse = createCourseSchema.safeParse(req.body);
        if (!bodyParse.success) {
            res.status(400).json({ error: bodyParse.error.message });
            return;
        }

        const { goal, durationDays } = bodyParse.data;

        // 1. Create a Course record locked in a GENERATING state
        const course = await prisma.course.create({
            data: {
                title: goal, // Placeholder until agent generates the real title
                description: "Planning your course...", // Placeholder
                durationDays,
                status: CourseStatus.GENERATING,
                userId,
            },
        });

        // 2. Invoke the Planner Agent in the background (no await)
        runPlannerAgent({
            goal,
            durationDays,
            userId,
            courseId: course.id,
        }).then(async (planned) => {
            try {
                // 3. Write lessons and update course in a quick transaction
                await prisma.$transaction(async (tx) => {
                    const numLessons = planned.lessons.length;
                    const lessonsPerDay = Math.ceil(numLessons / Math.max(course.durationDays, 1));
                    
                    const lessonsData = planned.lessons.map((lesson, index) => {
                        const dayOffset = Math.floor(index / lessonsPerDay);
                        const scheduledDate = new Date();
                        scheduledDate.setDate(scheduledDate.getDate() + dayOffset);
                        // Zero out the time to make it a pure date
                        scheduledDate.setHours(0, 0, 0, 0);

                        return {
                            title: lesson.title,
                            order: lesson.order,
                            weight: lesson.weight || "medium",
                            estimateTime: lesson.estimateTime || 0,
                            scheduledDate: scheduledDate,
                            status: lesson.order === 1 ? LessonStatus.AVAILABLE : LessonStatus.LOCKED,
                            generationStatus: GenerationStatus.NOT_GENERATED,
                            courseId: course.id,
                        };
                    });

                    await tx.lesson.createMany({
                        data: lessonsData,
                    });

                    // 4. Transition the Course to ACTIVE (ready) with the generated title/description
                    await tx.course.update({
                        where: { id: course.id },
                        data: {
                            title: planned.title,
                            description: planned.description,
                            estimateTime: planned.estimateTime || 0,
                            status: CourseStatus.ACTIVE,
                        }
                    });
                });

                // Send notification to user that course is generated
                await sendNotification(
                    userId,
                    "Course Ready",
                    `Your course "${planned.title}" has been generated and is ready to start!`
                );
            } catch (txError: any) {
                console.error("Failed to commit course planning transaction:", txError);
                await prisma.course.update({
                    where: { id: course.id },
                    data: { status: CourseStatus.FAILED, description: `Failed to commit course plan: ${txError.message || 'Unknown error'}` }
                });
                await sendNotification(
                    userId,
                    "Course Generation Failed",
                    `Failed to commit the generated plan for your course: "${planned.title || goal}".`
                );
            }
        }).catch(async (error: any) => {
            console.error("Course planning agent failed:", error);
            await prisma.course.update({
                where: { id: course.id },
                data: { status: CourseStatus.FAILED, description: `Course generation failed: ${error.message || 'Unknown error'}` }
            });
            await sendNotification(
                userId,
                "Course Generation Failed",
                `We couldn't generate the course outline for: "${goal}".`
            );
        });

        res.status(201).json(course);
    } catch (error) {
        next(error);
    }
}

export async function getCourses(
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

        const courses = await prisma.course.findMany({
            where: { userId },
            include: {
                lessons: {
                    orderBy: { order: "asc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(courses);
    } catch (error) {
        next(error);
    }
}

export async function getCourse(
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

        const courseId = req.params.courseId as string;

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                lessons: {
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }

        if (course.userId !== userId) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }

        // Fire and forget update for lastVisitedAt
        prisma.course.update({
            where: { id: courseId },
            data: { lastVisitedAt: new Date() }
        }).catch(err => console.error("Failed to update lastVisitedAt:", err));

        res.json(course);
    } catch (error) {
        next(error);
    }
}

export async function deleteCourse(
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

        const courseId = req.params.courseId as string;

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

        await prisma.course.delete({
            where: { id: courseId },
        });

        res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
        next(error);
    }
}
