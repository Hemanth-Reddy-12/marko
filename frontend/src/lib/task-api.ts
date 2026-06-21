export type TaskType = "TIMED" | "FLEXIBLE";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TaskSource = "MANUAL" | "JSON" | "AI";
export type CreatedBy = "USER" | "AI_AGENT";

export interface Task {
    id: string;
    title: string;
    description: string | null;
    type: TaskType;
    taskStatus: TaskStatus;
    priority: Priority;
    startDate: string | null;
    dueDate: string | null;
    taskSource: TaskSource;
    createdBy: CreatedBy;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

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

import { request } from "./api";

export async function fetchTasks(): Promise<Task[]> {
    return request<Task[]>("/tasks", { method: "GET" });
}

export async function fetchTaskById(id: string): Promise<Task> {
    return request<Task>(`/tasks/${id}`, { method: "GET" });
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
    return request<Task>("/tasks", { method: "POST", body: JSON.stringify(input) });
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    return request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export async function deleteTask(id: string): Promise<void> {
    await request<void>(`/tasks/${id}`, { method: "DELETE" });
}
