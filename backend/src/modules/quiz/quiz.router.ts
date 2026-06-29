import { Router } from "express";
import { getQuiz, attemptQuiz } from "./quiz.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/", getQuiz);
router.post("/attempt", attemptQuiz);

export default router;
