import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BookOpen,
    Calendar,
    CheckCircle2,
    Lock,
    Circle,
    Play,
    AlertCircle,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Lesson {
    id: string;
    title: string;
    order: number;
    status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
    generationStatus: "NOT_GENERATED" | "GENERATING" | "GENERATED" | "FAILED";
    content: string | null;
}

interface CourseDetail {
    id: string;
    title: string;
    description: string | null;
    durationDays: number;
    status: "GENERATING" | "ACTIVE" | "COMPLETED" | "FAILED";
    lessons: Lesson[];
    createdAt: string;
    updatedAt: string;
}

const statusConfig = {
    LOCKED: { icon: Lock, label: "Locked", color: "text-zinc-400", bg: "bg-zinc-100" },
    AVAILABLE: { icon: Circle, label: "Available", color: "text-blue-500", bg: "bg-blue-50" },
    IN_PROGRESS: { icon: Play, label: "In Progress", color: "text-amber-500", bg: "bg-amber-50" },
    COMPLETED: { icon: CheckCircle2, label: "Completed", color: "text-emerald-500", bg: "bg-emerald-50" },
} as const;

export function CourseDetailsPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = React.useState<CourseDetail | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!courseId) return;

        const loadCourse = async () => {
            setLoading(true);
            try {
                const data = await fetchApi<CourseDetail>(`/api/courses/${courseId}`);
                setCourse(data);
                setError(null);
            } catch (err: any) {
                console.error("Failed to load course:", err);
                setError(err.message || "Failed to load course.");
            } finally {
                setLoading(false);
            }
        };

        loadCourse();
    }, [courseId]);

    const completedLessons = course?.lessons?.filter(l => l.status === "COMPLETED").length || 0;
    const totalLessons = course?.lessons?.length || 0;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    if (loading) {
        return (
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-md" />
                    <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-32 w-full rounded-lg" />
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
                <Card className="bg-white border border-zinc-200/80 shadow-none rounded-lg">
                    <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
                        <div className="size-10 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertCircle className="size-5 text-red-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-base font-bold text-zinc-900">Course not found</h2>
                            <p className="text-xs text-zinc-500">{error || "This course doesn't exist or you don't have access."}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/courses")}
                            className="text-xs"
                        >
                            Go to My Courses
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            {/* Course Header Card */}
            <Card className="bg-white border border-zinc-200/80 shadow-none rounded-lg overflow-hidden">
                <CardHeader className="p-6 pb-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1.5 min-w-0">
                            <CardTitle className="text-lg font-bold text-zinc-900 leading-snug">
                                {course.title}
                            </CardTitle>
                            <CardDescription className="text-xs text-zinc-500 font-normal leading-relaxed">
                                {course.description || "No description provided."}
                            </CardDescription>
                        </div>
                        <Badge
                            variant={course.status === "COMPLETED" ? "default" : course.status === "FAILED" ? "destructive" : "secondary"}
                            className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full shrink-0"
                        >
                            {course.status}
                        </Badge>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            <span>{course.durationDays} day plan</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <BookOpen className="size-3" />
                            <span>{totalLessons} lessons</span>
                        </div>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="p-6 pt-4 flex flex-col gap-2">
                    {/* Progress */}
                    <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        <span>Overall Progress</span>
                        <span className="text-zinc-700 font-bold tabular-nums">
                            {completedLessons}/{totalLessons} completed ({progressPercent}%)
                        </span>
                    </div>
                    <Progress value={progressPercent} className="h-1.5 bg-zinc-100">
                        <div
                            className="h-full bg-zinc-900 transition-all rounded-full"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </Progress>
                </CardContent>
            </Card>

            {/* Lesson List */}
            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                    Curriculum
                </h3>

                <div className="flex flex-col gap-2">
                    {course.lessons.map((lesson) => {
                        const config = statusConfig[lesson.status];
                        const StatusIcon = config.icon;
                        const isClickable = lesson.status !== "LOCKED";

                        return (
                            <Card
                                key={lesson.id}
                                className={cn(
                                    "bg-white border border-zinc-200/80 shadow-none rounded-lg transition-all duration-150",
                                    isClickable && "hover:border-zinc-300 hover:shadow-sm cursor-pointer",
                                    lesson.status === "LOCKED" && "opacity-60",
                                )}
                            >
                                <CardContent className="p-4 flex items-center gap-4">
                                    {/* Order number */}
                                    <div className={cn(
                                        "size-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                                        config.bg, config.color,
                                    )}>
                                        {lesson.order}
                                    </div>

                                    {/* Title + status */}
                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                        <span className="text-sm font-semibold text-zinc-900 truncate">
                                            {lesson.title}
                                        </span>
                                        <span className={cn("text-[10px] font-medium uppercase tracking-wider flex items-center gap-1", config.color)}>
                                            <StatusIcon className="size-3" />
                                            {config.label}
                                        </span>
                                    </div>

                                    {/* Action indicator */}
                                    {isClickable && (
                                        <Badge
                                            variant="secondary"
                                            className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full shrink-0"
                                        >
                                            {lesson.status === "COMPLETED" ? "Review" : "Start"}
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
