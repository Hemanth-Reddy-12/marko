import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchApi } from "@/lib/api";
import { QuizInterface } from "@/features/quiz/components/QuizInterface";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen } from "lucide-react";
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

export function QuizPage() {
    const { courseId, lessonId } = useParams<{
        courseId: string;
        lessonId: string;
    }>();
    const navigate = useNavigate();
    const [course, setCourse] = React.useState<CourseHeader | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [progress, setProgress] = React.useState({ answered: 0, total: 0 });

    const handleProgressChange = React.useCallback(
        (answered: number, total: number) => {
            setProgress((prev) => {
                if (prev.answered === answered && prev.total === total) return prev;
                return { answered, total };
            });
        },
        [],
    );

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

    const handleContinue = () => {
        if (!course) return;
        const currentLessonIndex = course.lessons.findIndex((l) => l.id === lessonId);
        if (currentLessonIndex !== -1 && currentLessonIndex < course.lessons.length - 1) {
            const nextLesson = course.lessons[currentLessonIndex + 1];
            navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
        } else {
            navigate(`/courses/${courseId}`);
        }
    };

    if (!courseId || !lessonId) {
        return (
            <div className="p-12 text-center text-destructive text-sm font-mono uppercase tracking-widest">
                Invalid URL parameters
            </div>
        );
    }

    const currentLesson = course?.lessons.find((l) => l.id === lessonId);
    const lessonTitle = currentLesson?.title || "";
    const percentAnswered = progress.total > 0 ? (progress.answered / progress.total) * 100 : 0;

    return (
        <div className="flex flex-col h-dvh w-full bg-background overflow-hidden">
            {/* Focus Mode Header */}
            <header className="h-16 shrink-0 bg-background border-b border-border px-4 md:px-8 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}`)}
                        className="flex items-center justify-center size-10 border border-border bg-card hover:bg-muted transition-colors duration-200 text-foreground cursor-pointer shrink-0"
                    >
                        <ArrowLeft className="size-4" />
                    </button>

                    <div className="h-6 w-px bg-border hidden sm:block" />

                    {loading ? (
                        <Skeleton className="h-6 w-48 rounded-none" />
                    ) : (
                        <div className="flex items-center gap-3">
                            <BookOpen className="size-4 text-muted-foreground hidden sm:block" />
                            <span className="text-sm font-heading font-semibold text-foreground truncate max-w-[200px] md:max-w-md">
                                {lessonTitle}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {progress.total > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:inline">Progress</span>
                            <span className="text-sm font-mono font-medium text-foreground bg-muted px-3 py-1 border border-border">
                                {progress.answered} / {progress.total}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-[10px] font-bold text-bauhaus-blue uppercase tracking-widest border border-border bg-muted/20 px-3 py-1.5 h-8">
                        <motion.span
                            className="block size-2 bg-bauhaus-blue rounded-none"
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        />
                        Focus
                    </div>
                </div>
            </header>

            {/* Geometric Progress Bar */}
            <div className="w-full h-1.5 bg-muted shrink-0 relative z-10">
                <motion.div
                    className="h-full bg-foreground"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentAnswered}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>

            {/* Quiz Content */}
            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full w-full">
                    <div className="py-12 md:py-20 px-4">
                        <QuizInterface
                            courseId={courseId}
                            lessonId={lessonId}
                            onContinue={handleContinue}
                            onProgressChange={handleProgressChange}
                            key={`${courseId}-${lessonId}`}
                        />
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
