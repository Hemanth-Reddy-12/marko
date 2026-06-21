import type { Task, TaskType, TaskStatus, Priority, TaskSource, CreatedBy } from "../../generated/prisma/index.js";

export type { Task, TaskType, TaskStatus, Priority, TaskSource, CreatedBy };

export interface CreateTaskInput {
  title: string;
  description?: string;
  type: TaskType;
  taskStatus: TaskStatus;
  priority: Priority;
  startDate?: string;
  dueDate?: string;
  taskSource: TaskSource;
  createdBy: CreatedBy;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  type?: TaskType;
  taskStatus?: TaskStatus;
  priority?: Priority;
  startDate?: string | null;
  dueDate?: string | null;
  taskSource?: TaskSource;
  createdBy?: CreatedBy;
}
