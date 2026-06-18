import { Router } from "express";
import { validateCreateTask, validateUpdateTask } from "./task.validate.js";
import {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
} from "./task.controller.js";

const taskRouter = Router();

taskRouter.get("/", getAllTasks);
taskRouter.get("/:id", getTaskById);
taskRouter.post("/", validateCreateTask, createTask);
taskRouter.put("/:id", validateUpdateTask, updateTask);
taskRouter.delete("/:id", deleteTask);

export default taskRouter;
