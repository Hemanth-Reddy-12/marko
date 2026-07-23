import * as React from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Zap,
    BrainCircuit,
    BookOpen,
    CheckCircle2,
    Bot,
    MessageSquare,
    RefreshCw,
    TrendingUp,
    Flame,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UsageStats {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    totalRuns: number;
}

interface AgentRunRecord {
    id: string;
    agent: "PLANNER" | "CONTENT" | "QUIZ" | "INTERVIEW" | "TUTOR";
    entityType: string;
    entityId: string;
    attempt: number;
    status: "RUNNING" | "SUCCESS" | "FAILED";
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    createdAt: string;
}

const agentConfig = {
    PLANNER: { label: "Course Planner", icon: BrainCircuit, color: "text-bauhaus-blue bg-bauhaus-blue/10 border-bauhaus-blue/30" },
    CONTENT: { label: "Lesson Writer", icon: BookOpen, color: "text-bauhaus-yellow bg-bauhaus-yellow/10 border-bauhaus-yellow/30" },
    QUIZ: { label: "Quiz Engine", icon: CheckCircle2, color: "text-success bg-success/10 border-success/30" },
    INTERVIEW: { label: "Oral Examiner", icon: Bot, color: "text-bauhaus-red bg-bauhaus-red/10 border-bauhaus-red/30" },
    TUTOR: { label: "AI Tutor", icon: MessageSquare, color: "text-primary bg-primary/10 border-primary/30" },
};

export function AiTokenUsageDashboard() {
    const [stats, setStats] = React.useState<UsageStats | null>(null);
    const [history, setHistory] = React.useState<AgentRunRecord[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const loadUsageData = React.useCallback(async () => {
        try {
            const data = await fetchApi<{ stats: UsageStats; history: AgentRunRecord[] }>("/api/ai/usage");
            setStats(data.stats);
            setHistory(data.history);
        } catch (err) {
            console.error("Failed to load AI token usage data:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    React.useEffect(() => {
        loadUsageData();
    }, [loadUsageData]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadUsageData();
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Refresh */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Flame className="size-5 text-bauhaus-red" />
                        AI Token Usage & Burn History
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Track token consumption across Course Planning, Lesson Content, Quizzes, Interviews, and AI Tutor chats.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="gap-2"
                >
                    <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Total Tokens Burned
                        </CardTitle>
                        <Flame className="size-4 text-bauhaus-red" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-black tracking-tight text-foreground font-mono">
                            {(stats?.totalTokens || 0).toLocaleString()}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">Across {stats?.totalRuns || 0} executions</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Prompt Tokens
                        </CardTitle>
                        <FileText className="size-4 text-bauhaus-blue" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                            {(stats?.promptTokens || 0).toLocaleString()}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">Input context & system prompts</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Completion Tokens
                        </CardTitle>
                        <Zap className="size-4 text-bauhaus-yellow" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                            {(stats?.completionTokens || 0).toLocaleString()}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">AI generated text & content</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Total Agent Runs
                        </CardTitle>
                        <TrendingUp className="size-4 text-success" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                            {stats?.totalRuns || 0}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">Completed & active runs</p>
                    </CardContent>
                </Card>
            </div>

            {/* Token History Table */}
            <Card className="border-border overflow-hidden">
                <CardHeader className="p-4 border-b border-border bg-muted/20">
                    <CardTitle className="text-sm font-bold tracking-tight">AI Execution History & Token Burn Table</CardTitle>
                    <CardDescription className="text-xs">Detailed token breakdown per request</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No AI execution history recorded yet. Create a course or chat with the AI Tutor to generate history.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Timestamp</th>
                                        <th className="px-4 py-3">Agent</th>
                                        <th className="px-4 py-3">Target Entity</th>
                                        <th className="px-4 py-3 text-right">Prompt Tokens</th>
                                        <th className="px-4 py-3 text-right">Completion Tokens</th>
                                        <th className="px-4 py-3 text-right">Total Burn</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {history.map((run) => {
                                        const config = agentConfig[run.agent] || {
                                            label: run.agent,
                                            icon: Bot,
                                            color: "text-muted-foreground bg-muted border-border",
                                        };
                                        const Icon = config.icon;

                                        return (
                                            <tr key={run.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 font-mono text-muted-foreground">
                                                    {new Date(run.createdAt).toLocaleString(undefined, {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                    })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium",
                                                            config.color
                                                        )}
                                                    >
                                                        <Icon className="size-3" />
                                                        {config.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-muted-foreground">
                                                    {run.entityType} ({run.entityId.slice(0, 8)}…)
                                                </td>
                                                <td className="px-4 py-3 font-mono text-right text-muted-foreground">
                                                    {run.promptTokens ? run.promptTokens.toLocaleString() : "—"}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-right text-muted-foreground">
                                                    {run.completionTokens ? run.completionTokens.toLocaleString() : "—"}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-right font-bold text-foreground">
                                                    {run.totalTokens ? run.totalTokens.toLocaleString() : "—"}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={cn(
                                                            "inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                                                            run.status === "SUCCESS" && "bg-success/15 text-success",
                                                            run.status === "FAILED" && "bg-destructive/15 text-destructive",
                                                            run.status === "RUNNING" && "bg-bauhaus-yellow/20 text-foreground animate-pulse"
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
