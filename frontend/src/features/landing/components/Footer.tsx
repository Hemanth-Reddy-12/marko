export function Footer() {
    return (
        <footer className="w-full bg-background pt-20 pb-10 px-6">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                <div className="flex flex-col gap-4">
                    <span className="text-2xl font-black uppercase tracking-tighter text-black mb-4">
                        PROJECT MARKO
                    </span>
                    <div className="w-12 h-2 bg-black" />
                </div>

                <div className="flex flex-col gap-4">
                    <a href="#platform" className="text-sm font-bold uppercase tracking-widest text-black hover:text-bauhaus-red transition-colors">Platform</a>
                    <a href="#architecture" className="text-sm font-bold uppercase tracking-widest text-black hover:text-bauhaus-blue transition-colors">Architecture</a>
                    <a href="#documentation" className="text-sm font-bold uppercase tracking-widest text-black hover:text-bauhaus-yellow transition-colors">Documentation</a>
                </div>

                <div className="flex flex-col gap-4">
                    <a href="https://github.com" className="text-sm font-bold uppercase tracking-widest text-black hover:text-bauhaus-red transition-colors">GitHub</a>
                    <a href="#" className="text-sm font-bold uppercase tracking-widest text-black hover:text-bauhaus-blue transition-colors">License</a>
                </div>

                <div className="flex flex-col gap-4">
                    <span className="text-sm font-bold uppercase tracking-widest text-black/60 mb-2">MADE WITH</span>
                    <span className="text-sm font-black uppercase tracking-widest text-black">React</span>
                    <span className="text-sm font-black uppercase tracking-widest text-black">Express</span>
                    <span className="text-sm font-black uppercase tracking-widest text-black">Redis</span>
                    <span className="text-sm font-black uppercase tracking-widest text-black">Prisma</span>
                    <span className="text-sm font-black uppercase tracking-widest text-black">AI</span>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto border-t-4 border-black pt-8 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-black/60">
                    © 2026 PROJECT MARKO.
                </span>
                <div className="flex gap-2">
                    <div className="size-3 bg-bauhaus-red border-2 border-black rounded-full" />
                    <div className="size-3 bg-bauhaus-yellow border-2 border-black rounded-full" />
                    <div className="size-3 bg-bauhaus-blue border-2 border-black rounded-full" />
                </div>
            </div>
        </footer>
    );
}
