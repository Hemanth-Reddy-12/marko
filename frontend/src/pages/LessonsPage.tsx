import * as React from "react";
import { fetchApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function LessonsPage() {
    const navigate = useNavigate();
    const [upcomingLessons, setUpcomingLessons] = React.useState<any[]>([]);
    const [completedLessons, setCompletedLessons] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<"upcoming" | "completed">("upcoming");

    React.useEffect(() => {
        const load = async () => {
            try {
                const [upcomingData, completedData] = await Promise.all([
                    fetchApi<any[]>("/api/dashboard/lessons/upcoming"),
                    fetchApi<any[]>("/api/dashboard/lessons/completed")
                ]);
                setUpcomingLessons(upcomingData);
                setCompletedLessons(completedData);
            } catch (err) {
                console.error("Failed to load lessons:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const lessonsToDisplay = activeTab === "upcoming" ? upcomingLessons : completedLessons;

    return (
        <motion.div 
            className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b-2 border-foreground pb-6 mt-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-4 bg-bauhaus-blue bauhaus-circle"></div>
                        <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground uppercase">Lessons</h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Manage your workload and review completed modules.</p>
                </div>
                <div className="flex bg-card bauhaus-border p-1 w-fit">
                    <button
                        onClick={() => setActiveTab("upcoming")}
                        className={cn(
                            "px-6 py-2 font-bold uppercase tracking-widest text-xs transition-colors",
                            activeTab === "upcoming" ? "bg-bauhaus-blue text-white" : "hover:bg-muted"
                        )}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab("completed")}
                        className={cn(
                            "px-6 py-2 font-bold uppercase tracking-widest text-xs transition-colors",
                            activeTab === "completed" ? "bg-bauhaus-red text-white" : "hover:bg-muted"
                        )}
                    >
                        Completed
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin size-8 border-4 border-bauhaus-blue border-t-transparent rounded-full" />
                </div>
            ) : lessonsToDisplay.length === 0 ? (
                <div className="bauhaus-border p-12 text-center bg-card flex flex-col items-center gap-4">
                    <BookOpen className="size-8 text-muted-foreground" />
                    <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground">
                        No {activeTab} lessons
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {lessonsToDisplay.map((lesson) => (
                        <div key={lesson.id} className="bauhaus-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bauhaus-shadow hover:-translate-y-1 hover:translate-x-1 transition-all">
                            <div className="flex flex-col gap-2">
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest w-fit px-2 py-1",
                                    activeTab === "completed" 
                                        ? "text-green-700 bg-green-500/10" 
                                        : "text-bauhaus-red bg-bauhaus-red/10"
                                )}>
                                    {lesson.course.title}
                                </span>
                                <h3 className="text-xl font-heading font-bold uppercase tracking-tight">{lesson.title}</h3>
                                {activeTab === "upcoming" && lesson.scheduledDate && (
                                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground mt-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-3" />
                                            Scheduled for {new Date(lesson.scheduledDate).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock size-3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                            Est. {lesson.estimateTime || 0} mins
                                        </div>
                                    </div>
                                )}
                                {activeTab === "completed" && lesson.updatedAt && (
                                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground mt-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="size-3 text-green-600" />
                                            Completed on {new Date(lesson.updatedAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock size-3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                            Est. {lesson.estimateTime || 0} mins
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Button 
                                onClick={() => navigate(`/courses/${lesson.course.id}/lessons/${lesson.id}`)}
                                className={cn(
                                    "rounded-none text-white font-bold uppercase tracking-widest text-xs px-6 h-10 bauhaus-border",
                                    activeTab === "completed" 
                                        ? "bg-foreground hover:bg-foreground/90" 
                                        : "bg-bauhaus-blue hover:bg-bauhaus-blue/90"
                                )}
                            >
                                {activeTab === "completed" ? "Review" : "Start"} <ArrowRight className="size-3 ml-2" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
