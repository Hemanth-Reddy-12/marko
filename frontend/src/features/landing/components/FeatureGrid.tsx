import { motion } from "framer-motion";
import { BrainCircuit, BookOpen, PenTool, MessageSquare, Code, Webhook } from "lucide-react";

const features = [
    {
        title: "AI Planner",
        desc: "Creates structured learning roadmaps.",
        color: "bg-bauhaus-red",
        icon: BrainCircuit
    },
    {
        title: "Lesson Generator",
        desc: "Generates lessons on demand.",
        color: "bg-bauhaus-blue",
        icon: BookOpen
    },
    {
        title: "Quiz Engine",
        desc: "Adaptive deterministic quizzes.",
        color: "bg-bauhaus-yellow",
        icon: PenTool
    },
    {
        title: "Interview Agent",
        desc: "Live AI interview sessions.",
        color: "bg-primary",
        textColor: "text-primary-foreground",
        icon: MessageSquare
    },
    {
        title: "Structured Outputs",
        desc: "Reliable schema-based AI responses.",
        color: "bg-bauhaus-red",
        icon: Code
    },
    {
        title: "Event Driven",
        desc: "Redis + WebSocket architecture.",
        color: "bg-bauhaus-blue",
        icon: Webhook
    }
];

export function FeatureGrid() {
    return (
        <section id="platform" className="w-full bg-background border-b-4 border-border">
            {/* Header */}
            <div className="border-b-4 border-border px-6 py-12">
                <div className="max-w-[1440px] mx-auto flex items-center gap-8">
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-foreground">
                        CORE MODULES
                    </h2>
                    <div className="h-2 flex-grow bg-border mt-2 hidden md:block" />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-border">
                {features.map((feature, idx) => {
                    const isRightMd = idx % 2 === 0;
                    const isRightLg = (idx + 1) % 3 !== 0;
                    const isBottomMd = idx < 4;
                    const isBottomLg = idx < 3;
                    const isBottomMobile = idx < features.length - 1;

                    return (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            className={`flex flex-col group cursor-default border-border ${
                                isRightMd ? 'md:border-r-4' : 'md:border-r-0'
                            } ${
                                isRightLg ? 'lg:border-r-4' : 'lg:border-r-0'
                            } ${
                                isBottomMobile ? 'border-b-4' : 'border-b-0'
                            } ${
                                isBottomMd ? 'md:border-b-4' : 'md:border-b-0'
                            } ${
                                isBottomLg ? 'lg:border-b-4' : 'lg:border-b-0'
                            }`}
                        >
                            {/* Graphic Block */}
                            <div className={`${feature.color} border-b-4 border-border aspect-video flex items-center justify-center p-8`}>
                                <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                                    <feature.icon className={`size-24 ${feature.textColor || 'text-black'}`} />
                                </motion.div>
                            </div>
                            
                            {/* Content Block */}
                            <div className="bg-card p-8 md:p-12 flex flex-col gap-4 flex-grow">
                                <h3 className="text-3xl font-black uppercase tracking-tight text-card-foreground">{feature.title}</h3>
                                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground leading-relaxed">{feature.desc}</p>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </section>
    );
}
