import { useLocation } from "react-router-dom";
import { NotificationMenu } from "./NotificationMenu";
import { useSidebar } from "./sidebar-context";
import { Button } from "@/components/ui/button";
import { PanelLeft, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

export function Navbar() {
    const location = useLocation();
    const { toggle, collapsed, mobileOpen } = useSidebar();
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    // Generate breadcrumbs from location
    const paths = location.pathname.split("/").filter(Boolean);
    const contextName =
        paths.length > 0
            ? paths[0].charAt(0).toUpperCase() + paths[0].slice(1)
            : "Workspace";

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bauhaus-border bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-20">
            <div className="flex items-center justify-between px-4 w-full">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggle}
                        aria-label="Toggle sidebar"
                        aria-expanded={mobileOpen || !collapsed}
                        className="size-8 rounded-none hover:bg-muted bauhaus-border"
                    >
                        <PanelLeft className={cn("size-4 transition-transform", collapsed && !mobileOpen && "rotate-180")} />
                    </Button>
                    <div className="flex items-center gap-3 ml-2 border-l bauhaus-border pl-4 h-6">
                        <span className="text-xs font-bold uppercase tracking-widest text-foreground">
                            {contextName}
                        </span>
                        {paths.length > 1 && (
                            <>
                                <span className="text-xs text-muted-foreground font-bold">
                                    /
                                </span>
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground truncate max-w-[200px]">
                                    {paths[1]}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="size-8 rounded-none hover:bg-muted bauhaus-border"
                    >
                        {theme === "dark" ? (
                            <Sun className="size-4" />
                        ) : (
                            <Moon className="size-4" />
                        )}
                    </Button>
                    <NotificationMenu />
                </div>
            </div>
        </header>
    );
}
