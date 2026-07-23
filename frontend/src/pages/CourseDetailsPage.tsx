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
    ArrowLeft,
    Clock,
    Zap,
    Cpu
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { TutorFloatingButton } from "@/features/tutor/components/TutorFloatingButton";
import { CourseTutorDrawer } from "@/features/tutor/components/CourseTutorDrawer";

interface Lesson {
    id: string;
    title: string;
    order: number;
    status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
    generationStatus: "NOT_GENERATED" | "GENERATING" | "GENERATED" | "FAILED";
    content: string | null;
    estimateTime: number;
}

interface CourseDetail {
    id: string;
    title: string;
    description: string | null;
    durationDays: number;
    estimateTime: number;
    status: "GENERATING" | "ACTIVE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    lessons: Lesson[];
    createdAt: string;
    updatedAt: string;
}

const statusConfig = {
    LOCKED: { icon: Lock, label: "Locked", color: "text-muted-foreground", bg: "bg-muted" },
    AVAILABLE: { icon: Circle, label: "Available", color: "text-bauhaus-blue", bg: "bg-muted" },
    IN_PROGRESS: { icon: Play, label: "In Progress", color: "text-bauhaus-yellow", bg: "bg-muted" },
    COMPLETED: { icon: CheckCircle2, label: "Completed", color: "text-success", bg: "bg-success/10" },
} as const;

const courseStatusConfig: Record<CourseDetail["status"], { label: string; className: string }> = {
    GENERATING: { label: "Generating", className: "bg-muted text-muted-foreground" },
    ACTIVE: { label: "Active", className: "bg-bauhaus-yellow/20 text-foreground" },
    IN_PROGRESS: { label: "In Progress", className: "bg-bauhaus-blue/15 text-bauhaus-blue" },
    COMPLETED: { label: "Completed", className: "bg-success/15 text-success" },
    FAILED: { label: "Failed", className: "bg-destructive/15 text-destructive" },
};

