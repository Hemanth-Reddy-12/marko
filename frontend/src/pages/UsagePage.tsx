import * as React from "react";
import { Link } from "react-router-dom";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
    Flame,
    BrainCircuit,
    BookOpen,
    CheckCircle2,
    Bot,
    MessageSquare,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    FileText,
    Zap,
    GraduationCap,
    BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseUsageData {
    courseId: string;
    courseTitle: string;
    status: string;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    breakdown: {
        planner: number;
        content: number;
        quiz: number;
        interview: number;
        tutor: number;
    };
    runs: {
        id: string;
        agent: "PLANNER" | "CONTENT" | "QUIZ" | "INTERVIEW" | "TUTOR";
        entityType: string;
        entityId: string;
        label: string;
        status: "RUNNING" | "SUCCESS" | "FAILED";
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        createdAt: string;
    }[];
}

interface OverallStats {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    totalCourses: number;
    totalRuns: number;
}

const agentMeta = {
    PLANNER: { label: "Course Planner", icon: BrainCircuit, color: "text-bauhaus-blue bg-bauhaus-blue/10 border-bauhaus-blue/30" },
    CONTENT: { label: "Lesson Writer", icon: BookOpen, color: "text-bauhaus-yellow bg-bauhaus-yellow/10 border-bauhaus-yellow/30" },
    QUIZ: { label: "Quiz Engine", icon: CheckCircle2, color: "text-success bg-success/10 border-success/30" },
    INTERVIEW: { label: "Oral Examiner", icon: Bot, color: "text-bauhaus-red bg-bauhaus-red/10 border-bauhaus-red/30" },
    TUTOR: { label: "AI Tutor", icon: MessageSquare, color: "text-primary bg-primary/10 border-primary/30" },
};

