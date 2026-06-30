import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../../../hooks/useWebSocket";
import { Button } from "../../../components/ui/button";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Zap,
    Wifi,
    WifiOff,
    Send,
    Home,
    TrendingUp,
} from "lucide-react";
import { cn } from "../../../lib/utils";

interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

interface ChatUIProps {
    sessionId: string;
}

const TypingIndicator = () => (
    <div className="flex items-center gap-1 px-1 py-0.5">
        {[0, 0.15, 0.3].map((delay, i) => (
            <motion.span
                key={i}
                className="block size-2 rounded-full bg-muted-foreground/50"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut", delay }}
            />
        ))}
    </div>
);

const msgVariants = {
    initial: { opacity: 0, y: 10, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
};

export function ChatUI({ sessionId }: ChatUIProps) {
    const { socket, isConnected } = useWebSocket(sessionId);
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [interviewComplete, setInterviewComplete] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!socket) return;

        socket.on("new_message", (msg: ChatMessage) => {
            setMessages((prev) => [...prev, msg]);
            setIsTyping(false);
        });

        socket.on("interview_complete", (data: any) => {
            setInterviewComplete(true);
            setFeedback(data);
        });

        return () => {
            socket.off("new_message");
            socket.off("interview_complete");
        };
    }, [socket]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    // Auto-focus input when connected
    useEffect(() => {
        if (isConnected && inputRef.current && !interviewComplete) {
            inputRef.current.focus();
        }
    }, [isConnected, interviewComplete]);

    const handleSend = () => {
        if (!input.trim() || !socket || interviewComplete) return;

        const userMsg: ChatMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);

        socket.emit("send_message", { sessionId, content: input });
        setInput("");
        setIsTyping(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const scorePercent = feedback?.score ?? 0;
    const passed = feedback?.passed ?? false;

    return (
        <div className="flex flex-col h-full w-full bg-background overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 bg-background border-b border-border/60 backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Zap className="size-4 text-accent" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground leading-none">Capstone Interview</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Live oral examination</p>
                    </div>
                </div>
                <div className={cn(
                    "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors",
                    isConnected
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-600 border-red-200"
                )}>
                    <motion.span
                        className={cn("block size-1.5 rounded-full", isConnected ? "bg-emerald-500" : "bg-red-500")}
                        animate={isConnected ? { scale: [1, 1.4, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                    />
                    {isConnected ? (
                        <><Wifi className="size-3" /> Live</>
                    ) : (
                        <><WifiOff className="size-3" /> Offline</>
                    )}
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 md:px-6 py-4">
                <div className="flex flex-col gap-3 pb-2 max-w-3xl mx-auto w-full">
                    {messages.length === 0 && !isTyping && (
                        <motion.div
                            className="flex flex-col items-center gap-3 py-16 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="size-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                                <Zap className="size-6 text-accent" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Interview starting…</p>
                                <p className="text-xs text-muted-foreground mt-1">The examiner will ask your first question shortly.</p>
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                variants={msgVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className={cn(
                                    "flex w-full",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                                    msg.role === "user"
                                        ? "bg-accent text-white rounded-br-sm shadow-sm shadow-accent/20"
                                        : "bg-card border border-border text-foreground rounded-bl-sm shadow-sm"
                                )}>
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    <AnimatePresence>
                        {isTyping && (
                            <motion.div
                                className="flex justify-start"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="bg-card border border-border px-3 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
                                    <TypingIndicator />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results Panel */}
                    <AnimatePresence>
                        {interviewComplete && feedback && (
                            <motion.div
                                className="mt-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
                                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {/* Result header */}
                                <div className={cn(
                                    "px-6 py-5 border-b border-border",
                                    passed ? "bg-emerald-50" : "bg-red-50"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Interview Complete</p>
                                            <h3 className="text-xl font-bold text-foreground">
                                                {passed ? "Excellent work!" : "Keep practicing."}
                                            </h3>
                                        </div>
                                        <div className={cn(
                                            "size-16 rounded-2xl flex flex-col items-center justify-center border-2 shadow-sm",
                                            passed ? "border-emerald-300 bg-emerald-100" : "border-red-300 bg-red-100"
                                        )}>
                                            <span className={cn("text-2xl font-black", passed ? "text-emerald-700" : "text-red-700")}>
                                                {scorePercent}
                                            </span>
                                            <span className={cn("text-[10px] font-semibold", passed ? "text-emerald-600" : "text-red-600")}>
                                                / 100
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-3 h-2 rounded-full bg-black/10 overflow-hidden">
                                        <motion.div
                                            className={cn("h-full rounded-full", passed ? "bg-emerald-500" : "bg-red-500")}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${scorePercent}%` }}
                                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col gap-4">
                                    {/* Fail reason */}
                                    {feedback.feedbackData?.failReason && (
                                        <div className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                                            <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-red-700 mb-1">Why you didn't pass</p>
                                                <p className="text-sm text-red-800">{feedback.feedbackData.failReason}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Strengths */}
                                    {feedback.feedbackData?.strengths?.length > 0 && (
                                        <div className="flex gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                            <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-emerald-700 mb-2">Strengths</p>
                                                <ul className="flex flex-col gap-1">
                                                    {feedback.feedbackData.strengths.map((s: string, i: number) => (
                                                        <li key={i} className="text-sm text-emerald-900">• {s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* Improvements */}
                                    {feedback.feedbackData?.areasOfImprovement?.length > 0 && (
                                        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                            <TrendingUp className="size-4 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-amber-700 mb-2">Areas to improve</p>
                                                <ul className="flex flex-col gap-1">
                                                    {feedback.feedbackData.areasOfImprovement.map((a: string, i: number) => (
                                                        <li key={i} className="text-sm text-amber-900">• {a}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* General feedback */}
                                    {(feedback.feedbackData?.feedback || feedback.feedback) && (
                                        <div className="p-4 bg-muted/50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <XCircle className="size-3.5 text-muted-foreground" />
                                                <p className="text-xs font-bold text-muted-foreground">Examiner feedback</p>
                                            </div>
                                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                                {feedback.feedbackData?.feedback || feedback.feedback}
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => navigate("/dashboard")}
                                        size="lg"
                                        className="w-full bg-accent hover:bg-accent/90 text-white shadow-sm mt-2"
                                    >
                                        <Home className="size-4 mr-2" />
                                        Return to Dashboard
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input bar */}
            <div className="shrink-0 px-4 md:px-6 py-3 bg-background border-t border-border/60">
                <div className="max-w-3xl mx-auto w-full flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={interviewComplete ? "Interview complete." : "Type your answer… (Enter to send, Shift+Enter for new line)"}
                            disabled={!isConnected || isTyping || interviewComplete}
                            rows={1}
                            className={cn(
                                "w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-sm",
                                "placeholder:text-muted-foreground",
                                "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "transition-all duration-200 min-h-[44px] max-h-32",
                                "scrollbar-thin scrollbar-thumb-border"
                            )}
                            style={{ height: "auto", overflowY: input.split("\n").length > 3 ? "auto" : "hidden" }}
                            onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = "auto";
                                el.style.height = Math.min(el.scrollHeight, 128) + "px";
                            }}
                        />
                    </div>
                    <Button
                        onClick={handleSend}
                        disabled={!isConnected || !input.trim() || isTyping || interviewComplete}
                        size="icon"
                        className="size-11 rounded-xl bg-accent hover:bg-accent/90 text-white shadow-sm shrink-0 disabled:opacity-40 transition-all duration-200"
                    >
                        <Send className="size-4" />
                    </Button>
                </div>
                {!isConnected && (
                    <p className="text-center text-xs text-red-500 mt-2">
                        Connection lost — attempting to reconnect…
                    </p>
                )}
            </div>
        </div>
    );
}
