import { Server as SocketIOServer, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import type { Server as HTTPServer } from "http";
import prisma from "../../config/db.js";
import { evaluateInterview } from "../../agents/interview.agent.js";
import { env } from "../../config/env.js";

export async function setupChatGateway(httpServer: HTTPServer) {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: [env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
            credentials: true,
        },
    });

    try {
        const pubClient = createClient({ url: env.REDIS_URL });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        console.log("Redis adapter connected to Socket.IO");
    } catch (err) {
        console.error("Failed to connect to Redis:", err);
    }

    io.on("connection", (socket: Socket) => {
        console.log("New client connected:", socket.id);

        socket.on("join_session", async ({ sessionId, userId }) => {
            const session = await prisma.chatSession.findUnique({
                where: { id: sessionId },
            });
            if (session && session.userId === userId) {
                socket.join(sessionId);
                console.log(`Socket ${socket.id} joined session ${sessionId}`);
                socket.emit("session_joined", { sessionId });
            } else {
                socket.emit("error", { message: "Invalid session or unauthorized" });
            }
        });

        socket.on("send_message", async ({ sessionId, content, userId }) => {
            try {
                await prisma.chatMessage.create({
                    data: {
                        sessionId,
                        role: "user",
                        content,
                    },
                });

                const messages = await prisma.chatMessage.findMany({
                    where: { sessionId },
                    orderBy: { createdAt: "asc" },
                });

                const chatHistory = messages.map(m => ({
                    role: m.role as "user" | "assistant" | "system",
                    content: m.content
                }));

                const session = await prisma.chatSession.findUnique({
                    where: { id: sessionId },
                });
                
                if (!session) return;
                
                const interview = await prisma.interview.findFirst({
                    where: { userId }
                });
                
                if (!interview) return;

                const aiResponse = await evaluateInterview({
                    courseId: interview.courseId,
                    userId,
                    chatHistory,
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
                    io.to(sessionId).emit("interview_complete", {
                        score: aiResponse.score,
                        passed: aiResponse.passed,
                        feedbackData,
                    });
                }
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
