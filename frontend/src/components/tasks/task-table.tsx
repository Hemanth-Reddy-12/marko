import * as React from "react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type RowSelectionState,
    type SortingState,
    type VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    CheckCircleIcon,
    SpinnerIcon,
    DotsThreeVerticalIcon,
    ColumnsIcon,
    CaretDownIcon,
    PlusIcon,
    CaretDoubleLeftIcon,
    CaretLeftIcon,
    CaretRightIcon,
    CaretDoubleRightIcon,
    TrashIcon,
    CalendarIcon,
    XIcon,
    UserIcon,
    RobotIcon,
} from "@phosphor-icons/react";
import {
    type Task,
    type CreateTaskInput,
    type TaskType,
    type TaskStatus,
    type Priority,
    createTask,
    updateTask,
    deleteTask,
} from "@/lib/task-api";

const TASK_TYPE_OPTIONS: { label: string; value: TaskType }[] = [
    { label: "Timed", value: "TIMED" },
    { label: "Flexible", value: "FLEXIBLE" },
];

const TASK_STATUS_OPTIONS: { label: string; value: TaskStatus }[] = [
    { label: "Pending", value: "PENDING" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "COMPLETED" },
];

const PRIORITY_OPTIONS: { label: string; value: Priority }[] = [
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
];



function DateRangePicker({
    dateRange,
    onChange,
}: {
    dateRange: { from: Date | undefined; to: Date | undefined };
    onChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}) {
    const [open, setOpen] = React.useState(false);

    const label =
        dateRange.from && dateRange.to
            ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
            : dateRange.from
              ? `${format(dateRange.from, "MMM d")}`
              : "Date range";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <Button variant="outline" size="sm" className="gap-1.5" />
                }
            >
                <CalendarIcon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
                {dateRange.from && (
                    <span
                        role="button"
                        tabIndex={0}
                        className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange({ from: undefined, to: undefined });
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                onChange({ from: undefined, to: undefined });
                            }
                        }}
                    >
                        <XIcon className="size-3" />
                    </span>
                )}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                        onChange({
                            from: range?.from,
                            to: range?.to,
                        });
                        if (range?.to) setOpen(false);
                    }}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
    );
}

