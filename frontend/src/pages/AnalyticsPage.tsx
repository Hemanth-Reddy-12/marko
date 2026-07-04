import * as React from "react";
import {
    TrendingUp,
    Clock,
    BookOpen,
    Target,
    Calendar,
    Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants = {
    animate: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    initial: { opacity: 0, y: 5 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as any },
    },
};

const activityData = [
    { day: "Mon", score: 40 },
    { day: "Tue", score: 65 },
    { day: "Wed", score: 35 },
    { day: "Thu", score: 85 },
    { day: "Fri", score: 55 },
    { day: "Sat", score: 90 },
    { day: "Sun", score: 45 },
];

export function AnalyticsPage() {
    return (
        <motion.div
            className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            {/* Header */}
            <motion.div
                variants={itemVariants}
                className="flex flex-col gap-2 border-b border-border pb-6 mt-4"
            >
                <h1 className="text-3xl font-heading font-semibold tracking-tight text-foreground">
                    Learning Analytics
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Review your performance, habits, and knowledge acquisition
                    over time.
                </p>
            </motion.div>

            {/* Top Level KPIs */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 md:grid-cols-4 gap-0 border-y border-x border-border divide-x divide-border"
            >
                <div className="p-6 bg-card flex flex-col items-start hover:bg-muted/30 transition-colors">
                    <Clock className="size-4 text-muted-foreground mb-3" />
                    <span className="text-4xl font-heading font-semibold text-foreground">
                        24.5
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        Hours Learned
                    </span>
                </div>
                <div className="p-6 bg-card flex flex-col items-start hover:bg-muted/30 transition-colors">
                    <BookOpen className="size-4 text-muted-foreground mb-3" />
                    <span className="text-4xl font-heading font-semibold text-foreground">
                        12
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        Courses Active
                    </span>
                </div>
                <div className="p-6 bg-card flex flex-col items-start hover:bg-muted/30 transition-colors">
                    <Target className="size-4 text-bauhaus-red mb-3" />
                    <span className="text-4xl font-heading font-semibold text-foreground">
                        87%
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        Avg Assessment Score
                    </span>
                </div>
                <div className="p-6 bg-card flex flex-col items-start hover:bg-muted/30 transition-colors">
                    <Award className="size-4 text-bauhaus-yellow mb-3" />
                    <span className="text-4xl font-heading font-semibold text-foreground">
                        14
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        Day Streak
                    </span>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                {/* Main Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <Card className="rounded-none border border-border bg-card shadow-none h-full">
                        <CardHeader className="border-b border-border pb-4 bg-muted/20">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <TrendingUp className="size-4" />
                                    Weekly Activity
                                </CardTitle>
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                                    Last 7 Days
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 flex flex-col justify-end h-[320px]">
                            <div className="flex items-end justify-between h-full gap-2">
                                {activityData.map((item, i) => (
                                    <div
                                        key={item.day}
                                        className="flex flex-col items-center gap-4 flex-1 h-full justify-end group"
                                    >
                                        <div className="w-full relative bg-muted h-full flex flex-col justify-end border border-border">
                                            <motion.div
                                                className="w-full bg-bauhaus-blue group-hover:bg-bauhaus-blue/80 transition-colors border-t border-border"
                                                initial={{ height: 0 }}
                                                animate={{
                                                    height: `${item.score}%`,
                                                }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: i * 0.1,
                                                    ease: [0.16, 1, 0.3, 1],
                                                }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">
                                            {item.day}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Secondary Data */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-8"
                >
                    <Card className="rounded-none border border-border bg-card shadow-none">
                        <CardHeader className="border-b border-border pb-4 bg-muted/20">
                            <CardTitle className="text-base font-semibold">
                                Skill Retention
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 divide-y divide-border">
                            {[
                                {
                                    skill: "React Architecture",
                                    score: 92,
                                    color: "bg-success",
                                },
                                {
                                    skill: "System Design",
                                    score: 78,
                                    color: "bg-bauhaus-yellow",
                                },
                                {
                                    skill: "Data Structures",
                                    score: 65,
                                    color: "bg-bauhaus-red",
                                },
                                {
                                    skill: "Machine Learning",
                                    score: 88,
                                    color: "bg-bauhaus-blue",
                                },
                            ].map((s) => (
                                <div
                                    key={s.skill}
                                    className="p-4 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold">
                                            {s.skill}
                                        </span>
                                        <span className="text-[10px] font-mono text-muted-foreground">
                                            {s.score}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted border border-border overflow-hidden">
                                        <motion.div
                                            className={cn("h-full", s.color)}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${s.score}%` }}
                                            transition={{
                                                duration: 1,
                                                ease: "easeOut",
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
