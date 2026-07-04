import { Router } from "express";
import { getNotifications, markAsRead, markAllAsRead, getSettings, updateSettings } from "./notification.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getNotifications);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.post("/read-all", markAllAsRead);
router.post("/:id/read", markAsRead);

export default router;
