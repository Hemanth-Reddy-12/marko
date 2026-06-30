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
            <div className="p-8 text-center text-destructive text-sm">
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
            <header className="h-14 shrink-0 bg-background border-b border-border/60 px-4 md:px-6 flex items-center justify-between z-10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}`)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 text-sm font-medium cursor-pointer"
                    >
                        <ArrowLeft className="size-4" />
                        <span className="hidden sm:inline">Exit Quiz</span>
                    </button>

                    <div className="h-4 w-px bg-border" />

                    {loading ? (
                        <Skeleton className="h-4 w-40" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <BookOpen className="size-3.5 text-muted-foreground" />
                            <span className="text-sm font-semibold text-foreground truncate max-w-[200px] md:max-w-xs">
                                {lessonTitle}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2.5">
                    {progress.total > 0 && (
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                            {progress.answered}/{progress.total}
                        </span>
                    )}

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <motion.span
                            className="block size-1.5 rounded-full bg-emerald-500"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        />
                        Focus Mode
                    </div>
                </div>
            </header>

            {/* Animated Progress Bar */}
            <div className="w-full h-1 bg-muted shrink-0 relative z-10">
                <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentAnswered}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>

            {/* Quiz Content */}
            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full w-full">
                    <div className="py-8 md:py-12 px-4">
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
