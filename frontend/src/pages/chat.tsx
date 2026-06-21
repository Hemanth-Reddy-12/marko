import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, ArrowDown, Sparkles } from "lucide-react";
import { streamChat, type ChatMessage } from "@/lib/chat-api";

interface DisplayMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
}

function MessageBubble({
    message,
}: {
    message: DisplayMessage;
}) {
    const isUser = message.role === "user";

    return (
        <div
            className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
        >
            <Avatar size="sm">
                <AvatarFallback
                    className={
                        isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                    }
                >
                    {isUser ? <User className="size-3" /> : <Bot className="size-3" />}
                </AvatarFallback>
            </Avatar>
            <div
                className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                    isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                }`}
            >
                <div className="whitespace-pre-wrap break-words">
                    {message.content}
                    {message.isStreaming && (
                        <span className="inline-block w-1.5 h-4 ml-0.5 bg-foreground/60 animate-pulse rounded-sm" />
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <Sparkles className="size-8 text-primary" />
            </div>
            <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-semibold">Chat with Marko AI</h2>
                <p className="text-sm text-muted-foreground max-w-[320px]">
                    Ask about tasks, study topics, interview prep, or anything else. I'm here to help!
                </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-[400px]">
                {[
                    "Help me plan my tasks",
                    "Explain a topic",
                    "Interview tips",
                    "Productivity advice",
                ].map((suggestion) => (
                    <span
                        key={suggestion}
                        className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
                    >
                        {suggestion}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function ChatPage() {
    const [messages, setMessages] = React.useState<DisplayMessage[]>([]);
    const [input, setInput] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [showScrollBtn, setShowScrollBtn] = React.useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    React.useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        function handleScroll() {
            if (!container) return;
            const atBottom =
                container.scrollHeight - container.scrollTop - container.clientHeight < 100;
            setShowScrollBtn(!atBottom);
        }
        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    async function handleSend(text?: string) {
        const content = (text ?? input).trim();
        if (!content || isLoading) return;

        setInput("");

        const userMsg: DisplayMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content,
            timestamp: new Date(),
        };

        const assistantId = crypto.randomUUID();
        const assistantMsg: DisplayMessage = {
            id: assistantId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            isStreaming: true,
        };

        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setIsLoading(true);

        const apiMessages: ChatMessage[] = [
            ...messages.filter((m) => !m.isStreaming).map((m) => ({
                role: m.role,
                content: m.content,
            })),
            { role: "user", content },
        ];

        await streamChat(
            apiMessages,
            (chunk) => {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId
                            ? { ...m, content: m.content + chunk }
                            : m,
                    ),
                );
            },
            () => {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId
                            ? { ...m, isStreaming: false }
                            : m,
                    ),
                );
                setIsLoading(false);
            },
            (error) => {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId
                            ? {
                                  ...m,
                                  content: `Error: ${error}`,
                                  isStreaming: false,
                              }
                            : m,
                    ),
                );
                setIsLoading(false);
            },
        );

        textareaRef.current?.focus();
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="flex flex-1 flex-col h-[calc(100dvh-var(--header-height))]">
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-4 lg:px-6"
            >
                {messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="flex flex-col gap-4 py-4">
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {showScrollBtn && (
                <div className="absolute bottom-20 right-6 lg:right-8">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        className="rounded-full shadow-md"
                        onClick={scrollToBottom}
                    >
                        <ArrowDown className="size-4" />
                    </Button>
                </div>
            )}

            <div className="border-t bg-card px-4 py-3 lg:px-6">
                <div className="flex items-end gap-2 max-w-3xl mx-auto">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={isLoading}
                        rows={1}
                        className="flex-1 resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                        style={{
                            minHeight: "36px",
                            maxHeight: "120px",
                            height: "auto",
                        }}
                        onInput={(e) => {
                            const target = e.currentTarget;
                            target.style.height = "auto";
                            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                        }}
                    />
                    <Button
                        size="icon"
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                    >
                        <Send className="size-4" />
                    </Button>
                </div>
                <p className="mt-1.5 text-xs text-center text-muted-foreground">
                    Marko AI can make mistakes. Consider checking important information.
                </p>
            </div>
        </div>
    );
}
