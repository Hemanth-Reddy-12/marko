import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../../lib/auth-client";
import { getSessionMessages, sendSessionMessage } from "../api/chat.api";
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
import { Celebration } from "../../../components/ui/celebration";

interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

interface ChatUIProps {
    sessionId: string;
}

const TypingIndicator = () => (
    <div className="flex items-center gap-2 px-2 py-1">
        {[0, 0.15, 0.3].map((delay, i) => (
            <motion.span
                key={i}
                className="block size-2 bg-foreground rounded-none"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay }}
            />
        ))}
    </div>
);

const msgVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
};

export function ChatUI({ sessionId }: ChatUIProps) {
    const { data: sessionData } = useSession();
    const userId = sessionData?.user?.id;
    const [isConnected, setIsConnected] = useState(true);
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [interviewComplete, setInterviewComplete] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!sessionId) return;
        
        const loadMessages = async () => {
            try {
                setIsConnected(true);
                setIsTyping(true);
                const data = await getSessionMessages(sessionId);
                setMessages(data.messages);
                if (data.isComplete) {
                    setInterviewComplete(true);
                    setFeedback({
                        score: data.score,
                        passed: data.passed,
                        feedbackData: data.feedbackData,
                    });
                }
            } catch (err) {
                console.error("Failed to load messages", err);
                setIsConnected(false);
            } finally {
                setIsTyping(false);
            }
        };

        loadMessages();
    }, [sessionId]);

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

    const handleSend = async () => {
        if (!input.trim() || interviewComplete) return;

        const userMsgText = input;
        const userMsg: ChatMessage = { role: "user", content: userMsgText };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);
        setIsConnected(true);

        try {
            const data = await sendSessionMessage(sessionId, userMsgText);
            if (data.assistantMessage) {
                setMessages((prev) => [...prev, data.assistantMessage!]);
            }
            if (data.isComplete) {
                setInterviewComplete(true);
                setFeedback({
                    score: data.score,
                    passed: data.passed,
                    feedbackData: data.feedbackData,
                });
            }
        } catch (err) {
            console.error("Failed to send message", err);
            setIsConnected(false);
        } finally {
            setIsTyping(false);
        }
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
            <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-muted/20 border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="size-10 border border-border bg-card flex items-center justify-center">
                        <Zap className="size-5 text-foreground" />
                    </div>
                    <div>
                        <p className="text-base font-heading font-semibold text-foreground">Live Interview Session</p>
                        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">AI Examiner is active</p>
                    </div>
                </div>
                <div className={cn(
                    "flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest border",
                    isConnected
                        ? "bg-success/10 text-success border-success/30"
                        : "bg-destructive/10 text-destructive border-destructive/30"
                )}>
                    <motion.span
                        className={cn("block size-2 rounded-none", isConnected ? "bg-success" : "bg-destructive")}
                        animate={isConnected ? { opacity: [1, 0.5, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                    {isConnected ? "Connected" : "Offline"}
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 md:px-8 py-6">
                <div className="flex flex-col gap-6 pb-4 max-w-4xl mx-auto w-full">
                    {messages.length === 0 && !isTyping && (
                        <motion.div
                            className="flex flex-col items-center justify-center gap-4 py-32 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="size-16 border border-border bg-muted/20 flex items-center justify-center">
                                <Zap className="size-8 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col gap-2 mt-2">
                                <p className="text-lg font-heading font-semibold text-foreground uppercase tracking-widest">Interview Starting</p>
                                <p className="text-sm text-muted-foreground font-mono">The examiner will ask your first question shortly.</p>
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
                                    "max-w-[85%] md:max-w-[75%] px-5 py-4 text-sm md:text-base leading-relaxed border",
                                    msg.role === "user"
                                        ? "bg-foreground text-background border-foreground"
                                        : "bg-card text-foreground border-border shadow-none"
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
                                <div className="bg-card border border-border px-5 py-4">
                                    <TypingIndicator />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results Panel */}
                    <AnimatePresence>
                        {interviewComplete && feedback && (
                            <motion.div
                                className="mt-8 border border-border bg-card shadow-none"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {/* Result header */}
                                <div className={cn(
                                    "px-8 py-6 border-b border-border",
                                    passed ? "bg-success/10" : "bg-destructive/10"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-2">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Interview Complete</p>
                                            <h3 className="text-2xl font-heading font-semibold text-foreground tracking-tight">
                                                {passed ? "Assessment Passed" : "Assessment Failed"}
                                            </h3>
                                        </div>
                                        <div className={cn(
                                            "size-20 flex flex-col items-center justify-center border bg-card",
                                            passed ? "border-success" : "border-destructive"
                                        )}>
                                            <span className={cn("text-2xl font-heading font-black", passed ? "text-success" : "text-destructive")}>
                                                {scorePercent}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-6 h-2 bg-muted overflow-hidden border border-border">
                                        <motion.div
                                            className={cn("h-full", passed ? "bg-success" : "bg-destructive")}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${scorePercent}%` }}
                                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                                        />
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col gap-6">
                                    {/* Fail reason */}
                                    {feedback.feedbackData?.failReason && (
                                        <div className="flex flex-col gap-3 p-5 bg-destructive/10 border border-destructive/30">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="size-4 text-destructive shrink-0" />
                                                <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">Why you didn't pass</p>
                                            </div>
                                            <p className="text-sm text-foreground leading-relaxed">{feedback.feedbackData.failReason}</p>
                                        </div>
                                    )}

                                    {/* Strengths */}
                                    {feedback.feedbackData?.strengths?.length > 0 && (
                                        <div className="flex flex-col gap-3 p-5 bg-success/10 border border-success/30">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="size-4 text-success shrink-0" />
                                                <p className="text-[10px] font-bold text-success uppercase tracking-widest">Strengths</p>
                                            </div>
                                            <ul className="flex flex-col gap-2">
                                                {feedback.feedbackData.strengths.map((s: string, i: number) => (
                                                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                                        <span className="text-success mt-1 text-xs">■</span> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Improvements */}
                                    {feedback.feedbackData?.areasOfImprovement?.length > 0 && (
                                        <div className="flex flex-col gap-3 p-5 bg-bauhaus-yellow/10 border border-bauhaus-yellow/30">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="size-4 text-bauhaus-yellow shrink-0" />
                                                <p className="text-[10px] font-bold text-black dark:text-bauhaus-yellow uppercase tracking-widest">Areas to improve</p>
                                            </div>
                                            <ul className="flex flex-col gap-2">
                                                {feedback.feedbackData.areasOfImprovement.map((a: string, i: number) => (
                                                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                                        <span className="text-bauhaus-yellow mt-1 text-xs">■</span> {a}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* General feedback */}
                                    {(feedback.feedbackData?.feedback || feedback.feedback) && (
                                        <div className="p-5 bg-muted/30 border border-border mt-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <XCircle className="size-4 text-muted-foreground" />
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Examiner summary</p>
                                            </div>
                                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                                {feedback.feedbackData?.feedback || feedback.feedback}
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => navigate("/dashboard")}
                                        className="w-full rounded-none h-14 bg-foreground text-background hover:bg-foreground/90 font-semibold tracking-wide text-sm mt-4"
                                    >
                                        <Home className="size-4 mr-2" />
                                        RETURN TO DASHBOARD
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input bar */}
            <div className="shrink-0 px-4 md:px-8 py-4 bg-muted/20 border-t border-border">
                <div className="max-w-4xl mx-auto w-full flex items-end gap-4">
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
                                "w-full resize-none rounded-none border border-border bg-card px-5 py-4 text-sm md:text-base",
                                "placeholder:text-muted-foreground",
                                "focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "transition-colors duration-200 min-h-[56px] max-h-40",
                                "scrollbar-thin scrollbar-thumb-border shadow-none"
                            )}
                            style={{ height: "auto", overflowY: input.split("\n").length > 3 ? "auto" : "hidden" }}
                            onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = "auto";
                                el.style.height = Math.min(el.scrollHeight, 160) + "px";
                            }}
                        />
                    </div>
                    <Button
                        onClick={handleSend}
                        disabled={!isConnected || !input.trim() || isTyping || interviewComplete}
                        className="h-[56px] w-[56px] rounded-none bg-foreground hover:bg-foreground/90 text-background shrink-0 disabled:opacity-40 transition-colors duration-200"
                    >
                        <Send className="size-5" />
                    </Button>
                </div>
                {!isConnected && (
                    <p className="text-center text-xs text-destructive font-mono uppercase tracking-widest mt-3">
                        Connection lost — attempting to reconnect…
                    </p>
                )}
            </div>
            {interviewComplete && passed && <Celebration />}
        </div>
    );
}
