import { motion } from "framer-motion";

const agents = [
    {
        name: "Planner",
        shape: "circle", // Circle
        color: "bg-bauhaus-red",
        desc: "Coordinates syllabus structuring and generation schedules."
    },
    {
        name: "Content",
        shape: "square", // Square
        color: "bg-bauhaus-blue",
        desc: "Compiles deep technical markdown articles instantly."
    },
    {
        name: "Quiz",
        shape: "triangle", // Triangle
        color: "bg-bauhaus-yellow",
        desc: "Generates multiple choice verification datasets."
    },
    {
        name: "Interview",
        shape: "rectangle", // Rectangle
        color: "bg-black",
        desc: "Conducts live Socratic evaluations via WebSocket."
    }
];

export function AgentCards() {
    return (
        <section className="w-full bg-background border-b-4 border-black px-6 py-20">
            <div className="max-w-[1440px] mx-auto">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black mb-16 text-center">
                    THE FOUR AGENTS
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {agents.map((agent, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_rgba(17,17,17,1)] flex flex-col items-center text-center gap-8 group"
                        >
                            <div className="h-32 flex items-center justify-center w-full">
                                {agent.shape === "circle" && (
                                    <div className={`size-24 rounded-full border-4 border-black ${agent.color} group-hover:scale-110 transition-transform`} />
                                )}
                                {agent.shape === "square" && (
                                    <div className={`size-24 border-4 border-black ${agent.color} group-hover:scale-110 transition-transform`} />
                                )}
                                {agent.shape === "triangle" && (
                                    <div className={`w-0 h-0 border-l-[48px] border-l-transparent border-r-[48px] border-r-transparent border-b-[84px] border-b-secondary group-hover:scale-110 transition-transform`} style={{ borderBottomColor: 'var(--secondary)' }} />
                                )}
                                {agent.shape === "rectangle" && (
                                    <div className={`w-32 h-16 border-4 border-black ${agent.color} group-hover:scale-110 transition-transform`} />
                                )}
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-black">
                                    {agent.name}
                                </h3>
                                <div className="w-full h-1 bg-black" />
                                <p className="text-sm font-bold uppercase tracking-wider text-black/70">
                                    {agent.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
