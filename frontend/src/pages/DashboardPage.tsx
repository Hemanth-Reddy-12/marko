import * as React from "react";
import { useSession } from "@/lib/auth-client";
import { BookOpen, GraduationCap, Trophy, Sparkles, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CourseList } from "@/features/course/components/CourseList";
import { PlannerForm } from "@/features/course/components/PlannerForm";
import { fetchApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";

const containerVariants = {
    animate: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

const statCards = [
    { label: "Active Courses", icon: BookOpen, key: "active" as const },
    { label: "Lessons Finished", icon: GraduationCap, key: "lessons" as const },
    { label: "Assessments Passed", icon: Trophy, key: "assessments" as const },
];

export function DashboardPage() {
    const { data: session } = useSession();
    const navigate = useNavigate();
    const [courses, setCourses] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isPlannerOpen, setIsPlannerOpen] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

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

    React.useEffect(() => { loadCourses(); }, []);

    React.useEffect(() => {
        const hasGenerating = courses.some((c) => c.status === "GENERATING");
        if (!hasGenerating) return;
        const interval = setInterval(() => loadCourses(false), 3000);
        return () => clearInterval(interval);
    }, [courses]);

    const handleCourseCreated = (newCourse: any) => {
        setCourses((prev) => [newCourse, ...prev]);
        loadCourses(false);
    };

    const handleViewCourse = (courseId: string) => navigate(`/courses/${courseId}`);

    const handleDeleteCourse = async (courseId: string) => {
        try {
            await fetchApi(`/api/courses/${courseId}`, { method: "DELETE" });
            setCourses((prev) => prev.filter((c) => c.id !== courseId));
        } catch {
            setError("Failed to delete course. Please try again.");
        }
    };

    const activeCoursesCount = courses.filter((c) => c.status === "ACTIVE" || c.status === "GENERATING").length;
    const finishedLessonsCount = courses.reduce((acc, course) => {
        return acc + (course.lessons?.filter((l: any) => l.status === "COMPLETED").length || 0);
    }, 0);
    const passedAssessmentsCount = finishedLessonsCount;

    const metrics = { active: activeCoursesCount, lessons: finishedLessonsCount, assessments: passedAssessmentsCount };

    return (
        <motion.div
            className="flex flex-col gap-6 w-full max-w-6xl mx-auto"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            {/* Header */}
            <motion.div className="flex justify-between items-center" variants={itemVariants}>
                <div>
                    <h2 className="text-lg font-bold text-foreground">Workspace</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Track your goals and continue learning.</p>
                </div>
                {courses.length > 0 && (
                    <Button
                        onClick={() => setIsPlannerOpen(true)}
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-white gap-1.5 shadow-sm text-xs font-semibold"
                    >
                        <Plus className="size-3.5" />
                        New Course
                    </Button>
                )}
            </motion.div>

            {/* Hero Banner */}
            <motion.div variants={itemVariants}>
                <Card className="relative overflow-hidden border-none shadow-md rounded-2xl">
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900" />
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 size-64 rounded-full bg-accent/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 size-48 rounded-full bg-blue-500/10 blur-2xl" />

                    <div className="relative z-10 p-6 flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-2.5 max-w-lg">
                            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-0.5 rounded-full w-fit">
                                <Sparkles className="size-3 text-blue-300" />
                                <span className="text-[10px] font-semibold text-blue-200">Welcome back</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                Hi, {session?.user?.name?.split(" ")[0] || "Student"} 👋
                            </h1>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                What would you like to master today? Create a course tailored to your learning goals.
                            </p>
                            {courses.length === 0 && !loading && (
                                <Button
                                    onClick={() => setIsPlannerOpen(true)}
                                    size="sm"
                                    className="bg-accent hover:bg-accent/90 text-white w-fit gap-1.5 mt-1 shadow-sm text-xs font-semibold"
                                >
                                    <Plus className="size-3.5" />
                                    Create My First Course
                                </Button>
                            )}
                        </div>
                        <div className="hidden md:flex size-16 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center shrink-0 border border-white/10">
                            <GraduationCap className="size-8 text-blue-300" />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={stat.key}
                        variants={itemVariants}
                        custom={i}
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    >
                        <Card className="bg-card border border-border shadow-none rounded-2xl hover:shadow-sm hover:border-accent/20 transition-all duration-300 cursor-default">
                            <CardContent className="p-4 flex items-center gap-3.5">
                                <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/10 shrink-0">
                                    <stat.icon className="size-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                    <motion.h3
                                        className="text-2xl font-bold text-foreground tabular-nums"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                    >
                                        {loading ? "–" : metrics[stat.key]}
                                    </motion.h3>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Error */}
            {error && (
                <motion.div
                    variants={itemVariants}
                    className="text-xs font-semibold text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20"
                >
                    {error}
                </motion.div>
            )}

            {/* Course List or Empty State */}
            <motion.div variants={itemVariants}>
                {!loading && courses.length === 0 ? (
                    <Card className="bg-muted/30 border-dashed border-2 border-border shadow-none rounded-2xl">
                        <CardContent className="p-10 text-center flex flex-col items-center gap-4">
                            <div className="size-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                <BookOpen className="size-6" />
                            </div>
                            <div className="flex flex-col gap-1.5 max-w-sm mx-auto">
                                <h2 className="text-base font-bold text-foreground">No active courses yet</h2>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Create a course with a prompt. Let AI build your structured curriculum instantly.
                                </p>
                            </div>
                            <Button
                                onClick={() => setIsPlannerOpen(true)}
                                className="bg-accent hover:bg-accent/90 text-white gap-1.5 shadow-sm text-sm font-semibold"
                            >
                                <Plus className="size-4" />
                                Create My First Course
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <CourseList
                        courses={courses}
                        loading={loading}
                        onViewCourse={handleViewCourse}
                        onDeleteCourse={handleDeleteCourse}
                    />
                )}
            </motion.div>

            <PlannerForm
                isOpen={isPlannerOpen}
                onClose={() => setIsPlannerOpen(false)}
                onCourseCreated={handleCourseCreated}
            />
        </motion.div>
    );
}
