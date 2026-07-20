export function Footer() {
    return (
        <footer className="w-full bg-background pt-20 pb-10 px-6">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                <div className="flex flex-col gap-4">
                    <span className="text-2xl font-black uppercase tracking-tighter text-foreground mb-4">
                        PROJECT MARKO
                    </span>
                    <div className="w-12 h-2 bg-border" />
                </div>

                <div className="flex flex-col gap-4">
                    <a href="#platform" className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-bauhaus-red transition-colors">Platform</a>
                    <a href="#architecture" className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-bauhaus-blue transition-colors">Architecture</a>
                    <a href="#documentation" className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-bauhaus-yellow transition-colors">Documentation</a>
                </div>

                <div className="flex flex-col gap-4">
                    <a href="https://github.com/Hemanth-Reddy-12/marko" target="_blank" rel="noreferrer" className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-bauhaus-red transition-colors">GitHub</a>
                    <a href="#" className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-bauhaus-blue transition-colors">License</a>
                </div>

                <div className="flex flex-col gap-4">
                    <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">MADE WITH</span>
                    <span className="text-sm font-black uppercase tracking-widest text-foreground">React</span>
                    <span className="text-sm font-black uppercase tracking-widest text-foreground">Express</span>
                    <span className="text-sm font-black uppercase tracking-widest text-foreground">Redis</span>
                    <span className="text-sm font-black uppercase tracking-widest text-foreground">Prisma</span>
                    <span className="text-sm font-black uppercase tracking-widest text-foreground">AI</span>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto border-t-4 border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    © 2026 PROJECT MARKO.
                </span>
                <div className="flex gap-2">
                    <div className="size-3 bg-bauhaus-red border-2 border-border rounded-full" />
                    <div className="size-3 bg-bauhaus-yellow border-2 border-border rounded-full" />
                    <div className="size-3 bg-bauhaus-blue border-2 border-border rounded-full" />
                </div>
            </div>
        </footer>
    );
}
