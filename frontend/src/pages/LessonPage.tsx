import * as React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchApi } from "@/lib/api";
import { LessonViewer } from "@/features/lesson/components/LessonViewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, Lock, Circle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { TutorFloatingButton } from "@/features/tutor/components/TutorFloatingButton";
import { CourseTutorDrawer } from "@/features/tutor/components/CourseTutorDrawer";

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
    AVAILABLE: { icon: Circle, color: "text-bauhaus-blue" },
    IN_PROGRESS: { icon: Play, color: "text-bauhaus-yellow" },
    COMPLETED: { icon: CheckCircle2, color: "text-success" },
} as const;

export function LessonPage() {
    const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = React.useState<CourseHeader | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [isTutorOpen, setIsTutorOpen] = React.useState(false);

    const currentLesson = course?.lessons.find((l) => l.id === lessonId);

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
        return <div className="p-12 text-center text-destructive text-sm font-mono uppercase">Invalid URL parameters</div>;
    }

    return (
        <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden bg-background border-t border-border">
            {/* Sidebar — Curriculum List */}
            <div className="w-80 border-r border-border bg-card flex flex-col shrink-0 hidden md:flex">
                {/* Sidebar header */}
                <div className="p-4 flex items-center gap-4 border-b border-border bg-muted/20">
                    <button
                        onClick={() => navigate(`/courses/${courseId}`)}
                        className="size-8 rounded-none border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors cursor-pointer shrink-0"
                    >
                        <ArrowLeft className="size-4 text-foreground" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                            Curriculum
                        </div>
                        {loading ? (
                            <Skeleton className="h-4 w-28 rounded-none" />
                        ) : (
                            <div className="text-sm font-semibold text-foreground truncate">
                                {course?.title}
                            </div>
                        )}
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="flex flex-col border-b border-border">
                        {loading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="p-4 border-b border-border last:border-b-0">
                                    <Skeleton className="h-4 w-full rounded-none" />
                                </div>
                            ))
                            : course?.lessons.map((lesson, i) => {
                                const isActive = lesson.id === lessonId;
                                const isClickable = lesson.status !== "LOCKED";
                                const StatusIcon = statusConfig[lesson.status].icon;

                                const content = (
                                    <div
                                        className={cn(
                                            "flex items-center gap-4 px-4 py-4 border-b border-border last:border-b-0 text-sm transition-colors",
                                            isActive
                                                ? "bg-foreground text-background"
                                                : "bg-card text-foreground hover:bg-muted/50",
                                            !isClickable && "opacity-40 cursor-not-allowed hover:bg-card"
                                        )}
                                    >
                                        <StatusIcon
                                            className={cn(
                                                "size-4 shrink-0",
                                                isActive ? "text-background" : statusConfig[lesson.status].color
                                            )}
                                        />
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="truncate font-medium">
                                                {lesson.order.toString().padStart(2, '0')}. {lesson.title}
                                            </span>
                                        </div>
                                    </div>
                                );

                                if (isClickable) {
                                    return (
                                        <Link key={lesson.id} to={`/courses/${courseId}/lessons/${lesson.id}`} className="block">
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
                <div className="md:hidden border-b border-border p-4 flex items-center gap-4 bg-muted/20">
                    <button
                        onClick={() => navigate(`/courses/${courseId}`)}
                        className="size-8 border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="size-4 text-foreground" />
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

            {/* AI Course Tutor Floating Action & Drawer */}
            <TutorFloatingButton
                isOpen={isTutorOpen}
                onToggle={() => setIsTutorOpen((prev) => !prev)}
            />
            <CourseTutorDrawer
                isOpen={isTutorOpen}
                onClose={() => setIsTutorOpen(false)}
                courseId={courseId}
                courseTitle={course?.title}
                lessonId={lessonId}
                lessonTitle={currentLesson?.title}
            />
        </div>
    );
}
