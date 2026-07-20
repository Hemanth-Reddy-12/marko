import { motion } from "framer-motion";

const technologies = [
    { name: "React", bg: "bg-bauhaus-blue", text: "text-white" },
    { name: "Vite", bg: "bg-bauhaus-yellow", text: "text-black" },
    { name: "TypeScript", bg: "bg-primary", text: "text-primary-foreground" },
    { name: "TailwindCSS", bg: "bg-card", text: "text-card-foreground" },
    { name: "Framer Motion", bg: "bg-bauhaus-red", text: "text-white" },
    { name: "Express", bg: "bg-card", text: "text-card-foreground" },
    { name: "Socket.io", bg: "bg-primary", text: "text-primary-foreground" },
    { name: "Redis", bg: "bg-bauhaus-red", text: "text-white" },
    { name: "Prisma", bg: "bg-card", text: "text-card-foreground" },
    { name: "PostgreSQL", bg: "bg-bauhaus-blue", text: "text-white" },
    { name: "OpenAI", bg: "bg-primary", text: "text-primary-foreground" },
    { name: "Gemini", bg: "bg-bauhaus-yellow", text: "text-black" },
];

export function TechGrid() {
    return (
        <section id="technology" className="w-full bg-background border-b-4 border-border px-6 py-20">
            <div className="max-w-[1440px] mx-auto">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-16">
                    TECHNOLOGY STACK
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t-4 border-l-4 border-border">
                    {technologies.map((tech, idx) => (
                        <div 
                            key={idx}
                            className={`border-r-4 border-b-4 border-border ${tech.bg} ${tech.text} aspect-square flex items-center justify-center p-6 relative overflow-hidden group`}
                        >
                            <motion.div 
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="absolute inset-0 bg-foreground/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
                            />
                            <span className="text-xl md:text-2xl font-black uppercase tracking-widest text-center z-10">
                                {tech.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
