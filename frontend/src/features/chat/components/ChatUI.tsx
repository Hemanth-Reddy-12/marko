import React, { useState, useEffect, useRef } from "react";
import { useWebSocket } from "../../../hooks/useWebSocket";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { motion } from "framer-motion";

interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

interface ChatUIProps {
    sessionId: string;
}

const TypingIndicator = () => (
    <div className="flex space-x-1 p-2">
        <motion.div
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }}
        />
        <motion.div
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.div
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.4 }}
        />
    </div>
);

export function ChatUI({ sessionId }: ChatUIProps) {
    const { socket, isConnected } = useWebSocket(sessionId);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [interviewComplete, setInterviewComplete] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!socket) return;

        socket.on("new_message", (msg: ChatMessage) => {
            setMessages((prev) => [...prev, msg]);
            setIsTyping(false);
        });

        socket.on("interview_complete", (data) => {
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

    const handleSend = () => {
        if (!input.trim() || !socket) return;

        const userMsg: ChatMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        
        socket.emit("send_message", {
            sessionId,
            content: input,
        });
        
        setInput("");
        setIsTyping(true);
    };

    return (
        <Card className="flex flex-col h-[600px] w-full max-w-3xl mx-auto overflow-hidden shadow-lg border-2">
            <div className="bg-primary p-4 text-primary-foreground font-semibold flex justify-between items-center shadow-md z-10">
                <span className="text-lg">Capstone Interview</span>
                <span className="text-sm font-medium flex items-center gap-2">
                    {isConnected ? (
                        <><span className="w-2 h-2 rounded-full bg-green-400"></span> Connected</>
                    ) : (
                        <><span className="w-2 h-2 rounded-full bg-red-400"></span> Disconnected</>
                    )}
                </span>
            </div>
            
            <ScrollArea className="flex-1 p-4 bg-muted/20">
                <div className="space-y-4 pb-4">
                    {messages.length === 0 && !isTyping && (
                        <div className="text-center text-muted-foreground mt-10">
                            The interview will start shortly. Please wait...
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${
                                msg.role === "user" ? "justify-end" : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-xl shadow-sm ${
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                        : "bg-background border rounded-bl-none text-foreground"
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-background border p-2 rounded-xl rounded-bl-none shadow-sm">
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                    {interviewComplete && feedback && (
                        <div className="mt-6 p-6 border-2 rounded-xl shadow-sm bg-background">
                            <h3 className="font-bold text-xl mb-4">Interview Evaluation Complete</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="p-4 bg-muted rounded-lg text-center">
                                    <p className="text-sm text-muted-foreground mb-1">Score</p>
                                    <p className="text-3xl font-bold">{feedback.score}/100</p>
                                </div>
                                <div className={`p-4 rounded-lg text-center ${feedback.passed ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    <p className="text-sm opacity-80 mb-1">Status</p>
                                    <p className="text-3xl font-bold">{feedback.passed ? 'Passed' : 'Failed'}</p>
                                </div>
                            </div>
                            {feedback.feedbackData?.failReason && (
                                <div className="p-4 bg-red-50/50 border border-red-100 rounded-lg mb-4 text-red-800">
                                    <p className="text-sm font-bold mb-1 flex items-center gap-2">⚠️ Fail Reason</p>
                                    <p className="text-sm">{feedback.feedbackData.failReason}</p>
                                </div>
                            )}

                            {feedback.feedbackData?.strengths?.length > 0 && (
                                <div className="p-4 bg-green-50/50 border border-green-100 rounded-lg mb-4 text-green-900">
                                    <p className="text-sm font-bold mb-2">✅ Strengths</p>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        {feedback.feedbackData.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            )}

                            {feedback.feedbackData?.areasOfImprovement?.length > 0 && (
                                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-lg mb-4 text-amber-900">
                                    <p className="text-sm font-bold mb-2">🎯 Areas of Improvement</p>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        {feedback.feedbackData.areasOfImprovement.map((a: string, i: number) => <li key={i}>{a}</li>)}
                                    </ul>
                                </div>
                            )}

                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm font-bold mb-2">General Feedback:</p>
                                <p className="text-sm whitespace-pre-wrap">{feedback.feedbackData?.feedback || feedback.feedback}</p>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>
            
            <div className="p-4 bg-background border-t flex space-x-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type your answer..."
                    disabled={!isConnected || isTyping || interviewComplete}
                    className="flex-1"
                />
                <Button 
                    onClick={handleSend} 
                    disabled={!isConnected || !input.trim() || isTyping || interviewComplete}
                    className="px-8"
                >
                    Send
                </Button>
            </div>
        </Card>
    );
}
