import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    Flame,
    BrainCircuit,
    BookOpen,
    CheckCircle2,
    Bot,
    MessageSquare,
    RefreshCw,
    Cpu,
    BarChart2,
    TrendingUp,
    FileText,
    Zap,
    GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    BarChart,
    Bar,
    Legend,
} from "recharts";

interface DetailedCourseUsage {
    course: {
        id: string;
        title: string;
        status: string;
    };
    summary: {
        totalTokens: number;
        promptTokens: number;
        completionTokens: number;
        totalRuns: number;
        modelsUsedCount: number;
    };
    activityBreakdown: {
        planner: number;
        content: number;
        quiz: number;
        interview: number;
        tutor: number;
    };
    modelBreakdown: {
        model: string;
        tokens: number;
        count: number;
    }[];
    timeline: {
        date: string;
        tokens: number;
        promptTokens: number;
        completionTokens: number;
    }[];
    runs: {
        id: string;
        agent: "PLANNER" | "CONTENT" | "QUIZ" | "INTERVIEW" | "TUTOR";
        entityType: string;
        entityId: string;
        label: string;
        modelName: string;
        status: "RUNNING" | "SUCCESS" | "FAILED";
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        createdAt: string;
    }[];
}

const COLORS = ["#0055FF", "#FFCC00", "#00CC66", "#FF3333", "#9933FF"];

const agentMeta = {
    PLANNER: { label: "Course Planner", icon: BrainCircuit, color: "text-bauhaus-blue bg-bauhaus-blue/10 border-bauhaus-blue/30" },
    CONTENT: { label: "Lesson Writer", icon: BookOpen, color: "text-bauhaus-yellow bg-bauhaus-yellow/10 border-bauhaus-yellow/30" },
    QUIZ: { label: "Quiz Engine", icon: CheckCircle2, color: "text-success bg-success/10 border-success/30" },
    INTERVIEW: { label: "Oral Examiner", icon: Bot, color: "text-bauhaus-red bg-bauhaus-red/10 border-bauhaus-red/30" },
    TUTOR: { label: "AI Tutor", icon: MessageSquare, color: "text-primary bg-primary/10 border-primary/30" },
};

export function CourseUsageAnalyticsPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const [data, setData] = React.useState<DetailedCourseUsage | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const loadCourseAnalytics = React.useCallback(async () => {
        if (!courseId) return;
        try {
            const res = await fetchApi<DetailedCourseUsage>(`/api/ai/usage/courses/${courseId}`);
            setData(res);
        } catch (err) {
            console.error("Failed to load detailed course AI analytics:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [courseId]);

    React.useEffect(() => {
        loadCourseAnalytics();
    }, [loadCourseAnalytics]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadCourseAnalytics();
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-12 pt-4">
                <Skeleton className="h-8 w-48 rounded-md" />
                <Skeleton className="h-12 w-96 rounded-md" />
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-80 rounded-xl" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12 pt-8 text-center">
                <p className="text-lg font-bold">Course AI Usage Analytics Not Found</p>
                <Link to="/usage" className="text-primary hover:underline text-sm">
                    &larr; Back to Token Usage Dashboard
                </Link>
            </div>
        );
    }

    const { course, summary, activityBreakdown, modelBreakdown, timeline, runs } = data;

    // Prepare chart data
    const pieData = [
        { name: "Course Planning", value: activityBreakdown.planner },
        { name: "Lesson Content", value: activityBreakdown.content },
        { name: "Quizzes", value: activityBreakdown.quiz },
        { name: "Oral Interview", value: activityBreakdown.interview },
        { name: "AI Tutor Q&A", value: activityBreakdown.tutor },
    ].filter((item) => item.value > 0);

    const primaryModel = modelBreakdown.length > 0
        ? modelBreakdown.reduce((prev, curr) => (curr.tokens > prev.tokens ? curr : prev)).model
        : "Standard Model";

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-12 pt-4">
            {/* Top Navigation */}
            <div>
                <Link
                    to="/usage"
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-3"
                >
                    <ArrowLeft className="size-4" />
                    Back to Token Usage Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bauhaus-border pb-6 border-l-0 border-r-0 border-t-0">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-bauhaus-blue/10 text-bauhaus-blue border bauhaus-border shrink-0">
                            <GraduationCap className="size-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black font-heading tracking-tight text-foreground uppercase">
                                    {course.title}
                                </h1>
                                <span className="text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider bg-success/15 text-success border border-success/30">
                                    {course.status}
                                </span>
                            </div>
                            <p className="text-xs font-mono text-muted-foreground mt-0.5">
                                Course-Specific AI Token Burn & Activity Analytics
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="bauhaus-square bauhaus-border gap-2 font-bold uppercase tracking-wider text-xs hover:bg-muted self-start md:self-auto"
                    >
                        <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
                        Refresh Analytics
                    </Button>
                </div>
            </div>

            {/* Summary Hero Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bauhaus-square bauhaus-border bg-card">
                    <CardHeader className="p-4 pb-2 border-b bauhaus-border bg-bauhaus-red/10 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Course Total Tokens
                        </CardTitle>
                        <Flame className="size-4 text-bauhaus-red" />
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                        <div className="text-2xl font-black font-mono tracking-tight text-foreground">
                            {summary.totalTokens.toLocaleString()}
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground mt-1">
                            Across {summary.totalRuns} execution runs
                        </p>
                    </CardContent>
                </Card>

                <Card className="bauhaus-square bauhaus-border bg-card">
                    <CardHeader className="p-4 pb-2 border-b bauhaus-border bg-bauhaus-blue/10 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Input (Prompt) Tokens
                        </CardTitle>
                        <FileText className="size-4 text-bauhaus-blue" />
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                        <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                            {summary.promptTokens.toLocaleString()}
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground mt-1">Prompts & context window</p>
                    </CardContent>
                </Card>

                <Card className="bauhaus-square bauhaus-border bg-card">
                    <CardHeader className="p-4 pb-2 border-b bauhaus-border bg-bauhaus-yellow/10 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Output (Completion) Tokens
                        </CardTitle>
                        <Zap className="size-4 text-bauhaus-yellow" />
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                        <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                            {summary.completionTokens.toLocaleString()}
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground mt-1">Generated text & outputs</p>
                    </CardContent>
                </Card>

                <Card className="bauhaus-square bauhaus-border bg-card">
                    <CardHeader className="p-4 pb-2 border-b bauhaus-border bg-primary/10 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Primary AI Model
                        </CardTitle>
                        <Cpu className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                        <div className="text-lg font-bold font-mono tracking-tight text-foreground truncate" title={primaryModel}>
                            {primaryModel}
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground mt-1">
                            {summary.modelsUsedCount} total model{summary.modelsUsedCount > 1 ? "s" : ""} utilized
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Graphs & Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Breakdown Donut Chart */}
                <Card className="bauhaus-square bauhaus-border bg-card flex flex-col">
                    <CardHeader className="p-4 border-b bauhaus-border bg-muted/20">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <BarChart2 className="size-4 text-bauhaus-blue" />
                            Activity Token Breakdown
                        </CardTitle>
                        <CardDescription className="text-xs font-mono">
                            Token distribution by agent type
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col justify-center items-center min-h-[280px]">
                        {pieData.length === 0 ? (
                            <p className="text-xs text-muted-foreground font-mono">No activity distribution data yet.</p>
                        ) : (
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: any) => `${Number(value).toLocaleString()} tokens`}
                                            contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "0px", fontFamily: "monospace", fontSize: "12px" }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Token Burn Timeline Area Chart */}
                <Card className="bauhaus-square bauhaus-border bg-card flex flex-col">
                    <CardHeader className="p-4 border-b bauhaus-border bg-muted/20">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp className="size-4 text-success" />
                            Daily Token Consumption Timeline
                        </CardTitle>
                        <CardDescription className="text-xs font-mono">
                            Token burn velocity over time
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col justify-center items-center min-h-[280px]">
                        {timeline.length === 0 ? (
                            <p className="text-xs text-muted-foreground font-mono">No timeline data recorded yet.</p>
                        ) : (
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={timeline}>
                                        <defs>
                                            <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0055FF" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#0055FF" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                                        <YAxis tick={{ fontSize: 10, fontFamily: "monospace" }} />
                                        <Tooltip
                                            formatter={(val: any) => `${Number(val).toLocaleString()} tokens`}
                                            contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "0px", fontFamily: "monospace", fontSize: "12px" }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="tokens"
                                            stroke="#0055FF"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#tokenGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* AI Model Distribution Bar Chart */}
            <Card className="bauhaus-square bauhaus-border bg-card">
                <CardHeader className="p-4 border-b bauhaus-border bg-muted/20">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <Cpu className="size-4 text-bauhaus-yellow" />
                        Tokens Consumed per AI Model
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">
                        Breakdown of models invoked for this course
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {modelBreakdown.length === 0 ? (
                        <p className="text-xs text-muted-foreground font-mono">No model breakdown data available.</p>
                    ) : (
                        <div className="w-full h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={modelBreakdown}>
                                    <XAxis dataKey="model" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                                    <YAxis tick={{ fontSize: 10, fontFamily: "monospace" }} />
                                    <Tooltip
                                        formatter={(val: any) => `${Number(val).toLocaleString()} tokens`}
                                        contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "0px", fontFamily: "monospace", fontSize: "12px" }}
                                    />
                                    <Bar dataKey="tokens" fill="#FFCC00" radius={[0, 0, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Full Itemized Execution Log Table */}
            <Card className="bauhaus-square bauhaus-border bg-card overflow-hidden">
                <CardHeader className="p-4 border-b bauhaus-border bg-muted/20">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">
                        Full Itemized Execution Logs
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">
                        Complete historical trace of AI executions for this course
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {runs.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground font-mono">
                            No AI execution logs found for this course.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Timestamp</th>
                                        <th className="px-4 py-3">Activity / Item</th>
                                        <th className="px-4 py-3">Agent</th>
                                        <th className="px-4 py-3">Model Used</th>
                                        <th className="px-4 py-3 text-right">Input Tokens</th>
                                        <th className="px-4 py-3 text-right">Output Tokens</th>
                                        <th className="px-4 py-3 text-right">Total Burn</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border font-mono">
                                    {runs.map((run) => {
                                        const meta = agentMeta[run.agent] || {
                                            label: run.agent,
                                            icon: Bot,
                                            color: "text-muted-foreground bg-muted border-border",
                                        };
                                        const Icon = meta.icon;

                                        return (
                                            <tr key={run.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(run.createdAt).toLocaleString(undefined, {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                    })}
                                                </td>
                                                <td className="px-4 py-3 font-sans font-medium text-foreground">
                                                    {run.label}
                                                </td>
                                                <td className="px-4 py-3 font-sans">
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
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-foreground border border-border text-[10px] font-bold">
                                                        <Cpu className="size-2.5" />
                                                        {run.modelName}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-muted-foreground">
                                                    {run.promptTokens.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right text-muted-foreground">
                                                    {run.completionTokens.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right font-black text-foreground">
                                                    {run.totalTokens.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-center font-sans">
                                                    <span
                                                        className={cn(
                                                            "inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                                                            run.status === "SUCCESS" && "bg-success/15 text-success border-success/30",
                                                            run.status === "FAILED" && "bg-destructive/15 text-destructive border-destructive/30",
                                                            run.status === "RUNNING" && "bg-bauhaus-yellow/20 text-foreground border-bauhaus-yellow/40 animate-pulse"
                                                        )}
                                                    >
                                                        {run.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
