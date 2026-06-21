import { useEffect, useState, useCallback } from "react";
import { fetchTasks, type Task } from "@/lib/task-api";
import { TaskSummaryCards, TaskSummaryCardsSkeleton } from "@/components/tasks/task-summary-cards";
import { TaskTable, TaskTableSkeleton } from "@/components/tasks/task-table";

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTasks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchTasks();
            setTasks(data);
        } catch {
            setError("Failed to load tasks. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    if (loading) {
        return (
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4 lg:px-6">
                            <TaskSummaryCardsSkeleton />
                        </div>
                        <TaskTableSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
                        <p className="text-destructive">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                        <TaskSummaryCards tasks={tasks} />
                    </div>
                    <TaskTable tasks={tasks} onMutate={loadTasks} />
                </div>
            </div>
        </div>
    );
}
