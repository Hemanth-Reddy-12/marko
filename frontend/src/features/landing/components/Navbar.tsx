import { Link } from "react-router-dom";
import { MarkoLogo } from "@/components/ui/logo";

export function LandingNavbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-background">
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
                        className="text-sm font-bold uppercase tracking-widest text-black hover:text-bauhaus-red transition-colors"
                    >
                        Platform
                    </a>
                    <a
                        href="#architecture"
                        className="text-sm font-bold uppercase tracking-widest text-black hover:text-bauhaus-blue transition-colors"
                    >
                        Architecture
                    </a>
                    <a
                        href="#technology"
                        className="text-sm font-bold uppercase tracking-widest text-black hover:text-bauhaus-yellow transition-colors"
                    >
                        Technology
                    </a>
                    <a
                        href="#documentation"
                        className="text-sm font-bold uppercase tracking-widest text-black hover:text-black/60 transition-colors"
                    >
                        Documentation
                    </a>
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold uppercase tracking-widest text-black hover:text-black/60 transition-colors"
                    >
                        GitHub
                    </a>
                </nav>

                {/* CTA */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/login"
                        className="hidden sm:block text-sm font-black uppercase tracking-widest text-black px-6 py-3 border-2 border-transparent hover:border-black transition-all"
                    >
                        Log In
                    </Link>
                    <Link
                        to="/login"
                        className="bg-bauhaus-red text-white px-8 py-3 text-sm font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_rgba(17,17,17,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                        Start Learning
                    </Link>
                </div>
            </div>
        </header>
    );
}
