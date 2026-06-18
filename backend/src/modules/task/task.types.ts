import type { Task, TaskType, TaskStatus, Priority, TaskSource, CreatedBy } from "../../generated/prisma/index.js";

export type { Task, TaskType, TaskStatus, Priority, TaskSource, CreatedBy };

export interface CreateTaskInput {
  title: string;
  description?: string;
  notes?: string;
  type: TaskType;
  taskStatus: TaskStatus;
  priority: Priority;
  taskSource: TaskSource;
  createdBy: CreatedBy;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  notes?: string;
  type?: TaskType;
  taskStatus?: TaskStatus;
  priority?: Priority;
  taskSource?: TaskSource;
  createdBy?: CreatedBy;
}
