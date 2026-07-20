import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { useRef } from 'react';


const stats = [
    { value: 4, suffix: "", label: "AI Agents", color: "text-bauhaus-red" },
    { value: 100, suffix: "%", label: "Structured Output", color: "text-bauhaus-blue" },
    { value: 0, suffix: "ms", prefix: "<10", label: "Realtime Engine", color: "text-bauhaus-yellow" },
    { value: 1000, suffix: "+", label: "Lessons Generated", color: "text-foreground" }
];

function AnimatedNumber({ value }: { value: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    
    useEffect(() => {
        if (isInView) {
            animate(count, value, { duration: 2.5, ease: "easeOut" });
        }
    }, [count, value, isInView]);

    return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function StatsSection() {
    return (
        <section className="w-full bg-background border-b-4 border-border py-32 px-6">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 divide-y-4 md:divide-y-0 md:divide-x-4 divide-border">
                {stats.map((stat, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="flex flex-col items-center justify-center text-center pt-8 md:pt-0"
                    >
                        <div className={`text-7xl lg:text-9xl font-black tracking-tighter ${stat.color}`}>
                            {stat.prefix}
                            <AnimatedNumber value={stat.value} />
                            {stat.suffix}
                        </div>
                        <div className="w-16 h-2 bg-border my-6" />
                        <span className="text-xl font-bold uppercase tracking-widest text-foreground">
                            {stat.label}
                        </span>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
