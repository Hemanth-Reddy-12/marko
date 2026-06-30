import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchApi } from "@/lib/api";
import { QuizInterface } from "@/features/quiz/components/QuizInterface";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

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
                if (prev.answered === answered && prev.total === total)
                    return prev;
                return { answered, total };
            });
        },
        [],
    );

    React.useEffect(() => {
        if (!courseId) return;

        const loadCourseInfo = async () => {
            try {
                const data = await fetchApi<CourseHeader>(
                    `/api/courses/${courseId}`,
                );
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
        const currentLessonIndex = course.lessons.findIndex(
            (l) => l.id === lessonId,
        );
        if (
            currentLessonIndex !== -1 &&
            currentLessonIndex < course.lessons.length - 1
        ) {
            const nextLesson = course.lessons[currentLessonIndex + 1];
            navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
        } else {
            // End of course, navigate to dashboard
            navigate(`/courses/${courseId}`);
        }
    };

    if (!courseId || !lessonId) {
        return (
            <div className="p-8 text-center text-red-500">
                Invalid URL parameters
            </div>
        );
    }

    const currentLesson = course?.lessons.find((l) => l.id === lessonId);
    const lessonTitle = currentLesson?.title || "";

    const percentAnswered =
        progress.total > 0 ? (progress.answered / progress.total) * 100 : 0;

    return (
        <div className="flex flex-col h-screen w-full bg-zinc-50/50 overflow-hidden">
            {/* Elegant Focus Mode Header */}
            <header className="h-16 shrink-0 bg-white border-b border-zinc-200/80 px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() =>
                            navigate(`/courses/${courseId}/lessons/${lessonId}`)
                        }
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all text-sm font-medium"
                    >
                        <ArrowLeft className="size-4" />
                        <span>Exit Quiz</span>
                    </button>
                    <div className="h-4 w-px bg-zinc-200" />
                    {loading ? (
                        <Skeleton className="h-4 w-40" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                Quiz:
                            </span>
                            <span className="text-sm font-semibold text-zinc-900 truncate max-w-[280px] md:max-w-md">
                                {lessonTitle}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {progress.total > 0 && (
                        <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
                            {progress.answered} of {progress.total} Answered
                        </span>
                    )}
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200/50 shadow-sm">
                        <span className="relative flex size-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                        </span>
                        Focus Mode
                    </div>
                </div>
            </header>

            {/* Continuous Progress Indicator */}
            {progress.total > 0 && (
                <div className="w-full h-1 bg-zinc-100 shrink-0 relative z-10">
                    <div
                        className="h-full bg-zinc-900 transition-all duration-300 ease-out"
                        style={{ width: `${percentAnswered}%` }}
                    />
                </div>
            )}

            {/* Quiz Content Scroll Area */}
            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full w-full">
                    <div className="py-8 md:py-12">
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
