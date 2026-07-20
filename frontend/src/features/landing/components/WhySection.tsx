import { motion } from "framer-motion";

const reasons = [
    {
        title: "AI NATIVE",
        desc: "Generated in Real Time."
    },
    {
        title: "ENGINEERING FIRST",
        desc: "Reliable."
    },
    {
        title: "MODERN LEARNING",
        desc: "Interactive."
    }
];

export function WhySection() {
    return (
        <section className="w-full bg-background border-b-4 border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y-4 md:divide-y-0 md:divide-x-4 divide-border border-border">
                {reasons.map((reason, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: idx * 0.15 }}
                        className="flex flex-col p-12 md:p-16 lg:p-24 justify-center"
                    >
                        <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground mb-6">
                            {reason.title}
                        </h3>
                        <div className="w-16 h-2 bg-bauhaus-red mb-6" />
                        <p className="text-xl font-bold uppercase tracking-widest text-muted-foreground">
                            {reason.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
