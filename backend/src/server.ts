import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { registerTaskRoutes } from "./modules/task/task.server.js";
import { registerChatRoutes } from "./modules/chat/chat.server.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

app.use(
    cors({
        origin: env.FRONTEND_URL,
        credentials: true,
    }),
);

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.get("/", (_, res) => {
    res.send("Marco API is running");
});

registerTaskRoutes(app);
registerChatRoutes(app);

// Global error handling middleware (must be last)
app.use(errorHandler);

const PORT = Number.parseInt(env.PORT, 10);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
