import { Router } from "express";
import { getLesson, regenerateLesson } from "./lesson.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

import quizRouter from "../quiz/quiz.router.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/:lessonId", getLesson);
router.post("/:lessonId/regenerate", regenerateLesson);
router.use("/:lessonId/quiz", quizRouter);

export default router;
