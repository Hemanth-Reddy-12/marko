import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/theme-store";
import { Moon, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";

const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/tasks": "Tasks",
    "/chat": "Chat",
    "/topic": "Topic",
    "/quiz": "Quiz",
    "/preparation": "Preparation",
    "/interview": "Interview",
    "/task-analysis": "Task Analysis",
    "/ai-analysis": "AI Analysis",
    "/settings": "Settings",
    "/help": "Get Help",
    "/search": "Search",
    "/account": "Account",
    "/billing": "Billing",
    "/notifications": "Notifications",
};

export function SiteHeader() {
    const { theme, toggleTheme } = useThemeStore();
    const { pathname } = useLocation();

    const title = pageTitles[pathname] ?? "Marko";

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 h-4 data-vertical:self-auto"
                />
                <h1 className="text-base font-medium">{title}</h1>
                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </header>
    );
}
