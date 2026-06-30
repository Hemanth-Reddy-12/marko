import { Router } from "express";
import { initInterview } from "./chat.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const chatRouter = Router();

chatRouter.use(authMiddleware);

chatRouter.post("/", initInterview);

export default chatRouter;
