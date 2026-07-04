import * as React from "react";
import { useSession } from "@/lib/auth-client";
import { Play, Calendar, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Lesson } from "@/features/course/components/CourseCard";
import { PlannerForm } from "@/features/course/components/PlannerForm";
import { fetchApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const containerVariants = {
    animate: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as any } 
    },
};

export function DashboardPage() {
    const { data: session } = useSession();
    const navigate = useNavigate();
    const [courses, setCourses] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [schedule, setSchedule] = React.useState<any[]>([]);
    const [stats, setStats] = React.useState<{ totalCourses: number; completedQuizzes: number; completedInterviews: number } | null>(null);

    const loadDashboardData = async () => {
        try {
            const [scheduleData, statsData] = await Promise.all([
                fetchApi<any[]>("/api/dashboard/schedule").catch(() => []),
                fetchApi<any>("/api/dashboard/stats").catch(() => null)
            ]);
            setSchedule(scheduleData);
            setStats(statsData);
        } catch (e) {
            console.error(e);
        }
    };

    const loadCourses = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const data = await fetchApi<any[]>("/api/courses");
            setCourses((prev) => {
                if (!showLoading) {
                    data.forEach((newCourse) => {
                        const oldCourse = prev.find((c) => c.id === newCourse.id);
                        if (oldCourse && oldCourse.status === "GENERATING") {
                            if (newCourse.status === "ACTIVE") {
                                toast.success(`"${newCourse.title}" is ready!`);
                            } else if (newCourse.status === "FAILED") {
                                toast.error(newCourse.description || "Course generation failed");
                            }
                        }
                    });
                }
                return data;
            });
            setError(null);
        } catch (err: any) {
            console.error("Failed to load courses:", err);
            setError("Failed to load courses. Please refresh.");
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    React.useEffect(() => { 
        loadCourses(); 
        loadDashboardData();
    }, []);

    React.useEffect(() => {
        const hasGenerating = courses.some((c) => c.status === "GENERATING");
        if (!hasGenerating) return;
        const interval = setInterval(() => loadCourses(false), 3000);
        return () => clearInterval(interval);
    }, [courses]);

    const currentCourse = React.useMemo(() => {
        const active = courses.filter((c) => c.status === "ACTIVE" || c.status === "IN_PROGRESS");
        if (active.length === 0) return null;
        const computed = active.map((c) => {
            const lessons: Lesson[] = c.lessons ?? [];
            const completed = lessons.filter((l) => l.status === "COMPLETED").length;
            const total = lessons.length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            const remainingMinutes = lessons
                .filter((l) => l.status !== "COMPLETED")
                .reduce((acc, l) => acc + (l.estimateTime || 0), 0);
            const allCompleted = total > 0 && completed === total;
            const nextLesson = allCompleted ? null : (lessons.find((l) => l.status === "AVAILABLE" || l.status === "IN_PROGRESS") ?? lessons[0]);
            return { course: c, completed, total, percent, remainingMinutes, nextLesson, allCompleted };
        });
        const inProgress = computed.filter((p) => (p.percent > 0 && p.percent < 100) || p.course.status === "IN_PROGRESS");
        const pool = inProgress.length > 0 ? inProgress : computed;
        pool.sort((a, b) => new Date(b.course.createdAt).getTime() - new Date(a.course.createdAt).getTime());
        return pool[0] ?? null;
    }, [courses]);

    const handleViewCourse = (courseId: string) => navigate(`/courses/${courseId}`);

    return (
        <motion.div
            className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex justify-between items-end border-b border-border pb-6 mt-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-4 bg-bauhaus-red bauhaus-circle"></div>
                        <h1 className="text-3xl font-heading font-semibold tracking-tight text-foreground uppercase">Dashboard</h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Welcome back, {session?.user?.name?.split(" ")[0] || "Student"}. Here's your learning overview.</p>
                </div>
            </motion.div>

            {/* Error */}
            {error && (
                <motion.div variants={itemVariants} className="text-xs font-semibold text-destructive bg-destructive/10 p-3 rounded-none border border-destructive/20">
                    {error}
                </motion.div>
            )}

            {/* Top Quick Stats Grid */}
            {stats && (
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bauhaus-border p-5 bg-bauhaus-yellow text-black flex justify-between items-center">
                        <p className="text-[10px] uppercase tracking-widest font-bold">Total Courses</p>
                        <p className="text-3xl font-mono font-bold">{stats.totalCourses}</p>
                    </div>
                    <div className="bauhaus-border p-5 bg-bauhaus-blue text-white flex justify-between items-center">
                        <p className="text-[10px] uppercase tracking-widest font-bold">Quizzes Passed</p>
                        <p className="text-3xl font-mono font-bold">{stats.completedQuizzes}</p>
                    </div>
                    <div className="bauhaus-border p-5 bg-bauhaus-red text-white flex justify-between items-center">
                        <p className="text-[10px] uppercase tracking-widest font-bold">Interviews Completed</p>
                        <p className="text-3xl font-mono font-bold">{stats.completedInterviews}</p>
                    </div>
                </motion.div>
            )}

            {/* Main Content Layout centered in the middle */}
            <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
                
                {/* Continue Learning / Current Course */}
                <motion.div variants={itemVariants}>
                    {currentCourse ? (
                    <Card className="rounded-none border border-border shadow-none bg-card w-full">
                        <CardContent className="p-0 flex flex-col md:flex-row">
                            <div className="p-8 flex flex-col justify-between flex-1 gap-6 border-b md:border-b-0 md:border-r border-border">
                                <div>
                                    <Badge variant="outline" className="rounded-none border-bauhaus-blue text-bauhaus-blue mb-4 uppercase tracking-widest text-[10px]">
                                        {currentCourse.course.status === "COMPLETED" ? "Completed" : currentCourse.course.status === "IN_PROGRESS" ? "In Progress" : "Start Learning"}
                                    </Badge>
                                    <h2 className="text-2xl font-heading font-semibold text-foreground uppercase tracking-tight">{currentCourse.course.title}</h2>
                                    <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
                                        {currentCourse.allCompleted
                                            ? "Next up: Capstone Mock Interview."
                                            : currentCourse.nextLesson
                                                ? `Next up: ${currentCourse.nextLesson.title}.`
                                                : currentCourse.course.description || "Continue where you left off."}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 mt-4">
                                    <Button
                                        onClick={() => {
                                            if (currentCourse.allCompleted) {
                                                navigate(`/courses/${currentCourse.course.id}/interview`);
                                            } else {
                                                handleViewCourse(currentCourse.course.id);
                                            }
                                        }}
                                        className="rounded-none bg-bauhaus-blue text-white hover:bg-bauhaus-blue/90 group font-medium bauhaus-border bauhaus-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                                    >
                                        <Play className="size-4 mr-2 group-hover:text-bauhaus-yellow transition-colors" />
                                        {currentCourse.allCompleted ? "Start Interview" : currentCourse.percent === 0 ? "Start Course" : "Resume Lesson"}
                                    </Button>
                                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                                        {currentCourse.remainingMinutes > 0 ? `${currentCourse.remainingMinutes} MINS REMAINING` : "NO TIME ESTIMATE"}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-muted/30 p-8 flex flex-col justify-center min-w-[240px]">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-semibold text-foreground uppercase tracking-widest">Course Progress</span>
                                    <span className="text-xs font-mono text-muted-foreground">{currentCourse.percent}%</span>
                                </div>
                                <Progress value={currentCourse.percent} className="h-1.5 rounded-none bg-zinc-200 dark:bg-zinc-800 [&>div]:bg-bauhaus-blue dark:[&>div]:bg-sky-400" />
                                <div className="mt-6 flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-success" />
                                    <span className="text-xs text-muted-foreground">{currentCourse.completed} of {currentCourse.total} lessons completed</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    ) : (
                    <Card className="rounded-none border border-border shadow-none bg-card w-full">
                        <CardContent className="p-8 flex flex-col items-start justify-center gap-4">
                            <Badge variant="outline" className="rounded-none border-muted-foreground text-muted-foreground uppercase tracking-widest text-[10px]">Not Started</Badge>
                            <h2 className="text-2xl font-heading font-semibold text-foreground uppercase tracking-tight">No Course In Progress</h2>
                            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">Visit the My Courses tab in the sidebar to build your custom syllabus outline.</p>
                        </CardContent>
                    </Card>
                    )}
                </motion.div>

                {/* Upcoming / Tasks (Up Next) in the middle */}
                <motion.div variants={itemVariants}>
                    <Card className="rounded-none bauhaus-border shadow-none bg-card w-full">
                        <CardHeader className="border-b-2 border-foreground pb-4 bg-bauhaus-red text-white">
                            <CardTitle className="text-base font-semibold flex items-center gap-2 uppercase tracking-widest text-white">
                                <Calendar className="size-4" />
                                Up Next
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {schedule.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-muted-foreground font-mono uppercase tracking-widest bg-muted/10">No lessons scheduled for today. You're all caught up!</div>
                                ) : (
                                    schedule.map(lesson => (
                                        <div key={lesson.id} className="p-6 flex justify-between items-center hover:bg-muted/30 transition-colors">
                                            <div className="flex gap-4">
                                                <div className="mt-0.5">
                                                    <div className="size-2 bg-bauhaus-yellow rounded-none mt-1.5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold uppercase tracking-wider">{lesson.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{lesson.course.title} • {lesson.estimateTime} mins</p>
                                                </div>
                                            </div>
                                            <Button 
                                                onClick={() => navigate(`/courses/${lesson.courseId}`)} 
                                                className="rounded-none bg-bauhaus-blue text-white hover:bg-bauhaus-blue/90 font-bold text-xs uppercase tracking-widest h-10 px-6 bauhaus-border"
                                            >
                                                Start Lesson
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </motion.div>
    );
}
