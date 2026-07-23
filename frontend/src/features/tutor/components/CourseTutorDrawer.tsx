import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bot,
    User,
    X,
    Send,
    Trash2,
    Sparkles,
    BookOpen,
    HelpCircle,
    Code,
    RefreshCw,
    Wifi,
    WifiOff,
    Maximize2,
    Minimize2,
} from "lucide-react";
import { useTutorSocket } from "../hooks/useTutorSocket";
import { clearTutorHistory } from "../api/tutor.api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CourseTutorDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseTitle?: string;
    lessonId?: string;
    lessonTitle?: string;
}

const PROMPT_CHIPS = [
    { label: "Explain simply", icon: HelpCircle, prompt: "Can you explain this lesson in simple terms with a real-world analogy?" },
    { label: "Code Example", icon: Code, prompt: "Can you show me a practical code example illustrating this concept?" },
    { label: "Test My Knowledge", icon: Sparkles, prompt: "Ask me a quick practice question to test if I understand this topic." },
    { label: "Why It Matters", icon: BookOpen, prompt: "Why is this concept important in real-world software engineering?" },
];

export function CourseTutorDrawer({
    isOpen,
    onClose,
    courseId,
    courseTitle,
    lessonId,
    lessonTitle,
}: CourseTutorDrawerProps) {
    const {
        isConnected,
        messages,
        isStreaming,
        streamingContent,
        sendMessage,
        resetMessages,
    } = useTutorSocket(courseId, lessonId);

    const [input, setInput] = React.useState("");
    const [clearing, setClearing] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to latest message
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, streamingContent, isStreaming]);

    // Focus input on open
    React.useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || isStreaming) return;
        sendMessage(trimmed);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = async () => {
        if (!courseId) return;
        try {
            setClearing(true);
            await clearTutorHistory(courseId);
            resetMessages();
            toast.success("Chat history cleared");
        } catch (err: any) {
            toast.error(err.message || "Failed to clear chat history");
        } finally {
            setClearing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40"
                    />

                    {/* Drawer Panel */}
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={cn(
                            "fixed top-0 right-0 bottom-0 z-50 bg-background border-l border-border shadow-2xl flex flex-col transition-all duration-300",
                            isExpanded ? "w-full inset-0 sm:w-full md:w-full" : "w-full sm:w-[480px] md:w-[540px]"
                        )}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                                    <Bot className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm truncate">AI Course Tutor</h3>
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
                                                isConnected
                                                    ? "bg-success/10 text-success border-success/20"
                                                    : "bg-muted text-muted-foreground border-border"
                                            )}
                                        >
                                            {isConnected ? <Wifi className="size-2.5" /> : <WifiOff className="size-2.5" />}
                                            {isConnected ? "Live" : "Connecting"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {lessonTitle ? `Lesson: ${lessonTitle}` : courseTitle || "General Course Q&A"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsExpanded((prev) => !prev)}
                                    title={isExpanded ? "Restore side drawer" : "Fullscreen mode"}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                    {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                                </Button>
                                {messages.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClear}
                                        disabled={clearing || isStreaming}
                                        title="Clear chat history"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Message Stream */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && !isStreaming && (
                                <div className="text-center py-8 px-4 space-y-4">
                                    <div className="size-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                                        <Sparkles className="size-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-sm">How can I help you today?</h4>
                                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                            Ask any question about {lessonTitle ? `"${lessonTitle}"` : "this course"}. I can explain code, clarify concepts, or quiz your understanding.
                                        </p>
                                    </div>

                                    {/* Starter Chips */}
                                    <div className="grid grid-cols-2 gap-2 pt-2 text-left">
                                        {PROMPT_CHIPS.map((chip, idx) => {
                                            const Icon = chip.icon;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => sendMessage(chip.prompt)}
                                                    className="p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all text-xs space-y-1 group text-left cursor-pointer"
                                                >
                                                    <Icon className="size-4 text-primary group-hover:scale-110 transition-transform" />
                                                    <div className="font-medium text-foreground">{chip.label}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex gap-3 text-sm",
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {msg.role !== "user" && (
                                        <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                                            <Bot className="size-4" />
                                        </div>
                                    )}

                                    <div
                                        className={cn(
                                            "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                : "bg-muted/60 text-foreground border border-border rounded-tl-none"
                                        )}
                                    >
                                        {msg.role === "user" ? (
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        ) : (
                                            <div className="prose prose-invert max-w-none text-sm font-sans space-y-2">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>

                                    {msg.role === "user" && (
                                        <div className="size-7 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 mt-1">
                                            <User className="size-4" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Streaming Response Bubble */}
                            {isStreaming && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-3 text-sm justify-start"
                                >
                                    <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                                        <Bot className="size-4 animate-bounce" />
                                    </div>
                                    <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-muted/60 text-foreground border border-border rounded-tl-none space-y-2">
                                        {streamingContent ? (
                                            <div className="prose prose-invert max-w-none text-sm font-sans">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {streamingContent}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 py-1">
                                                <span className="size-2 bg-primary rounded-full animate-pulse" />
                                                <span className="size-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]" />
                                                <span className="size-2 bg-primary rounded-full animate-pulse [animation-delay:0.4s]" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            <div ref={scrollRef} />
                        </div>

                        {/* Input Footer */}
                        <div className="p-3 border-t border-border bg-card/50 space-y-2">
                            <div className="relative flex items-center">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={lessonTitle ? `Ask about ${lessonTitle}...` : "Ask AI Tutor a question..."}
                                    disabled={isStreaming}
                                    rows={2}
                                    className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 pr-10 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                                />
                                <Button
                                    size="icon"
                                    onClick={handleSend}
                                    disabled={!input.trim() || isStreaming}
                                    className="absolute right-2 top-2.5 h-7 w-7 rounded-lg shrink-0"
                                >
                                    <Send className="size-3.5" />
                                </Button>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                                <span>Shift + Enter for new line</span>
                                <span>Powered by Marko AI</span>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
