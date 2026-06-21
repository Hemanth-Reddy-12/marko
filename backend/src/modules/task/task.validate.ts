import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
    TaskType,
    TaskStatus,
    Priority,
    TaskSource,
    CreatedBy,
} from "../../generated/prisma/index.js";

/** Helper to create native enum schema from Prisma enums */
const enumSchema = (EnumObj: any) => z.nativeEnum(EnumObj);

/** Optional ISO‑date string validation */
const isoDate = z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "must be a valid ISO date string" })
    .optional();

/** Schema for creating a task */
const createTaskSchema = z.object({
    title: z.string().min(1, { message: "title is required" }),
    description: z.string().optional(),
    type: enumSchema(TaskType),
    taskStatus: enumSchema(TaskStatus),
    priority: enumSchema(Priority),
    startDate: isoDate,
    dueDate: isoDate,
    taskSource: enumSchema(TaskSource),
    createdBy: enumSchema(CreatedBy),
});

/** Schema for updating a task (all fields optional) */
const updateTaskSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    type: enumSchema(TaskType).optional(),
    taskStatus: enumSchema(TaskStatus).optional(),
    priority: enumSchema(Priority).optional(),
    startDate: z.union([z.string(), z.null()]).optional().refine((val) => {
        if (val === null || val === undefined) return true;
        return !isNaN(Date.parse(val as string));
    }, { message: "startDate must be a valid ISO date string or null" }),
    dueDate: z.union([z.string(), z.null()]).optional().refine((val) => {
        if (val === null || val === undefined) return true;
        return !isNaN(Date.parse(val as string));
    }, { message: "dueDate must be a valid ISO date string or null" }),
    taskSource: enumSchema(TaskSource).optional(),
    createdBy: enumSchema(CreatedBy).optional(),
}).strict();

/** Middleware for validating task creation */
export function validateCreateTask(req: Request, res: Response, next: NextFunction): void {
    const result = createTaskSchema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.issues.map((i) => i.message);
        res.status(400).json({ errors });
        return;
    }
    req.body = result.data;
    next();
}

/** Middleware for validating task updates */
export function validateUpdateTask(req: Request, res: Response, next: NextFunction): void {
    const result = updateTaskSchema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.issues.map((i) => i.message);
        res.status(400).json({ errors });
        return;
    }
    req.body = result.data;
    next();
}

