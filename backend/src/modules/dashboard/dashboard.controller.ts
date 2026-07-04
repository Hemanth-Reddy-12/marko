import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { CourseStatus } from "../../generated/prisma/index.js";

export async function getDailySchedule(
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch lessons scheduled for today or earlier that are not completed
        let lessons = await prisma.lesson.findMany({
            where: {
                course: {
                    userId: userId,
                    status: CourseStatus.ACTIVE,
                },
                scheduledDate: {
                    lte: today,
                },
                status: {
                    not: "COMPLETED",
                },
            },
            include: {
                course: {
                    select: {
                        title: true,
                    },
                },
            },
            orderBy: [
                { scheduledDate: "asc" },
                { order: "asc" },
            ],
            take: 5,
        });

        // Fallback: If no lessons are scheduled for today or earlier, get next available/in-progress lessons of active courses (max 5)
        if (lessons.length === 0) {
            lessons = await prisma.lesson.findMany({
                where: {
                    course: {
                        userId: userId,
                        status: CourseStatus.ACTIVE,
                    },
                    status: {
                        in: ["AVAILABLE", "IN_PROGRESS"],
                    },
                },
                include: {
                    course: {
                        select: {
                            title: true,
                        },
                    },
                },
                orderBy: [
                    { course: { createdAt: "desc" } },
                    { order: "asc" },
                ],
                take: 5,
            });
        }

        res.json(lessons);
    } catch (error) {
        next(error);
    }
}

export async function getActivityFeed(
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

        const activities = await prisma.agentRun.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5,
        });

        res.json(activities);
    } catch (error) {
        next(error);
    }
}

export async function getUpcomingLessons(
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

        const lessons = await prisma.lesson.findMany({
            where: {
                course: { userId },
                status: { in: ["AVAILABLE", "IN_PROGRESS"] },
            },
            include: {
                course: {
                    select: { title: true, id: true },
                },
            },
            orderBy: [
                { scheduledDate: "asc" },
                { order: "asc" },
            ],
        });

        res.json(lessons);
    } catch (error) {
        next(error);
    }
}

export async function getUpcomingQuizzes(
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

        const quizzes = await prisma.quiz.findMany({
            where: {
                lesson: { course: { userId } },
                status: "GENERATED",
                attempts: { none: { passed: true } },
            },
            include: {
                lesson: {
                    select: { title: true, id: true, courseId: true, course: { select: { title: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(quizzes);
    } catch (error) {
        next(error);
    }
}

export async function getQuizHistory(
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

        const history = await prisma.quizAttempt.findMany({
            where: { userId },
            include: {
                quiz: {
                    include: {
                        lesson: {
                            select: { title: true, id: true, courseId: true, course: { select: { title: true } } },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(history);
    } catch (error) {
        next(error);
    }
}

export async function getRecentlyVisitedCourses(
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
            where: {
                userId,
                lastVisitedAt: { not: null }
            },
            include: {
                lessons: {
                    orderBy: { order: "asc" },
                },
            },
            orderBy: { lastVisitedAt: "desc" },
            take: 3,
        });

        res.json(courses);
    } catch (error) {
        next(error);
    }
}

export async function getCompletedLessons(
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

        const lessons = await prisma.lesson.findMany({
            where: {
                course: { userId },
                status: "COMPLETED",
            },
            include: {
                course: {
                    select: { title: true, id: true },
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        res.json(lessons);
    } catch (error) {
        next(error);
    }
}

export async function getDashboardStats(
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

        const [totalCourses, completedQuizzes, completedInterviews] = await Promise.all([
            prisma.course.count({
                where: { userId }
            }),
            prisma.quizAttempt.count({
                where: {
                    userId,
                    passed: true
                }
            }),
            prisma.interview.count({
                where: {
                    userId,
                    score: { not: null }
                }
            })
        ]);

        res.json({
            totalCourses,
            completedQuizzes,
            completedInterviews
        });
    } catch (error) {
        next(error);
    }
}
