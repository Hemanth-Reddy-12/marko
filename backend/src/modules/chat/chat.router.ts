import { Router } from "express";
import { initInterview, getInterviews, getSessionMessages, postSessionMessage } from "./chat.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const chatRouter = Router();

chatRouter.use(authMiddleware);

chatRouter.post("/", initInterview);
chatRouter.get("/", getInterviews);
chatRouter.get("/sessions/:sessionId/messages", getSessionMessages);
chatRouter.post("/sessions/:sessionId/messages", postSessionMessage);

export default chatRouter;
