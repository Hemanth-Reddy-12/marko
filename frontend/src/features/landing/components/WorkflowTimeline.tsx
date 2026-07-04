import { motion } from "framer-motion";
import { ArrowRight, Target, BrainCircuit, PenTool, MessageSquare, Trophy } from "lucide-react";

const steps = [
    { label: "GOAL", icon: Target },
    { label: "COURSE", icon: BrainCircuit },
    { label: "LESSONS", icon: BookOpenIcon },
    { label: "QUIZ", icon: PenTool },
    { label: "INTERVIEW", icon: MessageSquare },
    { label: "MASTERY", icon: Trophy }
];

// Quick workaround for BookOpen since we can't import it dynamically easily
function BookOpenIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
    );
}

export function WorkflowTimeline() {
    return (
        <section className="w-full bg-bauhaus-yellow border-b-4 border-black py-20 px-6 overflow-hidden">
            <div className="max-w-[1440px] mx-auto">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black mb-16 text-center">
                    HOW IT WORKS
                </h2>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 relative">
                    {/* Connecting Line behind the items on Desktop */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-2 bg-black -translate-y-1/2 z-0" />
                    
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row items-center gap-4 md:gap-0 z-10 w-full md:w-auto">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ type: "spring", stiffness: 200, delay: idx * 0.15 }}
                                className="flex flex-col items-center gap-4 bg-white p-6 border-4 border-black shadow-[8px_8px_0px_rgba(17,17,17,1)]"
                            >
                                <div className="bg-black text-white p-4 rounded-full">
                                    <step.icon className="size-8" />
                                </div>
                                <span className="text-xl font-black uppercase tracking-widest text-black">{step.label}</span>
                            </motion.div>
                            
                            {/* Arrow connecting to next block (mobile vertical, desktop horizontal arrow is implied by the background line but we can add small arrows) */}
                            {idx < steps.length - 1 && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    className="md:hidden py-4"
                                >
                                    <ArrowRight className="size-8 text-black rotate-90 md:rotate-0" />
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
