import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Step = {
    glyph: string;
    shape: "rect" | "circle" | "triangle" | "square";
    label: string;
};

// Q -> Rectangle, U -> Circle, I -> Triangle, Z -> Square
// Each shape uses its Bauhaus primary colour.
const STEPS: Step[] = [
    { glyph: "Q", shape: "rect", label: "rect" },
    { glyph: "U", shape: "circle", label: "circle" },
    { glyph: "I", shape: "triangle", label: "triangle" },
    { glyph: "Z", shape: "square", label: "square" },
];

const SHAPE_COLOR: Record<Step["shape"], string> = {
    rect: "var(--color-bauhaus-blue)",
    circle: "var(--color-bauhaus-yellow)",
    triangle: "var(--color-bauhaus-red)",
    square: "var(--foreground)",
};

const PHASE = {
    letterHold: 260,
    morphToShape: 360,
    shapeHold: 160,
} as const;

function ShapePath({ kind }: { kind: Step["shape"] }) {
    const common = { fill: "currentColor", stroke: "none" };
    if (kind === "rect")
        return <rect x="4" y="4" width="72" height="72" rx="0" {...common} />;
    if (kind === "circle") return <circle cx="40" cy="40" r="36" {...common} />;
    if (kind === "triangle")
        return <polygon points="40,4 76,76 4,76" {...common} />;
    return <rect x="12" y="12" width="56" height="56" rx="0" {...common} />;
}

export function QuizMorphLoader({ statusText }: { statusText?: string }) {
    const [index, setIndex] = React.useState(0);
    const [phase, setPhase] = React.useState<"letter" | "shape">("letter");

    React.useEffect(() => {
        let t: ReturnType<typeof setTimeout>;
        if (phase === "letter") {
            t = setTimeout(() => setPhase("shape"), PHASE.letterHold);
        } else {
            t = setTimeout(() => {
                setPhase("letter");
                setIndex((i) => (i + 1) % STEPS.length);
            }, PHASE.morphToShape + PHASE.shapeHold);
        }
        return () => clearTimeout(t);
    }, [phase, index]);

    const step = STEPS[index]!;
    const color = SHAPE_COLOR[step.shape];

    return (
        <div className="flex flex-col items-center justify-center gap-10 py-20 px-6 w-full">
            {/* Morphing token — letter morphs into a big same-size geometric shape */}
            <div className="relative size-28 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {phase === "letter" ? (
                        <motion.div
                            key={`letter-${index}`}
                            initial={{
                                opacity: 0,
                                scale: 0.6,
                                filter: "blur(10px)",
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                filter: "blur(0px)",
                            }}
                            exit={{
                                opacity: 0,
                                scale: 1.15,
                                filter: "blur(10px)",
                            }}
                            transition={{
                                duration: 0.24,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="text-8xl font-heading font-black text-foreground leading-none"
                        >
                            {step.glyph}
                        </motion.div>
                    ) : (
                        <motion.svg
                            key={`shape-${index}`}
                            width="112"
                            height="112"
                            viewBox="0 0 80 80"
                            initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.4, rotate: 30 }}
                            transition={{
                                duration: 0.3,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            style={{ color }}
                        >
                            <ShapePath kind={step.shape} />
                        </motion.svg>
                    )}
                </AnimatePresence>
            </div>

            {/* QUIZ wordmark + active letter highlight */}
            {/* <div className="flex items-center gap-3">
                {STEPS.map((s, i) => (
                    <span
                        key={s.glyph}
                        className={cn(
                            "text-2xl font-heading font-black tracking-widest transition-colors duration-200",
                            i === index
                                ? "text-foreground"
                                : "text-muted-foreground/30",
                        )}
                    >
                        {s.glyph}
                    </span>
                ))}
            </div> */}

            {statusText && (
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground animate-pulse">
                    {statusText}
                </p>
            )}
        </div>
    );
}
