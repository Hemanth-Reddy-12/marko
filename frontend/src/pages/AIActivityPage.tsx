import * as React from "react";
import { Activity, BrainCircuit, Bot, Zap, Clock, Terminal, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const containerVariants = {
    animate: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as any } 
    },
};

const aiAgents = [
    {
        id: "curriculum-planner",
        name: "Curriculum Planner",
        status: "PROCESSING",
        task: "Generating 'Machine Learning Basics'",
        icon: BrainCircuit,
        color: "text-bauhaus-blue",
        bgColor: "bg-bauhaus-blue",
        logs: [
            { time: "10:42:01", msg: "Analyzing goal: 'Learn ML from scratch'", type: "info" },
            { time: "10:42:05", msg: "Structuring 8-module syllabus", type: "info" },
            { time: "10:42:12", msg: "Generating module 1: Linear Regression", type: "action" },
            { time: "10:42:45", msg: "Optimizing difficulty curve", type: "info" },
        ]
    },
    {
        id: "quiz-generator",
        name: "Assessment Engine",
        status: "IDLE",
        task: "Waiting for next lesson completion",
        icon: CheckCircle2,
        color: "text-success",
        bgColor: "bg-success",
        logs: [
            { time: "09:15:22", msg: "Generated 5 questions for 'Advanced React Patterns'", type: "success" },
            { time: "09:15:25", msg: "Saved to database", type: "info" },
            { time: "09:15:26", msg: "Agent entering standby mode", type: "info" },
        ]
    },
    {
        id: "interview-agent",
        name: "Oral Examiner",
        status: "OFFLINE",
        task: "No active interview session",
        icon: Bot,
        color: "text-muted-foreground",
        bgColor: "bg-muted-foreground",
        logs: [
            { time: "Yesterday", msg: "Completed session for 'System Design'", type: "success" },
            { time: "Yesterday", msg: "Evaluated score: 85%", type: "info" },
            { time: "Yesterday", msg: "Session closed", type: "info" },
        ]
    }
];

export function AIActivityPage() {
    const [selectedAgent, setSelectedAgent] = React.useState(aiAgents[0]);

    return (
        <motion.div
            className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 h-[calc(100vh-3.5rem)] overflow-hidden"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex justify-between items-end border-b border-border pb-6 mt-4 shrink-0 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl font-heading font-semibold tracking-tight text-foreground">AI System Activity</h1>
                    <p className="text-sm text-muted-foreground mt-1">Real-time monitoring of autonomous learning agents.</p>
                </div>
                <Badge variant="outline" className="rounded-none border-success text-success uppercase tracking-widest text-[10px] hidden sm:flex">
                    All Systems Operational
                </Badge>
            </motion.div>

            {/* Layout */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 min-h-0 px-4 md:px-0 pb-4">
                
                {/* Agent List (Left Column) */}
                <motion.div variants={itemVariants} className="md:col-span-5 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Agents</span>
                        <span className="text-[10px] font-mono text-muted-foreground">3 DEPLOYED</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {aiAgents.map(agent => (
                            <button 
                                key={agent.id}
                                onClick={() => setSelectedAgent(agent)}
                                className={cn(
                                    "flex flex-col gap-3 p-5 border text-left transition-all duration-200",
                                    selectedAgent.id === agent.id 
                                        ? "border-foreground bg-muted/20 ring-1 ring-foreground" 
                                        : "border-border bg-card hover:bg-muted/50 hover:border-foreground/50"
                                )}
                            >
                                <div className="flex items-start justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 border border-border bg-background flex items-center justify-center shrink-0">
                                            <agent.icon className={cn("size-5", agent.color)} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={cn("size-2 rounded-none", agent.bgColor, agent.status === "PROCESSING" && "animate-pulse")} />
                                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                                                    {agent.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-background border border-border p-3 mt-1">
                                    <p className="text-xs text-muted-foreground truncate">{agent.task}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Agent Detail & Terminal (Right Column) */}
                <motion.div variants={itemVariants} className="md:col-span-7 lg:col-span-8 flex flex-col h-full min-h-0 border border-border bg-card">
                    {/* Detail Header */}
                    <div className="p-6 border-b border-border bg-muted/10 shrink-0">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 border border-border bg-background flex items-center justify-center">
                                    <selectedAgent.icon className={cn("size-6", selectedAgent.color)} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-heading font-semibold text-foreground">{selectedAgent.name}</h2>
                                    <p className="text-sm text-muted-foreground mt-1 font-mono uppercase tracking-widest">ID: {selectedAgent.id.toUpperCase()}-v1.4</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-none border-foreground text-xs font-medium hidden sm:flex">
                                <Zap className="size-3 mr-2" />
                                Force Restart
                            </Button>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-background shrink-0">
                        <div className="p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</span>
                            <span className="text-sm font-semibold">{selectedAgent.status}</span>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Uptime</span>
                            <span className="text-sm font-semibold font-mono">99.9%</span>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Latency</span>
                            <span className="text-sm font-semibold font-mono">24ms</span>
                        </div>
                    </div>

                    {/* Terminal View */}
                    <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 text-zinc-50 relative">
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900 shrink-0">
                            <Terminal className="size-4 text-zinc-400" />
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Agent Output Stream</span>
                        </div>
                        
                        <ScrollArea className="flex-1 p-4 font-mono text-xs">
                            <div className="flex flex-col gap-2">
                                <div className="text-zinc-500 mb-4">
                                    [SYSTEM] Initializing connection to {selectedAgent.id}...<br/>
                                    [SYSTEM] Authentication successful.<br/>
                                    [SYSTEM] Listening to stdout...
                                </div>
                                
                                {selectedAgent.logs.map((log, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                                        <span className={cn(
                                            "break-words",
                                            log.type === "info" && "text-zinc-300",
                                            log.type === "action" && "text-bauhaus-yellow",
                                            log.type === "success" && "text-emerald-400",
                                            log.type === "error" && "text-bauhaus-red"
                                        )}>
                                            {log.type === "action" && "> "}
                                            {log.msg}
                                        </span>
                                    </div>
                                ))}
                                
                                {selectedAgent.status === "PROCESSING" && (
                                    <div className="flex gap-4 mt-2">
                                        <span className="text-zinc-600 shrink-0">[{new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" })}]</span>
                                        <span className="text-bauhaus-blue animate-pulse">_</span>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
