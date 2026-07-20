import { Link } from "react-router-dom";
import { MarkoLogo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function LandingNavbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b-4 border-border bg-background/95 backdrop-blur-sm">
            <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo Section */}
                <div className="flex items-center">
                    <div className="h-8 w-auto flex items-center">
                        <MarkoLogo className="h-full w-auto" />
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-8">
                    <a
                        href="#platform"
                        className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-bauhaus-red transition-colors"
                    >
                        Platform
                    </a>
                    <a
                        href="#architecture"
                        className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-bauhaus-blue transition-colors"
                    >
                        Architecture
                    </a>
                    <a
                        href="#technology"
                        className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-bauhaus-yellow transition-colors"
                    >
                        Technology
                    </a>
                    <a
                        href="#documentation"
                        className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-muted-foreground transition-colors"
                    >
                        Documentation
                    </a>
                    <a
                        href="https://github.com/Hemanth-Reddy-12/marko"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-muted-foreground transition-colors"
                    >
                        GitHub
                    </a>
                </nav>

                {/* CTA & Theme Toggle */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link
                        to="/login"
                        className="hidden sm:block text-sm font-black uppercase tracking-widest text-foreground px-6 py-3 border-2 border-transparent hover:border-border transition-all"
                    >
                        Log In
                    </Link>
                    <Link
                        to="/login"
                        className="bg-bauhaus-red text-white px-6 sm:px-8 py-3 text-sm font-black uppercase tracking-widest border-2 border-border shadow-[4px_4px_0px_0px_var(--foreground)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                        Start Learning
                    </Link>
                </div>
            </div>
        </header>
    );
}
