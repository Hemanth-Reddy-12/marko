import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import courseRouter from "./modules/course/course.router.js";
import lessonRouter from "./modules/lesson/lesson.router.js";
import chatRouter from "./modules/chat/chat.router.js";
import dashboardRouter from "./modules/dashboard/dashboard.router.js";
import notificationRouter from "./modules/notification/notification.router.js";
import { setupChatGateway } from "./modules/chat/chat.gateway.js";

const app = express();
const httpServer = http.createServer(app);
setupChatGateway(httpServer);

const allowedOrigins = [env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    }),
);

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.get("/", (_, res) => {
    res.send("Marco API is running");
});

app.get("/api/health", (_, res) => {
    res.json({ status: "ok", db: true });
});

app.use("/api/courses", courseRouter);
app.use("/api/courses/:courseId/lessons", lessonRouter);
app.use("/api/interviews", chatRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/notifications", notificationRouter);

// Global error handling middleware (must be last)
app.use(errorHandler);

const PORT = Number.parseInt(env.PORT, 10);
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    import("./lib/ai/index.js").then(({ getChatProvider }) => {
        try {
            const provider = getChatProvider();
            console.log(`[AI] Connected to Provider: ${provider.info.name.toUpperCase()} | Model: ${provider.info.model}`);
        } catch (error) {
            console.log(`[AI] ⚠️ Warning: Provider not configured correctly.`);
        }
    }).catch(err => {
        console.log(`[AI] ⚠️ Failed to load AI provider module.`);
    });
});
