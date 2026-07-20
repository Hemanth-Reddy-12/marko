import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function HeroComposition() {
    return (
        <section className="relative w-full min-h-[90vh] bg-background border-b-4 border-border overflow-hidden flex items-center">
            {/* Background Geometric Motifs */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-bauhaus-yellow border-l-4 border-border hidden lg:block" />
            <div className="absolute top-20 left-10 size-32 bg-bauhaus-blue rounded-full border-4 border-border hidden md:block" />
            <div className="absolute bottom-20 left-1/4 w-64 h-32 bg-bauhaus-red border-4 border-border hidden lg:block" />
            
            <div className="max-w-[1440px] mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 py-20 lg:py-0">
                
                {/* Left Typography Column */}
                <div className="flex flex-col justify-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] font-black tracking-tighter uppercase leading-[0.85] text-foreground">
                            LEARN.<br />BUILD.<br />MASTER.
                        </h1>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="mt-6 sm:mt-8 max-w-xl"
                    >
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground/80 leading-relaxed uppercase tracking-wide">
                            Project Marko transforms a single learning goal into a complete AI-generated curriculum with lessons, quizzes, and live conversational interviews.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 mt-8 sm:mt-12">
                            <Link 
                                to="/login"
                                className="w-full sm:w-auto text-center bg-primary text-primary-foreground px-8 sm:px-10 py-4 sm:py-5 text-base font-black uppercase tracking-widest border-4 border-border shadow-[8px_8px_0px_0px_var(--color-bauhaus-red)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all"
                            >
                                Start Learning
                            </Link>
                            <a 
                                href="#documentation"
                                className="w-full sm:w-auto text-center bg-card text-card-foreground px-8 sm:px-10 py-4 sm:py-5 text-base font-black uppercase tracking-widest border-4 border-border shadow-[8px_8px_0px_0px_var(--foreground)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all"
                            >
                                View Documentation
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Right Geometric Dashboard Preview */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
                    className="relative flex items-center justify-center lg:justify-end"
                >
                    <div className="w-full max-w-lg aspect-[4/5] bg-card border-4 border-border shadow-[16px_16px_0px_0px_var(--foreground)] flex flex-col">
                        
                        {/* Header Bar */}
                        <div className="h-16 border-b-4 border-border bg-card flex items-center px-6 gap-4">
                            <div className="size-4 bg-bauhaus-red border-2 border-border rounded-full" />
                            <div className="size-4 bg-bauhaus-yellow border-2 border-border rounded-full" />
                            <div className="size-4 bg-bauhaus-blue border-2 border-border rounded-full" />
                        </div>
                        
                        {/* Content Area */}
                        <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-0">
                            {/* Block 1: Chart representation */}
                            <div className="border-r-4 border-b-4 border-border p-6 flex flex-col justify-end items-start bg-background">
                                <div className="w-full h-2/3 bg-primary border-2 border-border" />
                                <div className="w-3/4 h-1/3 bg-bauhaus-red border-2 border-border -mt-2" />
                            </div>
                            
                            {/* Block 2: Title / Status */}
                            <div className="border-b-4 border-border bg-bauhaus-yellow p-6 flex flex-col justify-between">
                                <span className="text-6xl font-black text-black">A.I.</span>
                                <div className="w-16 h-4 bg-black" />
                            </div>
                            
                            {/* Block 3: Progress */}
                            <div className="border-r-4 border-b-4 border-border bg-bauhaus-blue flex items-center justify-center relative overflow-hidden">
                                <div className="size-32 rounded-full border-4 border-border bg-card flex items-center justify-center">
                                    <span className="text-3xl font-black text-card-foreground">75%</span>
                                </div>
                            </div>
                            
                            {/* Block 4: Text Lines */}
                            <div className="border-b-4 border-border bg-card p-6 flex flex-col justify-center gap-4">
                                <div className="h-4 w-full bg-primary" />
                                <div className="h-4 w-5/6 bg-primary" />
                                <div className="h-4 w-4/6 bg-primary" />
                            </div>

                            {/* Block 5: Empty space */}
                            <div className="border-r-4 border-border bg-background p-6" />
                            
                            {/* Block 6: Master block */}
                            <div className="bg-bauhaus-red flex items-center justify-center">
                                <div className="size-16 bg-card border-4 border-border transform rotate-45" />
                            </div>
                        </div>
                    </div>
                </motion.div>
                
            </div>
        </section>
    );
}
