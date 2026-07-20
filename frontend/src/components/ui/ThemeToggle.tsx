import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on Escape key
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const themeIcons = {
        light: Sun,
        dark: Moon,
        system: Monitor,
    };

    const ActiveIcon = themeIcons[theme] || Monitor;

    return (
        <div className="relative inline-block text-left" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="p-3 bg-card text-card-foreground border-2 border-border shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center focus-visible:outline-2 focus-visible:outline-ring"
                aria-label={`Toggle theme (Current: ${theme})`}
                aria-expanded={isOpen}
                aria-haspopup="true"
                title={`Theme: ${theme.toUpperCase()}`}
            >
                <ActiveIcon className="size-5 transition-transform duration-200" />
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-36 bg-card border-2 border-border shadow-[4px_4px_0px_0px_var(--foreground)] z-50 py-1 flex flex-col"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <button
                        type="button"
                        onClick={() => {
                            setTheme("light");
                            setIsOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-2 text-xs font-black uppercase tracking-widest text-left hover:bg-bauhaus-yellow hover:text-black transition-colors ${
                            theme === "light" ? "bg-muted font-black" : "text-card-foreground"
                        }`}
                        role="menuitem"
                    >
                        <Sun className="size-4" />
                        <span>Light</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setTheme("dark");
                            setIsOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-2 text-xs font-black uppercase tracking-widest text-left hover:bg-bauhaus-blue hover:text-white transition-colors ${
                            theme === "dark" ? "bg-muted font-black" : "text-card-foreground"
                        }`}
                        role="menuitem"
                    >
                        <Moon className="size-4" />
                        <span>Dark</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setTheme("system");
                            setIsOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-2 text-xs font-black uppercase tracking-widest text-left hover:bg-bauhaus-red hover:text-white transition-colors ${
                            theme === "system" ? "bg-muted font-black" : "text-card-foreground"
                        }`}
                        role="menuitem"
                    >
                        <Monitor className="size-4" />
                        <span>System</span>
                    </button>
                </div>
            )}
        </div>
    );
}
