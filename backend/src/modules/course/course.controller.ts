import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { runPlannerAgent } from "../../agents/planner.agent.js";
import { createCourseSchema } from "./course.validate.js";
import { CourseStatus, LessonStatus, GenerationStatus } from "../../generated/prisma/index.js";

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
                    const lessonsData = planned.lessons.map((lesson) => ({
                        title: lesson.title,
                        order: lesson.order,
                        weight: lesson.weight || "medium",
                        status: lesson.order === 1 ? LessonStatus.AVAILABLE : LessonStatus.LOCKED,
                        generationStatus: GenerationStatus.NOT_GENERATED,
                        courseId: course.id,
                    }));

                    await tx.lesson.createMany({
                        data: lessonsData,
                    });

                    // 4. Transition the Course to ACTIVE (ready) with the generated title/description
                    await tx.course.update({
                        where: { id: course.id },
                        data: {
                            title: planned.title,
                            description: planned.description,
                            status: CourseStatus.ACTIVE,
                        }
                    });
                });
            } catch (txError: any) {
                console.error("Failed to commit course planning transaction:", txError);
                await prisma.course.update({
                    where: { id: course.id },
                    data: { status: CourseStatus.FAILED, description: `Failed to commit course plan: ${txError.message || 'Unknown error'}` }
                });
            }
        }).catch(async (error: any) => {
            console.error("Course planning agent failed:", error);
            await prisma.course.update({
                where: { id: course.id },
                data: { status: CourseStatus.FAILED, description: `Course generation failed: ${error.message || 'Unknown error'}` }
            });
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
