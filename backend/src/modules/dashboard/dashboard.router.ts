import { Router } from "express";
import { getDailySchedule, getActivityFeed, getUpcomingLessons, getUpcomingQuizzes, getQuizHistory, getRecentlyVisitedCourses, getCompletedLessons, getDashboardStats } from "./dashboard.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/schedule", getDailySchedule);
router.get("/activity", getActivityFeed);
router.get("/lessons/upcoming", getUpcomingLessons);
router.get("/lessons/completed", getCompletedLessons);
router.get("/quizzes/upcoming", getUpcomingQuizzes);
router.get("/quizzes/history", getQuizHistory);
router.get("/courses/recent", getRecentlyVisitedCourses);
router.get("/stats", getDashboardStats);

export default router;
