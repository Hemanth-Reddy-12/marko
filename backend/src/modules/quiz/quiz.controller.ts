import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { getLessonParamsSchema } from "../lesson/lesson.validate.js";
import { attemptQuizSchema } from "./quiz.validate.js";
import { runQuizAgent } from "../../agents/quiz.agent.js";
import { QuizStatus, LessonStatus } from "../../generated/prisma/index.js";
import type { Question } from "./quiz.types.js";

export async function getQuiz(
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

        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course || course.userId !== userId) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId, courseId },
        });

        if (!lesson) {
            res.status(404).json({ error: "Lesson not found" });
            return;
        }

        if (!lesson.content) {
            res.status(400).json({ error: "Lesson content must be generated before taking a quiz." });
            return;
        }

        let wasNewlyLocked = false;
        let currentQuiz: any = null;

        await prisma.$transaction(async (tx) => {
            let quiz = await tx.quiz.findFirst({
                where: { lessonId },
                orderBy: { version: 'desc' },
            });

            if (!quiz) {
                quiz = await tx.quiz.create({
                    data: {
                        lessonId,
                        version: 1,
                        status: QuizStatus.NOT_GENERATED,
                    },
                });
            }

            if (quiz.status === QuizStatus.NOT_GENERATED || quiz.status === QuizStatus.FAILED) {
                currentQuiz = await tx.quiz.update({
                    where: { id: quiz.id },
                    data: { status: QuizStatus.GENERATING },
                });
                wasNewlyLocked = true;
            } else {
                currentQuiz = quiz;
            }
        });

        if (!currentQuiz) {
            res.status(500).json({ error: "Failed to initialize quiz" });
            return;
        }

        if ((currentQuiz as any).status === QuizStatus.GENERATED) {
            const questions = (currentQuiz as any).questions as Question[];
            // Strip answers and rationales
            const sanitizedQuestions = questions.map(q => ({
                id: q.id,
                text: q.text,
                options: q.options,
            }));

            res.json({
                id: (currentQuiz as any).id,
                version: (currentQuiz as any).version,
                status: (currentQuiz as any).status,
                questions: sanitizedQuestions,
            });
            return;
        }

        if (wasNewlyLocked) {
            runQuizAgent({
                lessonTitle: lesson.title,
                lessonContent: lesson.content,
                userId,
                lessonId,
                quizId: (currentQuiz as any).id,
            }).then(async (result) => {
                await prisma.quiz.update({
                    where: { id: (currentQuiz as any).id },
                    data: {
                        questions: result.questions as any,
                        status: QuizStatus.GENERATED,
                    },
                });
            }).catch(async (error) => {
                console.error("Quiz Agent failed:", error);
                await prisma.quiz.update({
                    where: { id: (currentQuiz as any).id },
                    data: {
                        status: QuizStatus.FAILED,
                    },
                });
            });
        }

        res.status(202).json({
            status: "GENERATING",
            message: "Quiz is currently being generated.",
        });

    } catch (error) {
        next(error);
    }
}

export async function attemptQuiz(
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

        const bodyParse = attemptQuizSchema.safeParse(req);
        if (!bodyParse.success) {
            res.status(400).json({ error: "Invalid body payload" });
            return;
        }

        const { courseId, lessonId } = paramsParse.data;
        const { answers } = bodyParse.data.body;

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId, courseId },
        });

        if (!lesson) {
            res.status(404).json({ error: "Lesson not found" });
            return;
        }

        const quiz = await prisma.quiz.findFirst({
            where: { lessonId },
            orderBy: { version: 'desc' },
        });

        if (!quiz || quiz.status !== QuizStatus.GENERATED) {
            res.status(400).json({ error: "No active quiz ready for attempt" });
            return;
        }

        const questions = quiz.questions as unknown as Question[];

        if (answers.length !== questions.length) {
            res.status(400).json({ error: "Answers length does not match questions length" });
            return;
        }

        let correctCount = 0;
        for (let i = 0; i < questions.length; i++) {
            if (answers[i] === questions[i]?.correctAnswerIndex) {
                correctCount++;
            }
        }

        const score = correctCount / questions.length;
        const passed = score >= 0.6;

        let attempt;
        await prisma.$transaction(async (tx) => {
            attempt = await tx.quizAttempt.create({
                data: {
                    answers: answers as any,
                    score,
                    passed,
                    quizId: quiz.id,
                    userId,
                },
            });

            if (passed) {
                await tx.lesson.update({
                    where: { id: lesson.id },
                    data: { status: LessonStatus.COMPLETED },
                });

                const nextLesson = await tx.lesson.findFirst({
                    where: { courseId: lesson.courseId, order: lesson.order + 1 },
                });

                if (nextLesson && nextLesson.status === LessonStatus.LOCKED) {
                    await tx.lesson.update({
                        where: { id: nextLesson.id },
                        data: { status: LessonStatus.AVAILABLE },
                    });
                }
            } else {
                await tx.quiz.create({
                    data: {
                        lessonId,
                        version: quiz.version + 1,
                        status: QuizStatus.NOT_GENERATED,
                    },
                });
            }
        });

        res.json({
            attempt,
            quiz: {
                ...quiz,
                questions: questions, // Full questions with rationale
            }
        });
    } catch (error) {
        next(error);
    }
}
