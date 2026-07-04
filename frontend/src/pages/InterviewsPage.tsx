import * as React from "react";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BrainCircuit,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Award,
    Calendar,
    AlertTriangle,
    TrendingUp,
    ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Interview {
    id: string;
    courseId: string;
    createdAt: string;
    passed: boolean | null;
    score: number | null;
    transcript: any; // milestones or message logs
    feedback: any; // feedback summary, strengths, improvements
    course: {
        title: string;
        description: string | null;
        status: string;
    };
}

export function InterviewsPage() {
    const navigate = useNavigate();
    const [interviews, setInterviews] = React.useState<Interview[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<"guides" | "history">("guides");
    const [selectedInterview, setSelectedInterview] = React.useState<Interview | null>(null);

    React.useEffect(() => {
        const loadInterviews = async () => {
            try {
                const data = await fetchApi<Interview[]>("/api/interviews");
                setInterviews(data);
            } catch (err) {
                console.error("Failed to load interviews:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInterviews();
    }, []);

    // Active guides (interviews that represent courses currently in progress or not completed yet, or any course interview plan)
    const guides = interviews.filter((i) => i.score === null);
    // Completed history (interviews with score/feedback)
    const history = interviews.filter((i) => i.score !== null);

    return (
        <motion.div
            className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className="flex justify-between items-end border-b-2 border-foreground pb-6 mt-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-4 bg-bauhaus-blue bauhaus-circle"></div>
                        <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground uppercase">Mock Interviews</h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Review your capstone interview guides and exam history.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b-2 border-foreground/10 pb-4">
                <button
                    onClick={() => setActiveTab("guides")}
                    className={cn(
                        "text-sm font-bold uppercase tracking-widest px-4 py-2 transition-all",
                        activeTab === "guides" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Interview Guides ({guides.length})
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={cn(
                        "text-sm font-bold uppercase tracking-widest px-4 py-2 transition-all",
                        activeTab === "history" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Interview History ({history.length})
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin size-8 border-4 border-bauhaus-blue border-t-transparent rounded-full" />
                </div>
            ) : activeTab === "guides" ? (
                guides.length === 0 ? (
                    <div className="bauhaus-border p-12 text-center bg-card flex flex-col items-center gap-4">
                        <BrainCircuit className="size-8 text-muted-foreground" />
                        <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground">No interview guides generated yet</p>
                        <p className="text-xs text-muted-foreground max-w-sm">Complete lessons to generate your mock interview curriculum outlines.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {guides.map((item) => {
                            // milestones are stored in item.transcript as json array
                            const milestones: any[] = Array.isArray(item.transcript) ? item.transcript : [];
                            return (
                                <div key={item.id} className="bauhaus-border bg-card p-6 flex flex-col gap-6 hover:bauhaus-shadow hover:-translate-y-1 hover:translate-x-1 transition-all">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-bauhaus-blue bg-bauhaus-blue/10 w-fit px-2 py-1">
                                                Active Guide
                                            </span>
                                            <h3 className="text-xl font-heading font-bold uppercase tracking-tight">{item.course.title}</h3>
                                        </div>
                                        <Button
                                            onClick={() => navigate(`/courses/${item.courseId}/interview`)}
                                            className="rounded-none bg-bauhaus-yellow text-black hover:bg-bauhaus-yellow/90 font-bold uppercase tracking-widest text-xs px-6 h-10 bauhaus-border"
                                        >
                                            Enter Room <ArrowRight className="size-3 ml-2" />
                                        </Button>
                                    </div>

                                    {milestones.length > 0 && (
                                        <div className="flex flex-col gap-3">
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Interview Milestones</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {milestones.map((m, idx) => (
                                                    <div key={idx} className="flex gap-3 bg-muted/40 p-4 border border-border">
                                                        <span className="font-heading font-bold text-lg text-muted-foreground/40">{idx + 1}</span>
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-sm font-semibold uppercase tracking-wider text-foreground">{m.topic || m.title || "Topic"}</p>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">{m.description || m.focus || "Evaluation milestone focus area."}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            ) : history.length === 0 ? (
                <div className="bauhaus-border p-12 text-center bg-card flex flex-col items-center gap-4">
                    <Award className="size-8 text-muted-foreground" />
                    <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground">No completed interviews yet</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {history.map((item) => (
                        <div key={item.id} className="bauhaus-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-muted/30 transition-all">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-bauhaus-red bg-bauhaus-red/10 w-fit px-2 py-1">
                                    {item.course.title}
                                </span>
                                <h3 className="text-xl font-heading font-bold uppercase tracking-tight">Capstone Examination</h3>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1">
                                    <Calendar className="size-3.5" />
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Score</span>
                                    <span className={cn("text-2xl font-heading font-black", item.passed ? "text-success" : "text-destructive")}>
                                        {Math.round((item.score ?? 0) * 100)}%
                                    </span>
                                </div>
                                <div className={cn(
                                    "size-12 flex items-center justify-center border-2 rounded-none shrink-0",
                                    item.passed ? "bg-success/10 border-success text-success" : "bg-destructive/10 border-destructive text-destructive"
                                )}>
                                    {item.passed ? <CheckCircle2 className="size-6" /> : <XCircle className="size-6" />}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedInterview(item)}
                                    className="rounded-none h-10 border-foreground text-foreground hover:bg-muted font-bold text-xs uppercase tracking-widest"
                                >
                                    Feedback
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Feedback details overlay */}
            <AnimatePresence>
                {selectedInterview && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-end bg-background/80 backdrop-blur-sm"
                        onClick={() => setSelectedInterview(null)}
                    >
                        <motion.div
                            className="w-full max-w-lg bg-card h-full border-l-2 border-foreground p-8 flex flex-col gap-6 overflow-y-auto"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start border-b-2 border-foreground pb-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-bauhaus-red bg-bauhaus-red/10 w-fit px-2 py-1">
                                        {selectedInterview.course.title}
                                    </span>
                                    <h2 className="text-2xl font-heading font-bold text-foreground uppercase tracking-tight">Examiner Report</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedInterview(null)}
                                    className="text-muted-foreground hover:text-foreground font-mono text-sm uppercase tracking-widest font-bold"
                                >
                                    [ Close ]
                                </button>
                            </div>

                            {/* Score card */}
                            <div className={cn(
                                "p-6 border flex items-center justify-between",
                                selectedInterview.passed ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"
                            )}>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Result Status</p>
                                    <h3 className="text-xl font-heading font-bold uppercase tracking-tight">
                                        {selectedInterview.passed ? "Passed / Certified" : "Failed / Refine skills"}
                                    </h3>
                                </div>
                                <span className={cn("text-3xl font-heading font-black", selectedInterview.passed ? "text-success" : "text-destructive")}>
                                    {Math.round((selectedInterview.score ?? 0) * 100)}%
                                </span>
                            </div>

                            {/* Strengths */}
                            {selectedInterview.feedback?.strengths?.length > 0 && (
                                <div className="flex flex-col gap-3 p-5 bg-success/10 border border-success/30">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-success" />
                                        <p className="text-[10px] font-bold text-success uppercase tracking-widest">Strengths</p>
                                    </div>
                                    <ul className="flex flex-col gap-2">
                                        {selectedInterview.feedback.strengths.map((s: string, idx: number) => (
                                            <li key={idx} className="text-sm leading-relaxed text-foreground">
                                                • {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Areas to improve */}
                            {selectedInterview.feedback?.areasOfImprovement?.length > 0 && (
                                <div className="flex flex-col gap-3 p-5 bg-bauhaus-yellow/10 border border-bauhaus-yellow/30">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="size-4 text-bauhaus-yellow" />
                                        <p className="text-[10px] font-bold text-black dark:text-bauhaus-yellow uppercase tracking-widest">Improvement points</p>
                                    </div>
                                    <ul className="flex flex-col gap-2">
                                        {selectedInterview.feedback.areasOfImprovement.map((a: string, idx: number) => (
                                            <li key={idx} className="text-sm leading-relaxed text-foreground">
                                                • {a}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Failed details */}
                            {selectedInterview.feedback?.failReason && (
                                <div className="flex flex-col gap-3 p-5 bg-destructive/10 border border-destructive/30">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="size-4 text-destructive" />
                                        <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">Fail Reason</p>
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground">{selectedInterview.feedback.failReason}</p>
                                </div>
                            )}

                            {/* Summary */}
                            {(selectedInterview.feedback?.feedback || selectedInterview.feedback) && (
                                <div className="flex flex-col gap-3 p-5 bg-muted/40 border border-border">
                                    <div className="flex items-center gap-2">
                                        <ScrollText className="size-4 text-muted-foreground" />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">General Review</p>
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                        {selectedInterview.feedback?.feedback || selectedInterview.feedback}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
