import * as React from "react";
import { Bot, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorFloatingButtonProps {
    isOpen: boolean;
    onToggle: () => void;
    hasUnread?: boolean;
}

export function TutorFloatingButton({ isOpen, onToggle, hasUnread }: TutorFloatingButtonProps) {
    return (
        <button
            onClick={onToggle}
            aria-label={isOpen ? "Close AI Tutor" : "Open AI Tutor"}
            className={cn(
                "group fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 h-12 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 border cursor-pointer overflow-hidden px-3 hover:px-4",
                isOpen
                    ? "bg-secondary text-secondary-foreground border-border"
                    : "bg-primary text-primary-foreground border-primary/20 shadow-primary/25 hover:shadow-primary/40"
            )}
        >
            <div className="relative flex items-center justify-center shrink-0">
                {isOpen ? (
                    <X className="size-5" />
                ) : (
                    <>
                        <Bot className="size-5 animate-pulse" />
                        {hasUnread && (
                            <span className="absolute -top-1 -right-1 size-2.5 bg-destructive rounded-full ring-2 ring-background" />
                        )}
                    </>
                )}
            </div>
            
            {/* Text label only appears on hover */}
            <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 whitespace-nowrap text-xs font-semibold tracking-wider overflow-hidden">
                {isOpen ? "Close Tutor" : "Ask AI Tutor"}
            </span>
        </button>
    );
}
