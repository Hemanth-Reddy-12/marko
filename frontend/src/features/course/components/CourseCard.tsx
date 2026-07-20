import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ChevronRight, Loader2, AlertCircle, Clock } from "lucide-react";
import { Icon } from "@iconify/react";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface Lesson {
    id: string;
    title: string;
    order: number;
    estimateTime: number;
    status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
}

export interface Course {
    id: string;
    title: string;
    description: string | null;
    durationDays: number;
    estimateTime: number;
    status: "GENERATING" | "ACTIVE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    lessons: Lesson[];
    createdAt: string;
}

const courseStatusConfig: Record<Course["status"], { label: string; className: string }> = {
    GENERATING: { label: "Generating", className: "text-muted-foreground" },
    ACTIVE: { label: "Active", className: "text-muted-foreground" },
    IN_PROGRESS: { label: "In Progress", className: "bg-bauhaus-blue/15 text-bauhaus-blue" },
    COMPLETED: { label: "Completed", className: "bg-success/15 text-success" },
    FAILED: { label: "Failed", className: "bg-destructive/15 text-destructive" },
};

function getProviderIcon(provider?: string): string {
    if (provider === "openai") return "logos:openai-icon";
    if (provider === "anthropic") return "logos:anthropic-icon";
    if (provider === "mock") return "ph:cpu-bold";
    return "logos:google-gemini";
}

interface CourseCardProps {
    course: Course;
    onViewCourse: (courseId: string) => void;
    onDeleteCourse?: (courseId: string) => void;
}

export function CourseCard({ course, onViewCourse }: CourseCardProps) {
    const isGenerating = course.status === "GENERATING";
    const isFailed = course.status === "FAILED";
    const statusBadge = courseStatusConfig[course.status] ?? courseStatusConfig.ACTIVE;

    const [aiConfig, setAiConfig] = React.useState<{ activeProvider: string; activeModel: string } | null>(null);

    React.useEffect(() => {
        if (isGenerating) {
            fetchApi<{ activeProvider: string; activeModel: string }>("/api/ai/config")
                .then((cfg) => setAiConfig(cfg))
                .catch(() => null);
        }
    }, [isGenerating]);

    const completedLessons = course.lessons?.filter(l => l.status === "COMPLETED").length || 0;
    const totalLessons = course.lessons?.length || 0;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const totalMins = course.lessons?.reduce((acc, l) => acc + (l.estimateTime || 0), 0) || course.estimateTime || 0;
    const formatEstimateTime = (mins: number) => {
        if (mins >= 1440) {
            const days = mins / 1440;
            return `${days % 1 === 0 ? days : days.toFixed(1)} Days`;
        }
        return `${mins} Mins`;
    };

    return (
        <Card className={cn(
            "bg-card bauhaus-border shadow-none rounded-none overflow-hidden transition-all duration-200 flex flex-col h-full relative cursor-pointer hover:-translate-y-1 hover:translate-x-1 hover:bauhaus-shadow",
            isGenerating && "opacity-90 pointer-events-none"
        )} onClick={() => !isGenerating && onViewCourse(course.id)}>
            {isGenerating && (
                <div className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-3 p-4 text-center">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                        <Icon icon={getProviderIcon(aiConfig?.activeProvider)} className="size-5 shrink-0" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-black text-foreground uppercase tracking-wider">Generating Course</p>
                        <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
                            {aiConfig?.activeModel ? `Powered by ${aiConfig.activeModel}` : "Autonomous AI Planning..."}
                        </p>
                    </div>
                </div>
            )}

            <CardHeader className="p-5 pb-0 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
                            <Clock className="size-3" />
                            <span>{formatEstimateTime(totalMins)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge 
                            variant={isFailed ? "destructive" : "secondary"}
                            className={cn("text-[10px] font-medium tracking-widest uppercase px-2 py-0.5 rounded-none", statusBadge.className)}
                        >
                            {statusBadge.label}
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                    <CardTitle className="text-lg font-heading font-bold text-foreground line-clamp-1 leading-snug uppercase tracking-tight">
                        {course.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                        {course.description || "No description provided."}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="p-5 flex-1 flex flex-col justify-end gap-4">
                {isFailed ? (
                    <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 p-2 rounded-none border border-destructive/20 mt-4">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>Generation failed. Delete and try again.</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 mt-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-[10px] font-medium text-foreground uppercase tracking-widest">
                                <span>Progress</span>
                                <span className="font-mono text-muted-foreground">
                                    {progressPercent}%
                                </span>
                            </div>
                            <Progress value={progressPercent} className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-none [&>div]:bg-bauhaus-blue dark:[&>div]:bg-sky-400" />
                        </div>

                        {course.lessons && course.lessons.length > 0 && (
                            <div className="border-t border-border pt-4 flex items-center justify-between gap-4 mt-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    <BookOpen className="size-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase truncate">
                                        {course.lessons.every(l => l.status === "COMPLETED")
                                            ? "Next: Interview"
                                            : `Next: ${course.lessons.find(l => l.status === "AVAILABLE" || l.status === "IN_PROGRESS")?.title || course.lessons[0]?.title}`}
                                    </span>
                                </div>
                                <Button 
                                    size="sm" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewCourse(course.id);
                                    }}
                                    className="rounded-none bg-bauhaus-yellow text-black hover:bg-bauhaus-yellow/90 text-xs font-bold uppercase tracking-widest h-8 px-4 bauhaus-border hover:bauhaus-shadow hover:-translate-y-0.5 hover:translate-x-0.5 transition-all"
                                >
                                    <span>Learn</span>
                                    <ChevronRight className="size-3 ml-1" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