export function UsagePage() {
    const [overall, setOverall] = React.useState<OverallStats | null>(null);
    const [courses, setCourses] = React.useState<CourseUsageData[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [expandedCourseIds, setExpandedCourseIds] = React.useState<Set<string>>(new Set());

    const loadData = React.useCallback(async () => {
        try {
            const data = await fetchApi<{
                overall: OverallStats;
                courses: CourseUsageData[];
            }>("/api/ai/usage/courses");
            setOverall(data.overall);
            setCourses(data.courses);
            // Automatically expand the first course if available
            if (data.courses.length > 0) {
                setExpandedCourseIds(new Set([data.courses[0].courseId]));
            }
        } catch (err) {
            console.error("Failed to load course-wise token usage:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const toggleExpand = (courseId: string) => {
        setExpandedCourseIds((prev) => {
            const next = new Set(prev);
            if (next.has(courseId)) {
                next.delete(courseId);
            } else {
                next.add(courseId);
            }
            return next;
        });
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-12 pt-4">
                <Skeleton className="h-10 w-64 rounded-md" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Skeleton className="h-28 rounded-xl" />
                    <Skeleton className="h-28 rounded-xl" />
                    <Skeleton className="h-28 rounded-xl" />
                </div>
                <Skeleton className="h-96 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-12 pt-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bauhaus-border pb-6 border-l-0 border-r-0 border-t-0">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="size-4 bg-bauhaus-red bauhaus-square shrink-0" />
                        <h1 className="text-3xl font-heading font-black tracking-tight text-foreground uppercase">
                            Course Token Burn Analytics
                        </h1>
                    </div>
                    <p className="text-sm font-mono text-muted-foreground">
                        Detailed AI token consumption organized course-wise across Planning, Lessons, Quizzes, Interviews, and Tutor Q&A.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="bauhaus-square bauhaus-border gap-2 font-bold uppercase tracking-wider text-xs hover:bg-muted self-start md:self-auto"
                >
                    <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
                    Refresh Stats
                </Button>
            </div>

            {/* Overall Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bauhaus-square bauhaus-border bg-card">
                    <CardHeader className="p-4 pb-2 border-b bauhaus-border bg-bauhaus-red/10 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Total Tokens Burned
                        </CardTitle>
                        <Flame className="size-4 text-bauhaus-red" />
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                        <div className="text-3xl font-black font-mono tracking-tight text-foreground">
                            {(overall?.totalTokens || 0).toLocaleString()}
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground mt-1">
                            Across {overall?.totalRuns || 0} total AI agent calls
                        </p>
                    </CardContent>
                </Card>

                <Card className="bauhaus-square bauhaus-border bg-card">
                    <CardHeader className="p-4 pb-2 border-b bauhaus-border bg-bauhaus-blue/10 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Prompt vs Completion
                        </CardTitle>
                        <BarChart2 className="size-4 text-bauhaus-blue" />
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                        <div className="flex items-baseline gap-2 font-mono">
                            <span className="text-xl font-bold text-foreground">
                                {(overall?.promptTokens || 0).toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">/</span>
                            <span className="text-xl font-bold text-bauhaus-yellow">
                                {(overall?.completionTokens || 0).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground mt-1">Prompt / Completion ratio</p>
                    </CardContent>
                </Card>

                <Card className="bauhaus-square bauhaus-border bg-card">
                    <CardHeader className="p-4 pb-2 border-b bauhaus-border bg-bauhaus-yellow/10 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Active Courses Tracked
                        </CardTitle>
                        <GraduationCap className="size-4 text-bauhaus-yellow" />
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                        <div className="text-3xl font-black font-mono tracking-tight text-foreground">
                            {overall?.totalCourses || 0}
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground mt-1">Enrolled & created courses</p>
                    </CardContent>
                </Card>
            </div>

            {/* Course-Wise Token Usage Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold font-heading uppercase tracking-wider text-foreground">
                        Course Token Breakdown
                    </h2>
                    <span className="text-xs font-mono text-muted-foreground">
                        Click any course to view actual counts per item
                    </span>
                </div>

                {courses.length === 0 ? (
                    <Card className="bauhaus-square bauhaus-border p-12 text-center text-muted-foreground">
                        <p className="text-sm font-bold uppercase tracking-wider">No courses found</p>
                        <p className="text-xs mt-1">Create a course to begin tracking course-wise AI token consumption.</p>
                    </Card>
                ) : (
                    courses.map((course) => {
                        const isExpanded = expandedCourseIds.has(course.courseId);
                        const b = course.breakdown;

                        return (
                            <Card key={course.courseId} className="bauhaus-square bauhaus-border bg-card overflow-hidden">
                                {/* Course Card Header */}
                                <div
                                    onClick={() => toggleExpand(course.courseId)}
                                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-muted/40 transition-colors border-b border-border"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2.5 rounded-none bg-primary/10 text-primary border bauhaus-border shrink-0">
                                            <GraduationCap className="size-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-base truncate font-heading uppercase">
                                                    {course.courseTitle}
                                                </h3>
                                                <span
                                                    className={cn(
                                                        "text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider border",
                                                        course.status === "READY" || course.status === "COMPLETED"
                                                            ? "bg-success/15 text-success border-success/30"
                                                            : "bg-bauhaus-yellow/20 text-foreground border-bauhaus-yellow/40"
                                                    )}
                                                >
                                                    {course.status}
                                                </span>
                                            </div>
                                            <p className="text-xs font-mono text-muted-foreground mt-0.5">
                                                {course.runs.length} AI agent calls logged for this course
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 justify-between md:justify-end shrink-0">
                                        <div className="text-right">
                                            <div className="text-xl font-black font-mono text-foreground">
                                                {course.totalTokens.toLocaleString()}
                                            </div>
                                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                                Course Burn Total
                                            </div>
                                        </div>
                                        <Link
                                            to={`/usage/courses/${course.courseId}`}
                                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                            className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground text-xs font-bold font-mono uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                                        >
                                            <BarChart2 className="size-3.5" />
                                            Analytics
                                        </Link>
                                        <Button variant="ghost" size="icon" className="size-8 rounded-none border border-border">
                                            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <CardContent className="p-6 space-y-6 bg-muted/10 border-t border-border">
                                                {/* Activity Breakdown Badges */}
                                                <div>
                                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                                                        Activity Token Distribution
                                                    </h4>
                                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                                        <div className="p-3 bg-card border border-border rounded-none text-center">
                                                            <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                                                                Planning
                                                            </span>
                                                            <span className="text-sm font-bold font-mono text-foreground mt-1 block">
                                                                {b.planner.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="p-3 bg-card border border-border rounded-none text-center">
                                                            <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                                                                Lessons
                                                            </span>
                                                            <span className="text-sm font-bold font-mono text-foreground mt-1 block">
                                                                {b.content.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="p-3 bg-card border border-border rounded-none text-center">
                                                            <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                                                                Quizzes
                                                            </span>
                                                            <span className="text-sm font-bold font-mono text-foreground mt-1 block">
                                                                {b.quiz.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="p-3 bg-card border border-border rounded-none text-center">
                                                            <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                                                                Interview
                                                            </span>
                                                            <span className="text-sm font-bold font-mono text-foreground mt-1 block">
                                                                {b.interview.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="p-3 bg-card border border-border rounded-none text-center">
                                                            <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                                                                AI Tutor
                                                            </span>
                                                            <span className="text-sm font-bold font-mono text-foreground mt-1 block">
                                                                {b.tutor.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Itemized Executions Table */}
                                                <div>
                                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                                                        Itemized Execution Token Counts
                                                    </h4>
                                                    {course.runs.length === 0 ? (
                                                        <p className="text-xs text-muted-foreground">
                                                            No specific agent runs logged for this course yet.
                                                        </p>
                                                    ) : (
                                                        <div className="overflow-x-auto border border-border bg-card">
                                                            <table className="w-full text-left text-xs">
                                                                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                                                                    <tr>
                                                                        <th className="px-4 py-2.5">Date & Time</th>
                                                                        <th className="px-4 py-2.5">Item / Activity</th>
                                                                        <th className="px-4 py-2.5">Agent</th>
                                                                        <th className="px-4 py-2.5 text-right">Prompt</th>
                                                                        <th className="px-4 py-2.5 text-right">Completion</th>
                                                                        <th className="px-4 py-2.5 text-right">Actual Count</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-border font-mono">
                                                                    {course.runs.map((run) => {
                                                                        const meta = agentMeta[run.agent] || {
                                                                            label: run.agent,
                                                                            icon: Bot,
                                                                            color: "text-muted-foreground bg-muted border-border",
                                                                        };
                                                                        const Icon = meta.icon;

                                                                        return (
                                                                            <tr key={run.id} className="hover:bg-muted/30 transition-colors">
                                                                                <td className="px-4 py-2.5 text-muted-foreground">
                                                                                    {new Date(run.createdAt).toLocaleString(undefined, {
                                                                                        month: "short",
                                                                                        day: "numeric",
                                                                                        hour: "2-digit",
                                                                                        minute: "2-digit",
                                                                                    })}
                                                                                </td>
                                                                                <td className="px-4 py-2.5 font-sans font-medium text-foreground">
                                                                                    {run.label}
                                                                                </td>
                                                                                <td className="px-4 py-2.5 font-sans">
                                                                                    <span
                                                                                        className={cn(
                                                                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-none border text-[10px] font-bold uppercase",
                                                                                            meta.color
                                                                                        )}
                                                                                    >
                                                                                        <Icon className="size-3" />
                                                                                        {meta.label}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-4 py-2.5 text-right text-muted-foreground">
                                                                                    {run.promptTokens.toLocaleString()}
                                                                                </td>
                                                                                <td className="px-4 py-2.5 text-right text-muted-foreground">
                                                                                    {run.completionTokens.toLocaleString()}
                                                                                </td>
                                                                                <td className="px-4 py-2.5 text-right font-black text-foreground">
                                                                                    {run.totalTokens.toLocaleString()}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
