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

    const isApiKeyError = error && (/api key/i.test(error) || /unauthorized|401|invalid/i.test(error));

    if (error) {
        return (
            <div className="flex items-center justify-center h-dvh bg-background p-4">
                <motion.div
                    className="flex flex-col items-center gap-6 max-w-md w-full text-center border border-border bg-card p-12"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="size-16 border border-border bg-muted/20 flex items-center justify-center">
                        <BrainCircuit className="size-8 text-destructive" />
                    </div>
                    <div>
                        <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
                            {isApiKeyError ? "AI Provider API Key Error" : "Interview failed to start"}
                        </h2>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                    {isApiKeyError ? (
                        <Button
                            onClick={() => navigate("/settings")}
                            className="bauhaus-square bg-bauhaus-red text-white hover:bg-bauhaus-red/90 font-bold uppercase tracking-widest text-xs h-11 px-6 border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                        >
                            Configure API Key in Settings
                        </Button>
                    ) : (
                        <Button
                            onClick={() => navigate(-1)}
                            className="rounded-none mt-4 border-2 border-foreground hover:bg-muted font-bold uppercase tracking-widest text-xs h-11 px-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                        >
                            <ArrowLeft className="size-4 mr-2" />
                            Go back
                        </Button>
                    )}
                </motion.div>
            </div>
        );
    }

    if (!sessionId) {
        return (
            <div className="flex flex-col items-center justify-center h-dvh gap-4 bg-background">
                <motion.div
                    className="flex flex-col items-center gap-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="size-16 border border-border bg-muted/20 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                        >
                            <BrainCircuit className="size-8 text-bauhaus-blue" />
                        </motion.div>
                    </div>
                    <div className="text-center flex flex-col gap-2">
                        <p className="text-sm font-heading font-semibold text-foreground uppercase tracking-widest">Preparing your interview</p>
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
                            <div className="size-1.5 bg-bauhaus-blue rounded-none" />
                            Loading milestones…
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!isFullscreen) {
        return (
            <div className="flex items-center justify-center h-dvh bg-background p-4">
                <motion.div
                    className="flex flex-col items-center gap-8 max-w-xl w-full text-center border border-border bg-card p-12"
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="size-16 border border-border bg-muted/20 flex items-center justify-center mb-2">
                        <BrainCircuit className="size-8 text-bauhaus-blue" />
                    </div>

                    <div className="flex flex-col gap-3">
                        <h1 className="text-3xl md:text-4xl font-heading font-semibold tracking-tight text-foreground">
                            Capstone Examination
                        </h1>
                        <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
                            This is a live oral examination. The environment requires your full
                            attention. Please enter fullscreen mode to begin.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 w-full max-w-sm mt-4">
                        <Button
                            onClick={handleEnterFullscreen}
                            className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 h-14 font-semibold text-sm tracking-wide"
                        >
                            <Maximize className="size-4 mr-2" />
                            ENTER INTERVIEW ENVIRONMENT
                        </Button>
                        <Button
                            onClick={() => navigate(-1)}
                            variant="outline"
                            className="w-full rounded-none h-14 text-muted-foreground hover:text-foreground font-medium text-sm"
                        >
                            <ArrowLeft className="size-4 mr-2" />
                            Return to course
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-px w-full max-w-md mt-6 bg-border border border-border">
                        {[
                            { label: "Live AI", desc: "Real-time evaluation" },
                            { label: "Oral Format", desc: "Type your answers" },
                            { label: "Instant Score", desc: "Results on completion" },
                        ].map((item) => (
                            <div key={item.label} className="flex flex-col items-center justify-center gap-1 p-4 bg-card h-full">
                                <span className="text-xs font-bold text-foreground uppercase tracking-widest">{item.label}</span>
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
            <div className="shrink-0 px-6 py-4 bg-background border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BrainCircuit className="size-5 text-bauhaus-blue" />
                    <h1 className="text-sm font-heading font-semibold text-foreground tracking-widest uppercase">Capstone Examination</h1>
                </div>
                <p className="text-xs text-muted-foreground hidden sm:block font-mono tracking-widest uppercase">
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
