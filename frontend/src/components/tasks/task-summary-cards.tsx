import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ClipboardTextIcon,
    CheckCircleIcon,
    ClockIcon,
} from "@phosphor-icons/react";
import type { Task } from "@/lib/task-api";

interface TaskSummaryCardsProps {
    tasks: Task[];
}

export function TaskSummaryCards({ tasks }: TaskSummaryCardsProps) {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.taskStatus === "COMPLETED").length;
    const incomplete = total - completed;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-3 dark:*:data-[slot=card]:bg-card">
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Total Tasks</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {total}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <ClipboardTextIcon />
                            All
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {completionRate}% completion rate
                    </div>
                    <div className="text-muted-foreground">
                        Across all priorities and categories
                    </div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Completed</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {completed}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <CheckCircleIcon className="fill-green-500 dark:fill-green-400" />
                            Done
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {completionRate > 0 ? "On track with goals" : "No tasks completed yet"}
                    </div>
                    <div className="text-muted-foreground">
                        Successfully delivered outcomes
                    </div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Incomplete</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {incomplete}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <ClockIcon />
                            Pending
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {incomplete > 0
                            ? `${incomplete} task${incomplete > 1 ? "s" : ""} awaiting action`
                            : "All tasks completed"}
                    </div>
                    <div className="text-muted-foreground">
                        Pending and in-progress items
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

export function TaskSummaryCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-3 dark:*:data-[slot=card]:bg-card">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="@container/card">
                    <CardHeader>
                        <CardDescription>
                            <Skeleton className="h-4 w-24" />
                        </CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            <Skeleton className="h-8 w-12" />
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                <Skeleton className="size-4" />
                                <Skeleton className="h-4 w-10" />
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-48" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
