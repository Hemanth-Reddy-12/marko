import { cn } from "@/lib/utils";

interface BGPatternProps {
    variant?: "grid" | "dot";
    mask?: "fade-edges" | "none";
    size?: number;
    className?: string;
}

export function BGPattern({
    variant = "grid",
    mask = "fade-edges",
    size = 32,
    className,
}: BGPatternProps) {
    return (
        <div
            className={cn(
                "pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-40",
                mask === "fade-edges" &&
                    "[mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]",
                className
            )}
            style={{
                backgroundImage:
                    variant === "grid"
                        ? `linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)`
                        : `radial-gradient(var(--border) 1px, transparent 1px)`,
                backgroundSize: `${size}px ${size}px`,
            }}
        />
    );
}
