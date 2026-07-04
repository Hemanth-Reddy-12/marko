import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";

export async function getNotifications(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        res.json(notifications);
    } catch (error) {
        next(error);
    }
}

export async function markAsRead(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = (req as any).user?.id;
        const notificationId = req.params.id as string;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification || notification.userId !== userId) {
            res.status(404).json({ error: "Notification not found" });
            return;
        }

        const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
}

export async function markAllAsRead(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
}

export async function getSettings(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { notificationSettings: true },
        });

        // Default settings if null
        const settings = user?.notificationSettings || {
            courseUpdates: true,
            weeklyReport: true,
            systemAlerts: true,
        };

        res.json(settings);
    } catch (error) {
        next(error);
    }
}

export async function updateSettings(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = (req as any).user?.id;
        const settings = req.body;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        await prisma.user.update({
            where: { id: userId },
            data: { notificationSettings: settings },
        });

        res.json({ success: true, settings });
    } catch (error) {
        next(error);
    }
}
