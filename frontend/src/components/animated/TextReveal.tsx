import * as React from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    trigger?: boolean;
}

export function TextReveal({ children, trigger = true, className, ...props }: TextRevealProps) {
    return (
        <div 
            className={cn(
                "transition-opacity duration-1000",
                trigger ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                className
            )}
            style={{
                animation: trigger ? "fadeSlideIn 0.8s ease-out forwards" : "none"
            }}
            {...props}
        >
            <style>
                {`
                @keyframes fadeSlideIn {
                    0% {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                `}
            </style>
            {children}
        </div>
    );
}
