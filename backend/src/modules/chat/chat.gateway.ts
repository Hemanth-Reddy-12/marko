import { Server as SocketIOServer, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import type { Server as HTTPServer } from "http";
import prisma from "../../config/db.js";
import { evaluateInterview, type Milestone } from "../../agents/interview.agent.js";
import { CourseStatus } from "../../generated/prisma/index.js";
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

    // Shared turn runner: builds chat history, calls the evaluator, persists the
    // assistant reply, and emits it. Used for both the opening question and
    // every subsequent user message.
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

            // Prisma interprets plain objects on Json fields as nested relation
            // operations. Serialising through JSON ensures it's treated as raw value.
            const feedbackJson = JSON.parse(JSON.stringify(feedbackData));

            await prisma.interview.update({
                where: { id: interview.id },
                data: {
                    score: aiResponse.score ?? null,
                    passed: aiResponse.passed ?? null,
                    feedback: feedbackJson,
                }
            });

            // Once the capstone interview is concluded the course is complete
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

        socket.on("join_session", async ({ sessionId, userId }) => {
            const session = await prisma.chatSession.findUnique({
                where: { id: sessionId },
            });
            if (session && session.userId === userId) {
                socket.join(sessionId);
                console.log(`Socket ${socket.id} joined session ${sessionId}`);
                socket.emit("session_joined", { sessionId });

                // Kick off the examiner's opening question on a fresh session
                // so the interview starts without waiting for the user.
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
