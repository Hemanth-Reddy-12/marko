import { Router } from "express";
import { initInterview, getInterviews } from "./chat.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const chatRouter = Router();

chatRouter.use(authMiddleware);

chatRouter.post("/", initInterview);
chatRouter.get("/", getInterviews);

export default chatRouter;
