import { Router } from "express";
import { getLesson } from "./lesson.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/:lessonId", getLesson);

export default router;
