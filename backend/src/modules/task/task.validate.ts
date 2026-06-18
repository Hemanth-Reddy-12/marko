import type { Request, Response, NextFunction } from "express";
import {
    TaskType,
    TaskStatus,
    Priority,
    TaskSource,
    CreatedBy,
} from "../../generated/prisma/index.js";

const TASK_TYPE_VALUES = Object.values(TaskType) as string[];
const TASK_STATUS_VALUES = Object.values(TaskStatus) as string[];
const PRIORITY_VALUES = Object.values(Priority) as string[];
const TASK_SOURCE_VALUES = Object.values(TaskSource) as string[];
const CREATED_BY_VALUES = Object.values(CreatedBy) as string[];

function isIn(value: string, values: string[]): boolean {
    return values.includes(value);
}

export function validateCreateTask(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const errors: string[] = [];
    const body = req.body as Record<string, unknown> | null | undefined;

    if (!body || typeof body !== "object") {
        res.status(400).json({ errors: ["Request body must be an object"] });
        return;
    }

    if (!body.title || typeof body.title !== "string") {
        errors.push("title is required and must be a string");
    }

    if (
        body.description !== undefined &&
        typeof body.description !== "string"
    ) {
        errors.push("description must be a string");
    }

    if (body.notes !== undefined && typeof body.notes !== "string") {
        errors.push("notes must be a string");
    }

    if (typeof body.type !== "string" || !isIn(body.type, TASK_TYPE_VALUES)) {
        errors.push(`type must be one of: ${TASK_TYPE_VALUES.join(", ")}`);
    }

    if (
        typeof body.taskStatus !== "string" ||
        !isIn(body.taskStatus, TASK_STATUS_VALUES)
    ) {
        errors.push(
            `taskStatus must be one of: ${TASK_STATUS_VALUES.join(", ")}`,
        );
    }

    if (
        typeof body.priority !== "string" ||
        !isIn(body.priority, PRIORITY_VALUES)
    ) {
        errors.push(`priority must be one of: ${PRIORITY_VALUES.join(", ")}`);
    }

    if (
        typeof body.taskSource !== "string" ||
        !isIn(body.taskSource, TASK_SOURCE_VALUES)
    ) {
        errors.push(
            `taskSource must be one of: ${TASK_SOURCE_VALUES.join(", ")}`,
        );
    }

    if (
        typeof body.createdBy !== "string" ||
        !isIn(body.createdBy, CREATED_BY_VALUES)
    ) {
        errors.push(
            `createdBy must be one of: ${CREATED_BY_VALUES.join(", ")}`,
        );
    }

    if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
    }

    next();
}

export function validateUpdateTask(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const errors: string[] = [];
    const body = req.body as Record<string, unknown> | null | undefined;

    if (!body || typeof body !== "object") {
        res.status(400).json({ errors: ["Request body must be an object"] });
        return;
    }

    if (body.title !== undefined && typeof body.title !== "string") {
        errors.push("title must be a string");
    }

    if (
        body.description !== undefined &&
        typeof body.description !== "string"
    ) {
        errors.push("description must be a string");
    }

    if (body.notes !== undefined && typeof body.notes !== "string") {
        errors.push("notes must be a string");
    }

    if (
        body.type !== undefined &&
        (typeof body.type !== "string" ||
            !isIn(body.type as string, TASK_TYPE_VALUES))
    ) {
        errors.push(`type must be one of: ${TASK_TYPE_VALUES.join(", ")}`);
    }

    if (
        body.taskStatus !== undefined &&
        (typeof body.taskStatus !== "string" ||
            !isIn(body.taskStatus as string, TASK_STATUS_VALUES))
    ) {
        errors.push(
            `taskStatus must be one of: ${TASK_STATUS_VALUES.join(", ")}`,
        );
    }

    if (
        body.priority !== undefined &&
        (typeof body.priority !== "string" ||
            !isIn(body.priority as string, PRIORITY_VALUES))
    ) {
        errors.push(`priority must be one of: ${PRIORITY_VALUES.join(", ")}`);
    }

    if (
        body.taskSource !== undefined &&
        (typeof body.taskSource !== "string" ||
            !isIn(body.taskSource as string, TASK_SOURCE_VALUES))
    ) {
        errors.push(
            `taskSource must be one of: ${TASK_SOURCE_VALUES.join(", ")}`,
        );
    }

    if (
        body.createdBy !== undefined &&
        (typeof body.createdBy !== "string" ||
            !isIn(body.createdBy as string, CREATED_BY_VALUES))
    ) {
        errors.push(
            `createdBy must be one of: ${CREATED_BY_VALUES.join(", ")}`,
        );
    }

    if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
    }

    next();
}