export function CourseDetailsPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = React.useState<CourseDetail | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isTutorOpen, setIsTutorOpen] = React.useState(false);

    const [isDeleting, setIsDeleting] = React.useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

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

    const handleDelete = async () => {
        if (!courseId) return;
        setIsDeleting(true);
        try {
            await fetchApi(`/api/courses/${courseId}`, { method: "DELETE" });
            navigate("/courses");
        } catch (err: any) {
            console.error("Failed to delete course:", err);
            setError(err.message || "Failed to delete course.");
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const completedLessons = course?.lessons?.filter(l => l.status === "COMPLETED").length || 0;
    const totalLessons = course?.lessons?.length || 0;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    if (loading) {
        return (
            <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
                <div className="flex flex-col gap-4 mt-8">
                    <Skeleton className="h-6 w-24 rounded-none" />
                    <Skeleton className="h-12 w-3/4 rounded-none" />
                    <Skeleton className="h-4 w-1/2 rounded-none" />
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto mt-8">
                <Card className="bg-card border border-border shadow-none rounded-none">
                    <CardContent className="p-12 flex flex-col items-center gap-4 text-center">
                        <div className="size-12 border border-border flex items-center justify-center bg-muted/20">
                            <AlertCircle className="size-6 text-destructive" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg font-semibold text-foreground">Course not found</h2>
                            <p className="text-sm text-muted-foreground">{error || "This course doesn't exist or you don't have access."}</p>
                        </div>
                        <Button
                            onClick={() => navigate("/courses")}
                            className="rounded-none mt-4"
                        >
                            Back to Courses
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
        <motion.div 
            className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header section with back button */}
            <div className="flex flex-col gap-6 border-b-2 border-foreground pb-6 mt-4">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate("/courses")} className="w-fit rounded-none px-0 text-foreground font-bold hover:text-foreground h-auto text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
                        <ArrowLeft className="size-3 mr-2" /> Back to Courses
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="rounded-none px-4 h-8 text-xs font-bold uppercase tracking-widest border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                        Delete Course
                    </Button>
                </div>
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-4 max-w-4xl">
                        <div className="flex gap-4 items-center">
                            <Badge variant="outline" className={cn("rounded-none bauhaus-border uppercase tracking-widest text-[10px]", courseStatusConfig[course.status]?.className ?? "bg-bauhaus-yellow/20 text-foreground")}>
                                {courseStatusConfig[course.status]?.label ?? course.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                                ID: {course.id.slice(0, 8)}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-foreground leading-tight uppercase">
                            {course.title}
                        </h1>
                        <p className="text-base text-muted-foreground mt-1 font-medium leading-relaxed max-w-3xl">
                            {course.description || "No description provided."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                {/* Left Column: Curriculum */}
                <div className="md:col-span-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b-2 border-foreground pb-2">
                        <h2 className="text-lg font-heading font-semibold uppercase tracking-widest text-foreground flex items-center gap-3">
                            <div className="size-3 bg-bauhaus-blue bauhaus-circle"></div>
                            Curriculum
                        </h2>
                        <span className="text-xs font-mono font-bold text-foreground">{totalLessons} MODULES</span>
                    </div>

                    <div className="flex flex-col gap-0 bauhaus-border bg-card bauhaus-shadow">
                        {course.lessons.map((lesson, index) => {
                            const config = statusConfig[lesson.status];
                            const StatusIcon = config.icon;
                            const isClickable = lesson.status !== "LOCKED";
                            const isLast = index === course.lessons.length - 1;

                            return (
                                <div
                                    key={lesson.id}
                                    onClick={() => isClickable ? navigate(`/courses/${courseId}/lessons/${lesson.id}`) : undefined}
                                    className={cn(
                                        "flex items-center gap-6 p-6 transition-colors bg-card",
                                        !isLast && "border-b border-border",
                                        isClickable && "hover:bg-muted/50 cursor-pointer",
                                        lesson.status === "LOCKED" && "opacity-50"
                                    )}
                                >
                                    <div className="text-3xl font-heading font-semibold text-muted-foreground/30 w-8 text-right shrink-0">
                                        {lesson.order.toString().padStart(2, '0')}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                        <h3 className="text-base font-medium text-foreground truncate">
                                            {lesson.title}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <span className={cn("text-[10px] font-medium uppercase tracking-widest flex items-center gap-1.5", config.color)}>
                                                <StatusIcon className="size-3" />
                                                {config.label}
                                            </span>
                                            <span className="text-[10px] font-medium uppercase tracking-widest flex items-center gap-1.5 text-muted-foreground">
                                                <Clock className="size-3" />
                                                {lesson.estimateTime || 0} mins
                                            </span>
                                        </div>
                                    </div>
                                    {isClickable && (
                                        <Button variant="outline" className="rounded-none text-xs h-8 font-bold px-4 bauhaus-border hover:bg-muted uppercase tracking-widest">
                                            {lesson.status === "COMPLETED" ? "Review" : "Start"}
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Meta & AI Notes */}
                <div className="md:col-span-4 flex flex-col gap-8">
                    
                    {/* Progress Card */}
                    <Card className="rounded-none bauhaus-border shadow-none bg-card">
                        <CardHeader className="border-b-2 border-foreground pb-4 bg-bauhaus-blue text-white">
                            <CardTitle className="text-sm font-semibold uppercase tracking-widest text-white">Course Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col gap-6">
                            <div className="flex items-end justify-between">
                                <span className="text-4xl font-heading font-semibold tracking-tight">{progressPercent}%</span>
                                <span className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-mono font-bold">{completedLessons} / {totalLessons}</span>
                            </div>
                            <Progress value={progressPercent} className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-none [&>div]:bg-bauhaus-red" />
                            {progressPercent === 100 && (
                                <Button 
                                    onClick={() => navigate(`/courses/${courseId}/interview`)}
                                    className="w-full rounded-none mt-2 bg-bauhaus-blue text-white hover:bg-bauhaus-blue/90 font-medium"
                                >
                                    Start Capstone Interview
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Meta Info */}
                    <Card className="rounded-none bauhaus-border shadow-none bg-card">
                        <CardContent className="p-0 divide-y-2 divide-foreground">
                            <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="size-3.5" /> Duration
                                </span>
                                <span className="text-sm font-medium">{course.durationDays} Days</span>
                            </div>
                            <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="size-3.5" /> Est. Time
                                </span>
                                <span className="text-sm font-medium">{course.lessons?.reduce((acc, l) => acc + (l.estimateTime || 0), 0) || course.estimateTime || (totalLessons * 45)} mins</span>
                            </div>
                            <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <BookOpen className="size-3.5" /> Modules
                                </span>
                                <span className="text-sm font-medium">{totalLessons}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Assessment Note */}
                    <Card className="rounded-none bauhaus-border shadow-none bg-bauhaus-yellow/20">
                        <CardContent className="p-6 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-foreground uppercase tracking-widest mb-1">
                                <Cpu className="size-4 text-bauhaus-red" /> AI Summary
                            </div>
                            <p className="text-xs text-foreground font-medium leading-relaxed">
                                This curriculum has been dynamically generated based on your goal. Ensure you complete the quizzes after each module for the agent to adapt the capstone interview to your skill level.
                            </p>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="w-full max-w-md bg-card bauhaus-square bauhaus-border bauhaus-shadow p-6 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-heading font-bold text-foreground uppercase tracking-wider">Delete Course</h2>
                        <p className="text-sm font-medium text-muted-foreground">
                            Are you sure you want to delete this course? This action cannot be undone and will remove all associated lessons and progress.
                        </p>
                    </div>
                    <div className="flex items-center justify-end gap-4 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="rounded-none bauhaus-border hover:bg-muted font-bold uppercase tracking-widest text-xs h-10 px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded-none bauhaus-border bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold uppercase tracking-widest text-xs h-10 px-6"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </div>
            </div>
        )}

        {courseId && (
            <>
                <TutorFloatingButton
                    isOpen={isTutorOpen}
                    onToggle={() => setIsTutorOpen((prev) => !prev)}
                />
                <CourseTutorDrawer
                    isOpen={isTutorOpen}
                    onClose={() => setIsTutorOpen(false)}
                    courseId={courseId}
                    courseTitle={course?.title}
                />
            </>
        )}
        </>
    );
}
