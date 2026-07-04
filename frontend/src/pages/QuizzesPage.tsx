import * as React from "react";
import { fetchApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuizzesPage() {
    const navigate = useNavigate();
    const [upcoming, setUpcoming] = React.useState<any[]>([]);
    const [history, setHistory] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<"upcoming" | "history">("upcoming");

    React.useEffect(() => {
        const load = async () => {
            try {
                const [upcomingData, historyData] = await Promise.all([
                    fetchApi<any[]>("/api/dashboard/quizzes/upcoming"),
                    fetchApi<any[]>("/api/dashboard/quizzes/history")
                ]);
                setUpcoming(upcomingData);
                setHistory(historyData);
            } catch (err) {
                console.error("Failed to load quizzes:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <motion.div 
            className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex justify-between items-end border-b-2 border-foreground pb-6 mt-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-4 bg-bauhaus-red bauhaus-square"></div>
                        <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground uppercase">Quizzes</h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Pending knowledge checks required to progress.</p>
                </div>
            </div>

            <div className="flex gap-4 border-b-2 border-foreground/10 pb-4">
                <button 
                    onClick={() => setActiveTab("upcoming")}
                    className={cn(
                        "text-sm font-bold uppercase tracking-widest px-4 py-2 transition-all",
                        activeTab === "upcoming" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Upcoming ({upcoming.length})
                </button>
                <button 
                    onClick={() => setActiveTab("history")}
                    className={cn(
                        "text-sm font-bold uppercase tracking-widest px-4 py-2 transition-all",
                        activeTab === "history" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    History ({history.length})
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin size-8 border-4 border-bauhaus-red border-t-transparent rounded-full" />
                </div>
            ) : activeTab === "upcoming" ? (
                upcoming.length === 0 ? (
                    <div className="bauhaus-border p-12 text-center bg-card flex flex-col items-center gap-4">
                        <ClipboardCheck className="size-8 text-muted-foreground" />
                        <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground">No pending quizzes</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {upcoming.map((quiz) => (
                            <div key={quiz.id} className="bauhaus-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bauhaus-shadow hover:-translate-y-1 hover:translate-x-1 transition-all">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-bauhaus-blue bg-bauhaus-blue/10 w-fit px-2 py-1">
                                        {quiz.lesson.course.title}
                                    </span>
                                    <h3 className="text-xl font-heading font-bold uppercase tracking-tight">Quiz: {quiz.lesson.title}</h3>
                                </div>
                                <Button 
                                    onClick={() => navigate(`/courses/${quiz.lesson.courseId}/lessons/${quiz.lessonId}/quiz`)}
                                    className="rounded-none bg-bauhaus-red text-white hover:bg-bauhaus-red/90 font-bold uppercase tracking-widest text-xs px-6 h-10 bauhaus-border"
                                >
                                    Start Quiz <ArrowRight className="size-3 ml-2" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                history.length === 0 ? (
                    <div className="bauhaus-border p-12 text-center bg-card flex flex-col items-center gap-4">
                        <ClipboardCheck className="size-8 text-muted-foreground" />
                        <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground">No quiz history</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {history.map((attempt) => (
                            <div key={attempt.id} className="bauhaus-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-muted/30 transition-all">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-bauhaus-yellow bg-bauhaus-yellow/10 w-fit px-2 py-1">
                                        {attempt.quiz.lesson.course.title}
                                    </span>
                                    <h3 className="text-xl font-heading font-bold uppercase tracking-tight">Quiz: {attempt.quiz.lesson.title}</h3>
                                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                                        {new Date(attempt.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Score</span>
                                        <span className={cn("text-2xl font-heading font-black", attempt.passed ? "text-success" : "text-destructive")}>
                                            {Math.round(attempt.score * 100)}%
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "size-12 flex items-center justify-center border-2 rounded-none",
                                        attempt.passed ? "bg-success/10 border-success text-success" : "bg-destructive/10 border-destructive text-destructive"
                                    )}>
                                        {attempt.passed ? <CheckCircle2 className="size-6" /> : <XCircle className="size-6" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </motion.div>
    );
}
