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

        // Perform course creation and planning inside a Prisma transaction
        const course = await prisma.$transaction(async (tx) => {
            // 1. Create a Course record locked in a GENERATING state
            const newCourse = await tx.course.create({
                data: {
                    title: goal, // Placeholder until agent generates the real title
                    description: "Planning your course...", // Placeholder
                    durationDays,
                    status: CourseStatus.GENERATING,
                    userId,
                },
            });

            try {
                // 2. Invoke the Planner Agent
                const planned = await runPlannerAgent({
                    goal,
                    durationDays,
                    userId,
                    courseId: newCourse.id,
                });

                // 3. Write lessons to the database
                const lessonsData = planned.lessons.map((lesson) => ({
                    title: lesson.title,
                    order: lesson.order,
                    status: lesson.order === 1 ? LessonStatus.AVAILABLE : LessonStatus.LOCKED,
                    generationStatus: GenerationStatus.NOT_GENERATED,
                    courseId: newCourse.id,
                }));

                await tx.lesson.createMany({
                    data: lessonsData,
                });

                // 4. Transition the Course to ACTIVE (ready) with the generated title/description
                const updatedCourse = await tx.course.update({
                    where: { id: newCourse.id },
                    data: {
                        title: planned.title,
                        description: planned.description,
                        status: CourseStatus.ACTIVE,
                    },
                    include: {
                        lessons: {
                            orderBy: { order: "asc" }
                        }
                    }
                });

                return updatedCourse;
            } catch (error) {
                console.error("Course planning agent failed, rolling back transaction:", error);
                throw error;
            }
        }, {
            // Set a generous timeout for the transaction to accommodate the LLM request
            timeout: 30000,
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
