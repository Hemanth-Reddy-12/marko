import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { validateCreateTask, validateUpdateTask } from "./task.validate.js";
import {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
} from "./task.controller.js";

const taskRouter = Router();

taskRouter.use(authMiddleware);

taskRouter.get("/", getAllTasks);
taskRouter.get("/:id", getTaskById);
taskRouter.post("/", validateCreateTask, createTask);
taskRouter.put("/:id", validateUpdateTask, updateTask);
taskRouter.delete("/:id", deleteTask);

export default taskRouter;
