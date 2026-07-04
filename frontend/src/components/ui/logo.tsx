import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export function MarkoLogo({ className, ...props }: LogoProps) {
    return (
        <svg
            viewBox="0 0 540 100"
            className={cn("w-full h-auto", className)}
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            {/* M: Yellow envelope/crown polygon */}
            <polygon points="0,0 50,50 100,0 100,100 0,100" fill="#E6B800" />
            
            {/* A: Green triangle with cut-out hole */}
            <path
                d="M 160,0 L 210,100 H 110 Z M 160,53 A 12,12 0 1,0 160,77 A 12,12 0 1,0 160,53 Z"
                fill="#2E7D32"
                fillRule="evenodd"
            />
            
            {/* R: Sky Blue custom R shape with bowl cut-out */}
            <path
                d="M 220,0 H 285 A 40,40 0 0 1 325,40 C 325,60 310,75 290,75 L 325,100 H 290 L 263,75 H 250 V 100 H 220 Z M 250,25 H 275 A 15,15 0 0 1 290,40 A 15,15 0 0 1 275,55 H 250 Z"
                fill="#90CAF9"
                fillRule="evenodd"
            />
            
            {/* K: Orange block with a wedge cut out on the left */}
            <polygon points="330,0 430,0 430,100 330,100 380,50" fill="#EF6C00" />
            
            {/* O: Red circle with cut-out hole */}
            <path
                d="M 490,0 A 50,50 0 1,0 490,100 A 50,50 0 1,0 490,0 Z M 490,35 A 15,15 0 1,1 490,65 A 15,15 0 1,1 490,35 Z"
                fill="#DD4124"
                fillRule="evenodd"
            />
        </svg>
    );
}

export function MarkoIcon({ className, ...props }: LogoProps) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={cn("size-full", className)}
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            {/* M: Yellow crown polygon */}
            <polygon points="0,0 50,50 100,0 100,100 0,100" fill="#E6B800" />
        </svg>
    );
}
