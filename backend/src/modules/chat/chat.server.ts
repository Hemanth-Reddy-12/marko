import type { Express } from "express";
import chatRouter from "./chat.router.js";

export function registerChatRoutes(app: Express): void {
    app.use("/chat", chatRouter);
}
