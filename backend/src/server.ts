import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import courseRouter from "./modules/course/course.router.js";

const app = express();

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

// Global error handling middleware (must be last)
app.use(errorHandler);

const PORT = Number.parseInt(env.PORT, 10);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
