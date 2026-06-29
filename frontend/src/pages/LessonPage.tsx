import * as React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchApi } from "@/lib/api";
import { LessonViewer } from "@/features/lesson/components/LessonViewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, Lock, Circle, Play, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
    LOCKED: { icon: Lock, color: "text-zinc-400" },
    AVAILABLE: { icon: Circle, color: "text-blue-500" },
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
                // Fetch course info to render the sidebar list
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
        return <div className="p-8 text-center text-red-500">Invalid URL parameters</div>;
    }

    return (
        <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden bg-white border border-zinc-200/80 shadow-none rounded-xl">
            {/* Sidebar / Curriculum List */}
            <div className="w-80 border-r border-zinc-200/80 bg-zinc-50/50 flex flex-col shrink-0 hidden md:flex">
                <div className="p-4 flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/courses/${courseId}`)}
                        className="size-11 rounded-full flex items-center justify-center hover:bg-zinc-200 transition-colors"
                    >
                        <ArrowLeft className="size-5 text-zinc-600" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            Course Curriculum
                        </div>
                        {loading ? (
                            <Skeleton className="h-4 w-32 mt-1" />
                        ) : (
                            <div className="text-sm font-semibold text-zinc-900 truncate">
                                {course?.title}
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                <ScrollArea className="flex-1">
                    <div className="p-4 flex flex-col gap-1">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-md" />
                            ))
                        ) : (
                            course?.lessons.map((lesson) => {
                                const isActive = lesson.id === lessonId;
                                const isClickable = lesson.status !== "LOCKED";
                                const StatusIcon = statusConfig[lesson.status].icon;

                                const content = (
                                    <div
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg text-sm transition-all",
                                            isActive ? "bg-zinc-900 text-white" : "hover:bg-zinc-100",
                                            !isClickable && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                        )}
                                    >
                                        <StatusIcon
                                            className={cn(
                                                "size-4 shrink-0",
                                                isActive ? "text-white" : statusConfig[lesson.status].color
                                            )}
                                        />
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="truncate font-medium">
                                                {lesson.order}. {lesson.title}
                                            </span>
                                        </div>
                                    </div>
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
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content Viewer */}
            <div className="flex-1 flex flex-col h-full bg-white relative">
                {/* Mobile Back Button */}
                <div className="md:hidden border-b border-zinc-200/80 p-3 flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/courses/${courseId}`)}
                        className="size-11 rounded-full flex items-center justify-center hover:bg-zinc-100"
                    >
                        <ArrowLeft className="size-5 text-zinc-600" />
                    </button>
                    <span className="text-sm font-semibold truncate flex-1">
                        {course?.title || "Loading..."}
                    </span>
                </div>

                <ScrollArea className="flex-1">
                    {(() => {
                        const currentLessonIndex = course?.lessons.findIndex(l => l.id === lessonId) ?? -1;
                        const nextLesson = course && currentLessonIndex !== -1 && currentLessonIndex < course.lessons.length - 1
                            ? course.lessons[currentLessonIndex + 1]
                            : null;

                        return (
                            <LessonViewer
                                courseId={courseId}
                                lessonId={lessonId}
                                key={lessonId}
                                nextLessonId={nextLesson?.status !== "LOCKED" ? nextLesson?.id : undefined}
                                nextLessonTitle={nextLesson?.title}
                                onNext={(nextId) => navigate(`/courses/${courseId}/lessons/${nextId}`)}
                            />
                        );
                    })()}
                </ScrollArea>
            </div>
        </div>
    );
}
