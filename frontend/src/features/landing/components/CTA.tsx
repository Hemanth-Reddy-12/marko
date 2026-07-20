import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function CTA() {
    return (
        <section className="w-full bg-bauhaus-red text-white py-32 md:py-48 px-6 border-b-4 border-border">
            <div className="max-w-[1440px] mx-auto text-center flex flex-col items-center">
                <motion.h2 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl md:text-7xl lg:text-[7rem] font-black uppercase tracking-tighter leading-[0.9]"
                >
                    READY TO BUILD<br />THE FUTURE OF LEARNING?
                </motion.h2>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 sm:mt-16 w-full sm:w-auto"
                >
                    <Link 
                        to="/login"
                        className="w-full sm:w-auto justify-center bg-primary text-primary-foreground px-8 sm:px-12 py-5 sm:py-6 text-lg sm:text-xl font-black uppercase tracking-widest border-4 border-border shadow-[8px_8px_0px_0px_var(--foreground)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex items-center gap-3 group"
                    >
                        Start Learning
                        <ArrowRight className="size-6 group-hover:translate-x-2 transition-transform" />
                    </Link>
                    <a 
                        href="#documentation"
                        className="w-full sm:w-auto text-center bg-card text-card-foreground px-8 sm:px-12 py-5 sm:py-6 text-lg sm:text-xl font-black uppercase tracking-widest border-4 border-border shadow-[8px_8px_0px_0px_var(--foreground)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all"
                    >
                        Read Documentation
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
