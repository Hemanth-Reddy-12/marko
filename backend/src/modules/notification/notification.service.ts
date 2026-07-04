import prisma from "../../config/db.js";
import { getIO } from "../chat/chat.gateway.js";

export async function sendNotification(userId: string, title: string, message: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { notificationSettings: true }
        });

        // Save to DB
        const notification = await prisma.notification.create({
            data: {
                title,
                message,
                userId,
            }
        });

        // Send real-time event
        const gateway = getIO();
        if (gateway) {
            gateway.to(`user_${userId}`).emit("new_notification", notification);
        }

        return notification;
    } catch (error) {
        console.error("Failed to send notification:", error);
        return null;
    }
}
