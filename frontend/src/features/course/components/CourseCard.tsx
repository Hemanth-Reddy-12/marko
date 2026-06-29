import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar, ChevronRight, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export interface Lesson {
    id: string;
    title: string;
    order: number;
    status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
}

export interface Course {
    id: string;
    title: string;
    description: string | null;
    durationDays: number;
    status: "GENERATING" | "ACTIVE" | "COMPLETED" | "FAILED";
    lessons: Lesson[];
    createdAt: string;
}

interface CourseCardProps {
    course: Course;
    onViewCourse: (courseId: string) => void;
    onDeleteCourse?: (courseId: string) => void;
}

export function CourseCard({ course, onViewCourse, onDeleteCourse }: CourseCardProps) {
    const isGenerating = course.status === "GENERATING";
    const isFailed = course.status === "FAILED";

    const completedLessons = course.lessons?.filter(l => l.status === "COMPLETED").length || 0;
    const totalLessons = course.lessons?.length || 0;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <Card className={cn(
            "bg-white border border-zinc-200/80 shadow-none rounded-xl overflow-hidden transition-all duration-200 hover:border-zinc-300 hover:shadow-sm flex flex-col h-full relative",
            isGenerating && "border-zinc-200/50 bg-zinc-50/20"
        )}>
            {isGenerating && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex flex-col items-center justify-center z-10 gap-2.5 p-4 text-center">
                    <Loader2 className="h-5 w-5 text-zinc-900 animate-spin" />
                    <div className="flex flex-col gap-0.5">
                        <p className="text-xs font-semibold text-zinc-900">Planning Course Outline...</p>
                        <p className="text-[10px] text-zinc-500 font-normal">This will take a few seconds</p>
                    </div>
                </div>
            )}

            <CardHeader className="p-5 pb-0 flex flex-col gap-2">
                {/* Header: Badges & Duration */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-zinc-500 font-medium text-[10px] uppercase tracking-wider">
                        <Calendar className="size-3" />
                        <span>{course.durationDays} Days</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge 
                            variant={isFailed ? "destructive" : course.status === "COMPLETED" ? "default" : "secondary"}
                            className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full"
                        >
                            {course.status}
                        </Badge>
                        {onDeleteCourse && (
                            <AlertDialog>
                                <AlertDialogTrigger 
                                    render={
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="size-6 text-zinc-400 hover:text-red-500 hover:bg-red-50"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    }
                                >
                                    <Trash2 className="size-3.5" />
                                </AlertDialogTrigger>
                                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this course? This action cannot be undone and will permanently remove all lessons and progress.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteCourse(course.id);
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>

                {/* Title & Description */}
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm font-bold text-zinc-900 line-clamp-1 leading-snug">
                        {course.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500 font-normal line-clamp-2 leading-relaxed">
                        {course.description || "No description provided."}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="p-5 pt-4 flex-1 flex flex-col justify-end gap-4">
                {isFailed ? (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>Generation failed. Delete and try again.</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {/* Progress */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                <span>Curriculum Progress</span>
                                <span className="text-zinc-700 font-bold tabular-nums">
                                    {completedLessons}/{totalLessons} Lessons ({progressPercent}%)
                                </span>
                            </div>
                            <Progress value={progressPercent} className="h-1 bg-zinc-100">
                                <div 
                                    className="h-full bg-zinc-900 transition-all rounded-full" 
                                    style={{ width: `${progressPercent}%` }} 
                                />
                            </Progress>
                        </div>

                        {/* Lessons preview (small preview of the next lesson or first lesson) */}
                        {course.lessons && course.lessons.length > 0 && (
                            <div className="border-t border-zinc-100 pt-3 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <BookOpen className="size-3.5 text-zinc-400 shrink-0" />
                                    <span className="text-[11px] text-zinc-600 font-medium truncate">
                                        Next: {course.lessons.find(l => l.status === "AVAILABLE" || l.status === "IN_PROGRESS")?.title || course.lessons[0].title}
                                    </span>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => onViewCourse(course.id)}
                                    className="h-7 text-[10px] font-bold text-zinc-800 border-zinc-200 hover:bg-zinc-50 bg-white shrink-0 px-2 flex items-center gap-0.5"
                                >
                                    <span>Learn</span>
                                    <ChevronRight data-icon="inline-end" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
