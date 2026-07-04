import * as React from "react";
import { motion } from "framer-motion";

interface Particle {
    id: number;
    color: string;
    size: number;
    shape: "circle" | "square" | "triangle";
    angle: number;
    speed: number;
}

const COLORS = ["#DD4124", "#0047AB", "#E6B800", "#111111", "#FFFFFF"];
const SHAPES: Array<Particle["shape"]> = ["circle", "square", "triangle"];

export function Celebration() {
    const [particles, setParticles] = React.useState<Particle[]>([]);

    React.useEffect(() => {
        const list: Particle[] = Array.from({ length: 100 }).map((_, id) => {
            const size = Math.random() * 10 + 6;
            const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            return {
                id,
                color,
                size,
                shape,
                angle: Math.random() * 360,
                speed: Math.random() * 15 + 12,
            };
        });
        setParticles(list);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((p) => {
                const rad = (p.angle * Math.PI) / 180;
                const distanceX = Math.cos(rad) * p.speed * 25;
                const distanceY = Math.sin(rad) * p.speed * 25;

                return (
                    <motion.div
                        key={p.id}
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: "40%",
                            width: p.shape !== "triangle" ? p.size : 0,
                            height: p.shape !== "triangle" ? p.size : 0,
                            backgroundColor: p.shape !== "triangle" ? p.color : undefined,
                            borderRadius: p.shape === "circle" ? "50%" : "0%",
                            borderLeft: p.shape === "triangle" ? `${p.size / 2}px solid transparent` : undefined,
                            borderRight: p.shape === "triangle" ? `${p.size / 2}px solid transparent` : undefined,
                            borderBottom: p.shape === "triangle" ? `${p.size}px solid ${p.color}` : undefined,
                        }}
                        initial={{
                            x: 0,
                            y: 0,
                            scale: 0,
                            rotate: 0,
                            opacity: 1,
                        }}
                        animate={{
                            x: distanceX,
                            y: [0, distanceY * 0.4, distanceY + 700],
                            scale: [0, 1.2, 1, 0.8, 0],
                            rotate: Math.random() * 720 + 360,
                            opacity: [1, 1, 1, 0.8, 0],
                        }}
                        transition={{
                            duration: Math.random() * 2 + 1.8,
                            ease: "easeOut",
                        }}
                    />
                );
            })}
        </div>
    );
}
