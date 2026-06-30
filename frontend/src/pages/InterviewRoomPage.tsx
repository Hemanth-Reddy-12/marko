import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatUI } from "../features/chat/components/ChatUI";
import { initInterview } from "../features/chat/api/chat.api";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { Maximize, ArrowLeft, BrainCircuit } from "lucide-react";

export function InterviewRoomPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (!courseId) return;

        const startInterview = async () => {
            try {
                const data = await initInterview({ courseId });
                setSessionId(data.sessionId);
            } catch (err: any) {
                setError(err.message || "Failed to initialize interview.");
            }
        };

        startInterview();
    }, [courseId]);

    const handleEnterFullscreen = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
            setIsFullscreen(true);
        } catch {
            setIsFullscreen(true);
        }
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-dvh bg-background p-4">
                <motion.div
                    className="flex flex-col items-center gap-6 max-w-md w-full text-center"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="size-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                        <BrainCircuit className="size-7 text-destructive" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground mb-2">Interview failed to start</h2>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                    <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
                        <ArrowLeft className="size-4" />
                        Go back
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (!sessionId) {
        return (
            <div className="flex flex-col items-center justify-center h-dvh gap-4 bg-background">
                <motion.div
                    className="flex flex-col items-center gap-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="size-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                        >
                            <BrainCircuit className="size-7 text-accent" />
                        </motion.div>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">Preparing your interview</p>
                        <p className="text-xs text-muted-foreground mt-1 animate-pulse">Loading milestones…</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!isFullscreen) {
        return (
            <div className="flex items-center justify-center h-dvh bg-background p-4">
                <motion.div
                    className="flex flex-col items-center gap-6 max-w-lg w-full text-center"
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="size-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                        <BrainCircuit className="size-8 text-accent" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                            Capstone Examination
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                            This is a live oral examination. The environment requires your full
                            attention — please enter fullscreen mode to begin.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                        <Button
                            onClick={handleEnterFullscreen}
                            size="lg"
                            className="w-full bg-accent hover:bg-accent/90 text-white shadow-sm gap-2 text-sm font-semibold"
                        >
                            <Maximize className="size-4" />
                            Enter Interview Environment
                        </Button>
                        <Button
                            onClick={() => navigate(-1)}
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground gap-1.5"
                        >
                            <ArrowLeft className="size-3.5" />
                            Return to course
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full max-w-sm pt-2">
                        {[
                            { label: "Live AI", desc: "Real-time evaluation" },
                            { label: "Oral Format", desc: "Type your answers" },
                            { label: "Instant Score", desc: "Results on completion" },
                        ].map((item) => (
                            <div key={item.label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/50 border border-border/50">
                                <span className="text-xs font-bold text-foreground">{item.label}</span>
                                <span className="text-[10px] text-muted-foreground text-center leading-tight">{item.desc}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-dvh w-screen bg-background overflow-hidden">
            {/* Compact interview header */}
            <div className="shrink-0 px-4 md:px-6 py-2.5 bg-background border-b border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="size-4 text-accent" />
                    <h1 className="text-sm font-bold text-foreground">Capstone Examination</h1>
                </div>
                <p className="text-xs text-muted-foreground hidden sm:block">
                    Your answers are evaluated for course mastery.
                </p>
            </div>

            {/* Chat fills all remaining space */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <ChatUI sessionId={sessionId} />
            </div>
        </div>
    );
}
