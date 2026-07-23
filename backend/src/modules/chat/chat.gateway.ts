import { Server as SocketIOServer, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import type { Server as HTTPServer } from "http";
import prisma from "../../config/db.js";
import { evaluateInterview, type Milestone } from "../../agents/interview.agent.js";
import { streamTutorTurn } from "../../agents/tutor.agent.js";
import { getChatProvider } from "../../lib/ai/index.js";
import { CourseStatus, ChatSessionType, AgentType, AgentRunStatus } from "../../generated/prisma/index.js";
import { env } from "../../config/env.js";

let ioInstance: SocketIOServer | null = null;

export async function setupChatGateway(httpServer: HTTPServer) {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: [env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
            credentials: true,
        },
    });
    ioInstance = io;

    try {
        const redisOptions = {
            url: env.REDIS_URL,
            socket: {
                keepAlive: 5000,
                reconnectStrategy: (retries: number) => {
                    // Try to reconnect with backoff up to 3 seconds
                    return Math.min(retries * 100, 3000);
                },
            },
            pingInterval: 30000, // Send PING every 30s to keep Upstash connection alive
        };

        const pubClient = createClient(redisOptions as any);
        const subClient = createClient(redisOptions as any);

        pubClient.on("error", (err) => console.error("Redis pubClient Error:", err.message || err));
        subClient.on("error", (err) => console.error("Redis subClient Error:", err.message || err));

        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        console.log("Redis adapter connected to Socket.IO");
    } catch (err) {
        console.error("Failed to connect to Redis:", err);
    }

    const runTutorTurn = async (
        socket: Socket,
        sessionId: string,
        userId: string,
        userQuery: string,
        courseId: string,
        lessonId?: string
    ) => {
        if (!userId) return;

        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) return;

        let lessonTitle: string | null = null;
        let lessonContent: string | null = null;

        if (lessonId) {
            const lesson = await prisma.lesson.findUnique({
                where: { id: lessonId },
            });
            if (lesson) {
                lessonTitle = lesson.title;
                lessonContent = lesson.content;
            }
        }

        const messages = await prisma.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: "asc" },
            take: 12,
        });

        const chatHistory = messages
            .filter((m) => m.content !== userQuery)
            .map((m) => ({
                role: m.role as "user" | "assistant" | "system",
                content: m.content,
            }));

        io.to(sessionId).emit("tutor_typing");

        try {
            const fullAnswer = await streamTutorTurn(
                {
                    userId,
                    courseTitle: course.title,
                    courseDescription: course.description,
                    lessonTitle,
                    lessonContent,
                    chatHistory,
                    userQuery,
                },
                (chunk) => {
                    io.to(sessionId).emit("tutor_chunk", { delta: chunk.delta });
                }
            );

            const assistantMsg = await prisma.chatMessage.create({
                data: {
                    sessionId,
                    role: "assistant",
                    content: fullAnswer,
                },
            });

            const promptTokens = Math.max(1, Math.ceil((userQuery.length + (lessonContent?.length || 0)) / 4));
            const completionTokens = Math.max(1, Math.ceil(fullAnswer.length / 4));
            const totalTokens = promptTokens + completionTokens;

            const provider = await getChatProvider(userId).catch(() => null);

            await prisma.agentRun.create({
                data: {
                    agent: AgentType.TUTOR,
                    entityType: "ChatSession",
                    entityId: sessionId,
                    userId,
                    attempt: 1,
                    status: AgentRunStatus.SUCCESS,
                    promptVersion: "1.0.0",
                    modelName: provider?.info?.model || provider?.info?.name || "AI Tutor",
                    promptTokens,
                    completionTokens,
                    totalTokens,
                    output: { answer: fullAnswer },
                    startedAt: new Date(),
                    finishedAt: new Date(),
                },
            }).catch((err) => console.error("Failed to log Tutor AgentRun:", err));

            io.to(sessionId).emit("tutor_complete", {
                messageId: assistantMsg.id,
                content: fullAnswer,
            });
        } catch (err: any) {
            console.error("Tutor streaming error:", err);
            socket.emit("error", { message: err.message || "Failed to generate tutor response" });
        }
    };

    // Shared turn runner for interview examiner
    const runInterviewTurn = async (socket: Socket, sessionId: string, userId: string) => {
        if (!userId) return;
        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) return;

        const interview = await prisma.interview.findFirst({
            where: { userId },
            include: { course: true },
        });
        if (!interview) return;

        // Interview already concluded — do not generate further turns.
        if (interview.passed !== null) return;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return;

        const messages = await prisma.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: "asc" },
        });

        const chatHistory = messages.map(m => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
        }));

        const milestones = (interview.transcript ?? []) as unknown as Milestone[];

        // Signal the client that the examiner is "thinking".
        io.to(sessionId).emit("typing");

        const aiResponse = await evaluateInterview({
            courseId: interview.courseId,
            userId,
            studentName: user.name,
            courseTitle: interview.course.title,
            courseDescription: interview.course.description,
            chatHistory,
            milestones,
        });

        await prisma.chatMessage.create({
            data: {
                sessionId,
                role: "assistant",
                content: aiResponse.message,
            },
        });

        io.to(sessionId).emit("new_message", {
            role: "assistant",
            content: aiResponse.message,
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

            io.to(sessionId).emit("interview_complete", {
                score: aiResponse.score,
                passed: aiResponse.passed,
                feedbackData,
            });
        }
    };

    io.on("connection", (socket: Socket) => {
        console.log("New client connected:", socket.id);

        socket.on("join_user", ({ userId }) => {
            if (userId) {
                socket.join(`user_${userId}`);
                console.log(`Socket ${socket.id} joined user_${userId}`);
            }
        });

        socket.on("join_tutor_session", async ({ courseId, userId }) => {
            if (!userId || !courseId) {
                socket.emit("error", { message: "Missing courseId or userId" });
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
                const course = await prisma.course.findUnique({ where: { id: courseId } });
                session = await prisma.chatSession.create({
                    data: {
                        userId,
                        courseId,
                        type: ChatSessionType.TUTOR,
                        title: `Tutor Chat: ${course?.title || "Course"}`,
                    },
                    include: {
                        messages: {
                            orderBy: { createdAt: "asc" },
                        },
                    },
                });
            }

            socket.join(session.id);
            socket.emit("tutor_session_joined", {
                sessionId: session.id,
                messages: session.messages,
            });
        });

        socket.on("send_tutor_message", async ({ sessionId, content, userId, courseId, lessonId }) => {
            try {
                if (!userId || !sessionId || !content) {
                    socket.emit("error", { message: "Missing required parameters" });
                    return;
                }

                await prisma.chatMessage.create({
                    data: {
                        sessionId,
                        role: "user",
                        content,
                    },
                });

                await runTutorTurn(socket, sessionId, userId, content, courseId, lessonId);
            } catch (err) {
                console.error("Error processing send_tutor_message:", err);
                socket.emit("error", { message: "Failed to process tutor message" });
            }
        });

        socket.on("join_session", async ({ sessionId, userId }) => {
            const session = await prisma.chatSession.findUnique({
                where: { id: sessionId },
            });
            if (session && session.userId === userId) {
                socket.join(sessionId);
                console.log(`Socket ${socket.id} joined session ${sessionId}`);
                socket.emit("session_joined", { sessionId });

                const messageCount = await prisma.chatMessage.count({
                    where: { sessionId },
                });
                if (messageCount === 0) {
                    runInterviewTurn(socket, sessionId, userId).catch(err => {
                        console.error("Error generating opening question:", err);
                        socket.emit("error", { message: "Failed to start interview" });
                    });
                }
            } else {
                socket.emit("error", { message: "Invalid session or unauthorized" });
            }
        });

        socket.on("send_message", async ({ sessionId, content, userId }) => {
            try {
                if (!userId) {
                    socket.emit("error", { message: "Missing userId" });
                    return;
                }
                await prisma.chatMessage.create({
                    data: {
                        sessionId,
                        role: "user",
                        content,
                    },
                });

                await runInterviewTurn(socket, sessionId, userId);
            } catch (err) {
                console.error("Error processing send_message:", err);
                socket.emit("error", { message: "Failed to process message" });
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
}

export function getIO() {
    return ioInstance;
}
