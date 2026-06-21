import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { streamChat } from "./chat.controller.js";

const chatRouter = Router();

chatRouter.use(authMiddleware);

chatRouter.post("/stream", streamChat);

export default chatRouter;
