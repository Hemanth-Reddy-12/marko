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
        color: "bg-black",
        textColor: "text-white",
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
        <section id="platform" className="w-full bg-background border-b-4 border-black">
            {/* Header */}
            <div className="border-b-4 border-black px-6 py-12">
                <div className="max-w-[1440px] mx-auto flex items-center gap-8">
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black">
                        CORE MODULES
                    </h2>
                    <div className="h-2 flex-grow bg-black mt-2 hidden md:block" />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y-4 md:divide-y-0 border-black">
                {features.map((feature, idx) => {
                    const isLastInRow = (idx + 1) % 3 === 0;
                    return (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            className={`flex flex-col group cursor-default border-black ${!isLastInRow ? 'lg:border-r-4' : ''} ${(idx + 1) % 2 !== 0 ? 'md:border-r-4 lg:border-r-4' : 'md:border-r-0'} ${idx < 3 ? 'lg:border-b-4' : ''} ${idx < 4 ? 'md:border-b-4' : ''}`}
                        >
                            {/* Graphic Block */}
                            <div className={`${feature.color} border-b-4 border-black aspect-video flex items-center justify-center p-8`}>
                                <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                                    <feature.icon className={`size-24 ${feature.textColor || 'text-black'}`} />
                                </motion.div>
                            </div>
                            
                            {/* Content Block */}
                            <div className={`bg-white p-8 md:p-12 flex flex-col gap-4 flex-grow`}>
                                <h3 className="text-3xl font-black uppercase tracking-tight text-black">{feature.title}</h3>
                                <p className="text-sm font-bold uppercase tracking-wider text-black/60 leading-relaxed">{feature.desc}</p>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </section>
    );
}
