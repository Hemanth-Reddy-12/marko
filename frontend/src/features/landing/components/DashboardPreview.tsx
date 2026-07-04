import { motion } from "framer-motion";

export function DashboardPreview() {
    return (
        <section className="w-full bg-background border-b-4 border-black py-20 px-6 overflow-hidden">
            <div className="max-w-[1440px] mx-auto">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black mb-16">
                    PRODUCT PREVIEW
                </h2>

                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                    className="w-full bg-white border-4 border-black shadow-[16px_16px_0px_rgba(17,17,17,1)] flex overflow-hidden aspect-[16/10] md:aspect-video"
                >
                    {/* Sidebar */}
                    <div className="w-1/4 max-w-[240px] border-r-4 border-black flex flex-col">
                        <div className="h-16 border-b-4 border-black flex items-center justify-center bg-black">
                            <span className="text-white font-black uppercase tracking-widest text-sm">Marko</span>
                        </div>
                        <div className="flex-1 p-4 flex flex-col gap-4 bg-background">
                            {["Course Timeline", "Lesson Reader", "Quiz", "Chat", "Analytics"].map((item, idx) => (
                                <div key={idx} className={`h-12 border-2 border-black flex items-center px-4 ${idx === 1 ? 'bg-bauhaus-yellow font-black' : 'bg-white font-bold'} uppercase text-xs tracking-widest`}>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Main Area */}
                    <div className="flex-1 flex flex-col bg-white">
                        <div className="h-16 border-b-4 border-black flex items-center px-8 bg-background">
                            <span className="text-black font-black uppercase tracking-widest text-sm">Lesson Reader</span>
                        </div>
                        <div className="flex-1 p-8 md:p-16 flex flex-col gap-8">
                            <div className="h-12 w-3/4 bg-black" />
                            <div className="flex flex-col gap-4">
                                <div className="h-4 w-full bg-black/20" />
                                <div className="h-4 w-full bg-black/20" />
                                <div className="h-4 w-5/6 bg-black/20" />
                            </div>
                            <div className="h-64 w-full border-4 border-black bg-background mt-4 relative overflow-hidden flex items-center justify-center">
                                <div className="size-24 rounded-full border-4 border-black bg-bauhaus-blue" />
                                <div className="absolute top-8 left-8 w-1/3 h-4 bg-bauhaus-red border-2 border-black" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
