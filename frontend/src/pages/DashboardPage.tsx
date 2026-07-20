import * as React from "react";
import { useSession } from "@/lib/auth-client";
import { Play, Calendar, CheckCircle2, BookOpen, Award, MessageSquare, ArrowRight, Clock, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Lesson } from "@/features/course/components/CourseCard";
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
    const [aiConfig, setAiConfig] = React.useState<any>(null);

    const loadDashboardData = async () => {
        try {
            const [scheduleData, statsData, configData] = await Promise.all([
                fetchApi<any[]>("/api/dashboard/schedule").catch(() => []),
                fetchApi<any>("/api/dashboard/stats").catch(() => null),
                fetchApi<any>("/api/ai/config").catch(() => null)
            ]);
            setSchedule(scheduleData);
            setStats(statsData);
            setAiConfig(configData);
        } catch (e) {
            console.error("Failed to load dashboard stats", e);
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
            <motion.div variants={itemVariants} className="flex justify-between items-end border-b bauhaus-border pb-6 mt-4 border-l-0 border-r-0 border-t-0">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-4 bg-bauhaus-red bauhaus-square shrink-0" />
                        <h1 className="text-3xl font-heading font-black tracking-tight text-foreground uppercase">
                            Dashboard
                        </h1>
                    </div>
                    <p className="text-sm font-mono text-muted-foreground mt-1">
                        Welcome back, {session?.user?.name?.split(" ")[0] || "Learner"}. Here's your autonomous learning overview.
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1.5 bauhaus-border">
                        {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </motion.div>

            {/* No API Key Warning Banner */}
            {aiConfig && !aiConfig.hasConfiguredKey && (
                <motion.div variants={itemVariants} className="bg-bauhaus-yellow/20 border-2 border-bauhaus-yellow p-6 bauhaus-square flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-10 bg-bauhaus-yellow text-black flex items-center justify-center font-bold text-xl shrink-0 bauhaus-square">
                            <Key className="size-5" />
                        </div>
                        <div>
                            <h4 className="font-heading font-black uppercase text-foreground text-sm tracking-wide">
                                No AI API Key Added Yet
                            </h4>
                            <p className="text-xs font-mono text-muted-foreground mt-0.5">
                                Please add an API key in Settings → AI Providers to start creating autonomous AI courses and quizzes.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate("/settings")}
                        className="bauhaus-square bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-widest text-xs h-11 px-6 shrink-0 shadow-[3px_3px_0px_0px_var(--bauhaus-yellow)]"
                    >
                        Add API Key in Settings
                    </Button>
                </motion.div>
            )}

            {error && (
                <motion.div variants={itemVariants} className="text-xs font-mono font-bold text-destructive bg-destructive/10 p-4 bauhaus-square bauhaus-border border-destructive">
                    {error} <button onClick={() => loadCourses()} className="underline ml-1 hover:no-underline">Try again</button>
                </motion.div>
            )}

            {/* Top Quick Stats Grid */}
            {stats && (
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bauhaus-border p-6 bg-bauhaus-yellow text-black flex justify-between items-center bauhaus-square bauhaus-shadow hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] uppercase tracking-widest font-black flex items-center gap-2">
                                <BookOpen className="size-4" /> Total Courses
                            </span>
                            <span className="text-4xl font-mono font-black mt-1">{stats.totalCourses}</span>
                        </div>
                        <div className="size-10 bg-black/10 border-2 border-black flex items-center justify-center font-bold text-lg">
                            {stats.totalCourses > 0 ? "Active" : "0"}
                        </div>
                    </div>

                    <div className="bauhaus-border p-6 bg-bauhaus-blue text-white flex justify-between items-center bauhaus-square bauhaus-shadow hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] uppercase tracking-widest font-black flex items-center gap-2">
                                <Award className="size-4" /> Quizzes Passed
                            </span>
                            <span className="text-4xl font-mono font-black mt-1">{stats.completedQuizzes}</span>
                        </div>
                        <div className="size-10 bg-white/20 border-2 border-white flex items-center justify-center font-bold text-lg">
                            ✓
                        </div>
                    </div>

                    <div className="bauhaus-border p-6 bg-bauhaus-red text-white flex justify-between items-center bauhaus-square bauhaus-shadow hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] uppercase tracking-widest font-black flex items-center gap-2">
                                <MessageSquare className="size-4" /> Interviews Cleared
                            </span>
                            <span className="text-4xl font-mono font-black mt-1">{stats.completedInterviews}</span>
                        </div>
                        <div className="size-10 bg-white/20 border-2 border-white flex items-center justify-center font-bold text-lg">
                            AI
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Main Content Layout */}
            <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
                
                {/* Continue Learning / Current Course */}
                <motion.div variants={itemVariants}>
                    {currentCourse ? (
                        <Card className="bauhaus-square bauhaus-border bauhaus-shadow bg-card w-full overflow-hidden">
                            <CardContent className="p-0 flex flex-col md:flex-row">
                                <div className="p-6 sm:p-8 flex flex-col justify-between flex-1 gap-6 border-b md:border-b-0 md:border-r bauhaus-border">
                                    <div>
                                        <div className="bauhaus-square border-2 border-bauhaus-blue text-bauhaus-blue mb-4 w-fit uppercase tracking-widest text-[10px] font-black px-2.5 py-1">
                                            {currentCourse.course.status === "COMPLETED" ? "Completed" : currentCourse.course.status === "IN_PROGRESS" ? "In Progress" : "Start Learning"}
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-heading font-black text-foreground uppercase tracking-tight leading-snug">
                                            {currentCourse.course.title}
                                        </h2>
                                        <p className="text-sm font-mono text-muted-foreground mt-3 leading-relaxed">
                                            {currentCourse.allCompleted
                                                ? "All lessons done — your capstone mock interview is next."
                                                : currentCourse.nextLesson
                                                    ? `Up next: ${currentCourse.nextLesson.title}.`
                                                    : currentCourse.course.description || "Continue where you left off."}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                        <Button
                                            onClick={() => {
                                                if (currentCourse.allCompleted) {
                                                    navigate(`/courses/${currentCourse.course.id}/interview`);
                                                } else {
                                                    handleViewCourse(currentCourse.course.id);
                                                }
                                            }}
                                            className="bauhaus-square bg-bauhaus-blue text-white hover:bg-bauhaus-blue/90 font-black uppercase tracking-widest text-xs h-11 px-6 bauhaus-border shadow-[3px_3px_0px_0px_var(--foreground)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                                        >
                                            <Play className="size-4 mr-2 text-bauhaus-yellow" />
                                            {currentCourse.allCompleted ? "Start Interview" : currentCourse.percent === 0 ? "Start Course" : "Resume Lesson"}
                                        </Button>
                                        <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider flex items-center gap-1.5">
                                            <Clock className="size-3.5" />
                                            {currentCourse.remainingMinutes > 0 ? `${currentCourse.remainingMinutes} mins left` : "No estimate"}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-muted/30 p-6 sm:p-8 flex flex-col justify-center w-full md:w-72 shrink-0">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-xs font-black text-foreground uppercase tracking-widest">Progress</span>
                                        <span className="text-sm font-mono font-black text-foreground">{currentCourse.percent}%</span>
                                    </div>
                                    <Progress value={currentCourse.percent} className="h-2 bauhaus-square bg-muted [&>div]:bg-bauhaus-blue" />
                                    <div className="mt-5 flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-bauhaus-blue shrink-0" />
                                        <span className="text-xs font-mono text-muted-foreground">{currentCourse.completed} of {currentCourse.total} lessons done</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bauhaus-square bauhaus-border bauhaus-shadow bg-card w-full">
                            <CardContent className="p-8 flex flex-col items-start justify-center gap-4">
                                <div className="bauhaus-square border-2 border-border text-muted-foreground uppercase tracking-widest text-[10px] font-black w-fit px-2 py-1">
                                    No Course Active
                                </div>
                                <h2 className="text-2xl font-heading font-black text-foreground uppercase tracking-tight">Ready when you are</h2>
                                <p className="text-sm font-mono text-muted-foreground max-w-md leading-relaxed">
                                    Create a new course from the Courses page — Marko will build a full curriculum for you in seconds.
                                </p>
                                <Button
                                    onClick={() => navigate("/courses")}
                                    className="bauhaus-square bg-foreground text-background hover:bg-bauhaus-red hover:text-white font-bold uppercase tracking-wider text-xs h-10 px-6 mt-2"
                                >
                                    Go to Courses <ArrowRight className="size-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>

                {/* Up Next / Cadence Scheduled Lessons */}
                <motion.div variants={itemVariants}>
                    <Card className="bauhaus-square bauhaus-border bauhaus-shadow bg-card w-full">
                        <CardHeader className="border-b bauhaus-border bg-bauhaus-red pb-4 text-white">
                            <CardTitle className="text-base font-bold flex items-center gap-2 uppercase tracking-widest text-white">
                                <Calendar className="size-4" /> Up Next Tasks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {schedule.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-muted-foreground font-mono uppercase tracking-widest bg-muted/10">
                                        No lessons scheduled for today. You're all caught up!
                                    </div>
                                ) : (
                                    schedule.map((lesson) => (
                                        <div key={lesson.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                                            <div className="flex gap-4 items-start">
                                                <div className="size-3 bg-bauhaus-yellow border border-border bauhaus-square mt-1 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-bold uppercase tracking-wider text-foreground">{lesson.title}</p>
                                                    <p className="text-xs font-mono text-muted-foreground mt-1 leading-relaxed">
                                                        {lesson.course?.title} • {lesson.estimateTime || 15} mins
                                                    </p>
                                                </div>
                                            </div>
                                            <Button 
                                                onClick={() => navigate(`/courses/${lesson.courseId}`)} 
                                                className="bauhaus-square bg-bauhaus-blue text-white hover:bg-bauhaus-blue/90 font-bold text-xs uppercase tracking-widest h-10 px-6 bauhaus-border shrink-0 self-start sm:self-auto"
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