function TaskActions({
    task,
    onMutate,
}: {
    task: Task;
    onMutate?: () => void;
}) {
    const [open, setOpen] = React.useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        className="flex size-8 text-muted-foreground data-open:bg-muted"
                        size="icon"
                    />
                }
            >
                <DotsThreeVerticalIcon />
                <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                    onClick={() => {
                        navigator.clipboard.writeText(task.id);
                        toast.success("Task ID copied");
                    }}
                >
                    Copy ID
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={async () => {
                        const nextStatus: Record<TaskStatus, TaskStatus> = {
                            PENDING: "IN_PROGRESS",
                            IN_PROGRESS: "COMPLETED",
                            COMPLETED: "PENDING",
                        };
                        try {
                            await updateTask(task.id, {
                                taskStatus: nextStatus[task.taskStatus],
                            });
                            toast.success("Status updated");
                            onMutate?.();
                        } catch {
                            toast.error("Failed to update status");
                        }
                    }}
                >
                    Advance Status
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={async () => {
                        try {
                            await deleteTask(task.id);
                            toast.success("Task deleted");
                            onMutate?.();
                        } catch {
                            toast.error("Failed to delete task");
                        }
                    }}
                    variant="destructive"
                >
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function TaskDetailSheet({ task }: { task: Task }) {
    return (
        <Sheet>
            <SheetTrigger
                render={
                    <Button
                        variant="link"
                        className="h-auto w-fit px-0 text-left text-foreground"
                    />
                }
            >
                {task.title}
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{task.title}</SheetTitle>
                    <SheetDescription>
                        Task details and information
                    </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 px-4 text-sm">
                    {task.description && (
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground">
                                Description
                            </Label>
                            <p>{task.description}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground">
                                Type
                            </Label>
                            <Badge variant="outline" className="w-fit">
                                {task.type === "TIMED" ? "Timed" : "Flexible"}
                            </Badge>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground">
                                Status
                            </Label>
                            <Badge variant="outline" className="w-fit">
                                {task.taskStatus === "COMPLETED" ? (
                                    <CheckCircleIcon className="fill-green-500 dark:fill-green-400" />
                                ) : task.taskStatus === "IN_PROGRESS" ? (
                                    <SpinnerIcon />
                                ) : null}
                                {task.taskStatus === "PENDING"
                                    ? "Pending"
                                    : task.taskStatus === "IN_PROGRESS"
                                      ? "In Progress"
                                      : "Completed"}
                            </Badge>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground">
                                Priority
                            </Label>
                            <Badge
                                variant="outline"
                                className={`w-fit ${
                                    task.priority === "HIGH"
                                        ? "text-red-600 dark:text-red-400"
                                        : task.priority === "MEDIUM"
                                          ? "text-yellow-600 dark:text-yellow-400"
                                          : ""
                                }`}
                            >
                                {task.priority === "HIGH"
                                    ? "High"
                                    : task.priority === "MEDIUM"
                                      ? "Medium"
                                      : "Low"}
                            </Badge>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground">
                                Source
                            </Label>
                            <Badge variant="outline" className="w-fit">
                                {task.taskSource === "MANUAL"
                                    ? "Manual"
                                    : task.taskSource === "JSON"
                                      ? "JSON"
                                      : "AI"}
                            </Badge>
                        </div>
                    </div>
                    {task.type === "TIMED" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-muted-foreground">
                                    Start Date
                                </Label>
                                <span>
                                    {task.startDate
                                        ? new Date(
                                              task.startDate,
                                          ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                          })
                                        : "Not set"}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-muted-foreground">
                                    Due Date
                                </Label>
                                <span>
                                    {task.dueDate
                                        ? new Date(
                                              task.dueDate,
                                          ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                          })
                                        : "Not set"}
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground">
                                Created By
                            </Label>
                            <span>
                                {task.createdBy === "USER"
                                    ? "User"
                                    : "AI Agent"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground">
                                Created At
                            </Label>
                            <span>
                                {new Date(task.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    },
                                )}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-muted-foreground">
                            Last Updated
                        </Label>
                        <span>
                            {new Date(task.updatedAt).toLocaleDateString(
                                "en-US",
                                {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                },
                            )}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-muted-foreground">Task ID</Label>
                        <span className="font-mono text-xs break-all">
                            {task.id}
                        </span>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function AddTaskSheet({ onCreated }: { onCreated: () => void }) {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [type, setType] = React.useState<TaskType>("FLEXIBLE");
    const [priority, setPriority] = React.useState<Priority>("MEDIUM");
    const [startDate, setStartDate] = React.useState("");
    const [dueDate, setDueDate] = React.useState("");

    function resetForm() {
        setTitle("");
        setDescription("");
        setType("FLEXIBLE");
        setPriority("MEDIUM");
        setStartDate("");
        setDueDate("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }
        setLoading(true);
        try {
            const input: CreateTaskInput = {
                title: title.trim(),
                description: description.trim() || undefined,
                type,
                taskStatus: "PENDING",
                priority,
                startDate: startDate || undefined,
                dueDate: dueDate || undefined,
                taskSource: "MANUAL",
                createdBy: "USER",
            };
            await createTask(input);
            toast.success("Task created successfully");
            resetForm();
            setOpen(false);
            onCreated();
        } catch {
            toast.error("Failed to create task");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Sheet
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (!v) resetForm();
            }}
        >
            <SheetTrigger render={<Button size="sm" />}>
                <PlusIcon />
                <span className="hidden lg:inline">Add Task</span>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Create New Task</SheetTitle>
                    <SheetDescription>
                        Fill in the details to add a new task to your workspace
                    </SheetDescription>
                </SheetHeader>
                <form
                    className="flex flex-col gap-4 px-4 text-sm"
                    onSubmit={handleSubmit}
                >
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="task-title">Title</Label>
                        <Input
                            id="task-title"
                            placeholder="Enter task title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="task-description">Description</Label>
                        <Input
                            id="task-description"
                            placeholder="Brief description of the task"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    {type === "TIMED" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="task-start-date">
                                    Start Date
                                </Label>
                                <Input
                                    id="task-start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="task-due-date">Due Date</Label>
                                <Input
                                    id="task-due-date"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="task-type">Type</Label>
                        <Select
                            value={type}
                            onValueChange={(v) => {
                                setType(v as TaskType);
                                if (v !== "TIMED") {
                                    setStartDate("");
                                    setDueDate("");
                                }
                            }}
                            items={TASK_TYPE_OPTIONS}
                        >
                            <SelectTrigger id="task-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {TASK_TYPE_OPTIONS.map((o) => (
                                        <SelectItem
                                            key={o.value}
                                            value={o.value}
                                        >
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="task-priority">Priority</Label>
                        <Select
                            value={priority}
                            onValueChange={(v) =>
                                setPriority(v as Priority)
                            }
                            items={PRIORITY_OPTIONS}
                        >
                            <SelectTrigger id="task-priority">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {PRIORITY_OPTIONS.map((o) => (
                                        <SelectItem
                                            key={o.value}
                                            value={o.value}
                                        >
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <SheetFooter className="flex-row gap-2 pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Task"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

interface TaskTableProps {
    tasks: Task[];
    onMutate: () => void;
    filter?: "all" | "completed" | "incomplete";
}

export function TaskTable({ tasks, onMutate, filter = "all" }: TaskTableProps) {
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({
            taskSource: false,
            createdAt: false,
        });
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
        {},
    );
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [dateRange, setDateRange] = React.useState<{
        from: Date | undefined;
        to: Date | undefined;
    }>({ from: undefined, to: undefined });

    const filteredData = React.useMemo(() => {
        let data = tasks;
        if (filter === "completed")
            data = data.filter((t) => t.taskStatus === "COMPLETED");
        if (filter === "incomplete")
            data = data.filter((t) => t.taskStatus !== "COMPLETED");
        if (dateRange.from || dateRange.to) {
            data = data.filter((t) => {
                const dueStr = t.dueDate;
                if (!dueStr) return false;
                const due = new Date(dueStr);
                if (dateRange.from && due < dateRange.from) return false;
                if (dateRange.to) {
                    const toEnd = new Date(dateRange.to);
                    toEnd.setHours(23, 59, 59, 999);
                    if (due > toEnd) return false;
                }
                return true;
            });
        }
        return data;
    }, [tasks, filter, dateRange]);

    const selectedCount = Object.keys(rowSelection).filter(
        (k) => rowSelection[k],
    ).length;

    async function handleBulkDelete() {
        const ids = Object.keys(rowSelection).filter((k) => rowSelection[k]);
        if (!ids.length) return;
        let ok = 0;
        let fail = 0;
        await Promise.all(
            ids.map((id) =>
                deleteTask(id)
                    .then(() => ok++)
                    .catch(() => fail++),
            ),
        );
        if (ok > 0) toast.success(`${ok} task${ok > 1 ? "s" : ""} deleted`);
        if (fail > 0)
            toast.error(`${fail} task${fail > 1 ? "s" : ""} failed to delete`);
        setRowSelection({});
        onMutate();
    }

    async function handleBulkStatusChange(status: TaskStatus) {
        const ids = Object.keys(rowSelection).filter((k) => rowSelection[k]);
        if (!ids.length) return;
        let ok = 0;
        let fail = 0;
        await Promise.all(
            ids.map((id) =>
                updateTask(id, { taskStatus: status })
                    .then(() => ok++)
                    .catch(() => fail++),
            ),
        );
        const label =
            status === "PENDING"
                ? "Pending"
                : status === "IN_PROGRESS"
                  ? "In Progress"
                  : "Completed";
        if (ok > 0)
            toast.success(`${ok} task${ok > 1 ? "s" : ""} set to ${label}`);
        if (fail > 0) toast.error(`${fail} task${fail > 1 ? "s" : ""} failed`);
        setRowSelection({});
        onMutate();
    }

    const tableColumns = React.useMemo<ColumnDef<Task>[]>(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected()
                                ? true
                                : table.getIsSomePageRowsSelected()
                                  ? undefined
                                  : false
                        }
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                enableColumnFilter: false,
            },
            {
                accessorKey: "title",
                header: "Title",
                cell: ({ row }) => <TaskDetailSheet task={row.original} />,
                enableHiding: false,
            },
            {
                accessorKey: "createdBy",
                header: "Source",
                filterFn: "equals",
                cell: ({ row }) => (
                    <span className="inline-flex items-center gap-1">
                        {row.original.createdBy === "USER" ? (
                            <UserIcon className="size-4" />
                        ) : (
                            <RobotIcon className="size-4" />
                        )}
                        {row.original.createdBy === "USER" ? "User" : "AI Agent"}
                    </span>
                ),
            },
            {
                accessorKey: "taskStatus",
                header: "Status",
                filterFn: "equals",
                cell: ({ row }) => (
                    <Badge
                        variant="outline"
                        className="px-1.5 text-muted-foreground"
                    >
                        {row.original.taskStatus === "COMPLETED" ? (
                            <CheckCircleIcon className="fill-green-500 dark:fill-green-400" />
                        ) : row.original.taskStatus === "IN_PROGRESS" ? (
                            <SpinnerIcon />
                        ) : null}
                        {row.original.taskStatus === "PENDING"
                            ? "Pending"
                            : row.original.taskStatus === "IN_PROGRESS"
                              ? "In Progress"
                              : "Completed"}
                    </Badge>
                ),
            },
            {
                accessorKey: "priority",
                header: "Priority",
                filterFn: "equals",
                cell: ({ row }) => {
                    const p = row.original.priority;
                    const color =
                        p === "HIGH"
                            ? "text-red-600 dark:text-red-400"
                            : p === "MEDIUM"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-muted-foreground";
                    return (
                        <span className={`font-medium ${color}`}>
                            {p === "HIGH"
                                ? "High"
                                : p === "MEDIUM"
                                  ? "Medium"
                                  : "Low"}
                        </span>
                    );
                },
            },
            {
                accessorKey: "startDate",
                header: "Start",
                cell: ({ row }) => (
                    <span className="text-muted-foreground">
                        {row.original.type !== "TIMED"
                            ? "-"
                            : row.original.startDate
                              ? new Date(
                                    row.original.startDate,
                                ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                              : "-"}
                    </span>
                ),
            },
            {
                accessorKey: "dueDate",
                header: "Due",
                cell: ({ row }) => (
                    <span className="text-muted-foreground">
                        {row.original.type !== "TIMED"
                            ? "-"
                            : row.original.dueDate
                              ? new Date(
                                    row.original.dueDate,
                                ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                              : "-"}
                    </span>
                ),
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                cell: ({ row }) => (
                    <span className="text-muted-foreground">
                        {new Date(row.original.createdAt).toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            },
                        )}
                    </span>
                ),
            },
            {
                id: "actions",
                cell: ({ row }) => (
                    <TaskActions task={row.original} onMutate={onMutate} />
                ),
            },
        ],
        [onMutate],
    );

    const table = useReactTable({
        data: filteredData,
        columns: tableColumns,
        state: {
            sorting,
            columnVisibility,
            columnFilters,
            rowSelection,
            pagination,
        },
        enableRowSelection: true,
        getRowId: (row) => row.id,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="w-full flex-col justify-start gap-6 py-4">
            <div className="flex flex-col gap-2 px-4 lg:px-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Input
                        placeholder="Search tasks..."
                        value={
                            (table
                                .getColumn("title")
                                ?.getFilterValue() as string) ?? ""
                        }
                        onChange={(e) =>
                            table
                                .getColumn("title")
                                ?.setFilterValue(e.target.value)
                        }
                        className="max-w-sm"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        {selectedCount > 0 && (
                            <>
                                <span className="text-sm text-muted-foreground">
                                    {selectedCount} selected
                                </span>
                                <Select
                                    onValueChange={(v) =>
                                        handleBulkStatusChange(v as TaskStatus)
                                    }
                                    items={TASK_STATUS_OPTIONS}
                                >
                                    <SelectTrigger
                                        size="sm"
                                        className="w-[130px]"
                                    >
                                        <SelectValue placeholder="Set Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TASK_STATUS_OPTIONS.map((o) => (
                                            <SelectItem
                                                key={o.value}
                                                value={o.value}
                                            >
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                >
                                    <TrashIcon className="size-4" />
                                    <span className="hidden sm:inline">
                                        Delete
                                    </span>
                                </Button>
                            </>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={<Button variant="outline" size="sm" />}
                            >
                                <ColumnsIcon data-icon="inline-start" />
                                Columns
                                <CaretDownIcon data-icon="inline-end" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                                {table
                                    .getAllColumns()
                                    .filter(
                                        (column) =>
                                            typeof column.accessorFn !==
                                                "undefined" &&
                                            column.getCanHide(),
                                    )
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AddTaskSheet onCreated={onMutate} />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        value={
                            (table
                                .getColumn("taskStatus")
                                ?.getFilterValue() as string) ?? "all"
                        }
                        onValueChange={(v) =>
                            table
                                .getColumn("taskStatus")
                                ?.setFilterValue(v === "all" ? undefined : v)
                        }
                        items={[
                            { label: "All Status", value: "all" },
                            ...TASK_STATUS_OPTIONS,
                        ]}
                    >
                        <SelectTrigger size="sm" className="w-[130px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {TASK_STATUS_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={
                            (table
                                .getColumn("priority")
                                ?.getFilterValue() as string) ?? "all"
                        }
                        onValueChange={(v) =>
                            table
                                .getColumn("priority")
                                ?.setFilterValue(v === "all" ? undefined : v)
                        }
                        items={[
                            { label: "All Priority", value: "all" },
                            ...PRIORITY_OPTIONS,
                        ]}
                    >
                        <SelectTrigger size="sm" className="w-[130px]">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priority</SelectItem>
                            {PRIORITY_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DateRangePicker
                        dateRange={dateRange}
                        onChange={setDateRange}
                    />
                </div>
            </div>
            <div className="overflow-hidden rounded-lg border mx-4 lg:mx-6 my-4">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={tableColumns.length}
                                    className="h-24 text-center"
                                >
                                    No tasks found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-4 lg:px-6">
                <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                    {filteredData.length} task
                    {filteredData.length !== 1 ? "s" : ""} total
                </div>
                <div className="flex w-full items-center gap-8 lg:w-fit">
                    <div className="hidden items-center gap-2 lg:flex">
                        <Label
                            htmlFor="rows-per-page"
                            className="text-sm font-medium"
                        >
                            Rows per page
                        </Label>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                            }}
                            items={[10, 20, 30, 40, 50].map((pageSize) => ({
                                label: `${pageSize}`,
                                value: `${pageSize}`,
                            }))}
                        >
                            <SelectTrigger
                                size="sm"
                                className="w-20"
                                id="rows-per-page"
                            >
                                <SelectValue
                                    placeholder={
                                        table.getState().pagination.pageSize
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent side="top">
                                <SelectGroup>
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem
                                            key={pageSize}
                                            value={`${pageSize}`}
                                        >
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-fit items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <CaretDoubleLeftIcon />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <CaretLeftIcon />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <CaretRightIcon />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 lg:flex"
                            size="icon"
                            onClick={() =>
                                table.setPageIndex(table.getPageCount() - 1)
                            }
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <CaretDoubleRightIcon />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TaskTableSkeleton() {
    return (
        <div className="w-full flex-col justify-start gap-6 py-4">
            <div className="flex flex-col gap-2 px-4 lg:px-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Skeleton className="h-9 w-full max-w-sm" />
                    <div className="flex flex-wrap items-center gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-28" />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-8 w-[130px]" />
                    <Skeleton className="h-8 w-[130px]" />
                    <Skeleton className="h-8 w-[130px]" />
                    <Skeleton className="h-8 w-32" />
                </div>
            </div>
            <div className="overflow-hidden rounded-lg border mx-4 lg:mx-6 my-4">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted">
                        <TableRow>
                            {Array.from({ length: 7 }).map((_, i) => (
                                <TableHead key={i}>
                                    <Skeleton className="h-4 w-16" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 7 }).map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-full max-w-24" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-4 lg:px-6">
                <Skeleton className="h-4 w-40 hidden lg:block" />
                <div className="flex w-full items-center gap-8 lg:w-fit">
                    <div className="hidden items-center gap-2 lg:flex">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="size-8" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
