import { Router } from "express";
import { createCourse, getCourses, getCourse } from "./course.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createCourse);
router.get("/", getCourses);
router.get("/:courseId", getCourse);

export default router;
