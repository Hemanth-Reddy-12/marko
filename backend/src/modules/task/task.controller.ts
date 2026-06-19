import type { Request, Response } from "express";
import prisma from "../../config/db.js";
import type { CreateTaskInput, UpdateTaskInput } from "./task.types.js";

function getParamId(req: Request): string {
    const id = req.params["id"];
    if (typeof id !== "string") {
        throw new Error("Invalid id parameter");
    }
    return id;
}

export async function getAllTasks(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const tasks = await prisma.task.findMany({ where: { userId } });
    res.json(tasks);
}

export async function getTaskById(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const id = getParamId(req);
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task || task.userId !== userId) {
        res.status(404).json({ error: "Task not found" });
        return;
    }

    res.json(task);
}

export async function createTask(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const body = req.body as CreateTaskInput;
    const task = await prisma.task.create({
        data: {
            ...body,
            userId,
        },
    });
    res.status(201).json(task);
}

export async function updateTask(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const id = getParamId(req);
    const data = req.body as UpdateTaskInput;

    const existing = await prisma.task.findUnique({ where: { id } });

    if (!existing || existing.userId !== userId) {
        res.status(404).json({ error: "Task not found" });
        return;
    }

    const task = await prisma.task.update({ where: { id }, data });
    res.json(task);
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const id = getParamId(req);

    const existing = await prisma.task.findUnique({ where: { id } });

    if (!existing || existing.userId !== userId) {
        res.status(404).json({ error: "Task not found" });
        return;
    }

    await prisma.task.delete({ where: { id } });
    res.status(204).send();
}
