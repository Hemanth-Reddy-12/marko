import type { Express } from "express";
import taskRouter from "./task.router.js";

export function registerTaskRoutes(app: Express): void {
    app.use("/tasks", taskRouter);
}
