import * as React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchApi } from "@/lib/api";
import { LessonViewer } from "@/features/lesson/components/LessonViewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, Lock, Circle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CourseHeader {
    id: string;
    title: string;
    lessons: {
        id: string;
        title: string;
        order: number;
        status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
    }[];
}

const statusConfig = {
    LOCKED: { icon: Lock, color: "text-muted-foreground/40" },
    AVAILABLE: { icon: Circle, color: "text-accent" },
    IN_PROGRESS: { icon: Play, color: "text-amber-500" },
    COMPLETED: { icon: CheckCircle2, color: "text-emerald-500" },
} as const;

export function LessonPage() {
    const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = React.useState<CourseHeader | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!courseId) return;
        const loadCourseInfo = async () => {
            try {
                const data = await fetchApi<CourseHeader>(`/api/courses/${courseId}`);
                setCourse(data);
            } catch (err) {
                console.error("Failed to load course sidebar info", err);
            } finally {
                setLoading(false);
            }
        };
        loadCourseInfo();
    }, [courseId]);

    if (!courseId || !lessonId) {
        return <div className="p-8 text-center text-destructive text-sm">Invalid URL parameters</div>;
    }

    return (
        <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden bg-card border border-border shadow-none rounded-2xl">
            {/* Sidebar — Curriculum List */}
            <div className="w-72 border-r border-border bg-muted/20 flex flex-col shrink-0 hidden md:flex">
                {/* Sidebar header */}
                <div className="p-3 flex items-center gap-2.5 border-b border-border">
                    <button
                        onClick={() => navigate(`/courses/${courseId}`)}
                        className="size-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer shrink-0"
                    >
                        <ArrowLeft className="size-4 text-muted-foreground" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Curriculum
                        </div>
                        {loading ? (
                            <Skeleton className="h-3.5 w-28 mt-1" />
                        ) : (
                            <div className="text-xs font-semibold text-foreground truncate">
                                {course?.title}
                            </div>
                        )}
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2 flex flex-col gap-0.5">
                        {loading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-11 w-full rounded-xl" />
                            ))
                            : course?.lessons.map((lesson, i) => {
                                const isActive = lesson.id === lessonId;
                                const isClickable = lesson.status !== "LOCKED";
                                const StatusIcon = statusConfig[lesson.status].icon;

                                const content = (
                                    <motion.div
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.25, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                                        className={cn(
                                            "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all duration-200",
                                            isActive
                                                ? "bg-accent text-white shadow-sm"
                                                : "hover:bg-muted/60 text-foreground",
                                            !isClickable && "opacity-40 cursor-not-allowed hover:bg-transparent"
                                        )}
                                    >
                                        <StatusIcon
                                            className={cn(
                                                "size-3.5 shrink-0",
                                                isActive ? "text-white" : statusConfig[lesson.status].color
                                            )}
                                        />
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="truncate font-medium leading-tight">
                                                {lesson.order}. {lesson.title}
                                            </span>
                                        </div>
                                    </motion.div>
                                );

                                if (isClickable) {
                                    return (
                                        <Link key={lesson.id} to={`/courses/${courseId}/lessons/${lesson.id}`}>
                                            {content}
                                        </Link>
                                    );
                                }

                                return <div key={lesson.id}>{content}</div>;
                            })
                        }
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full bg-card relative min-w-0">
                {/* Mobile back button */}
                <div className="md:hidden border-b border-border p-3 flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/courses/${courseId}`)}
                        className="size-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="size-4 text-muted-foreground" />
                    </button>
                    <span className="text-sm font-semibold truncate flex-1 text-foreground">
                        {course?.title || "Loading…"}
                    </span>
                </div>

                <ScrollArea className="flex-1">
                    <LessonViewer
                        courseId={courseId}
                        lessonId={lessonId}
                        key={lessonId}
                        onNext={() => navigate(`/courses/${courseId}/lessons/${lessonId}/quiz`)}
                    />
                </ScrollArea>
            </div>
        </div>
    );
}
