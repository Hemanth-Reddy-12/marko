import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSession, signOut } from "@/lib/auth-client";
import {
    Home,
    BookOpen,
    GraduationCap,
    ClipboardCheck,
    Activity,
    BarChart3,
    Settings,
    LogOut,
    ChevronUp,
    ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { MarkoLogo, MarkoIcon } from "@/components/ui/logo";

const primaryNav = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: Home,
        color: "bg-bauhaus-red",
    },
    {
        label: "My Courses",
        path: "/courses",
        icon: BookOpen,
        color: "bg-bauhaus-blue",
    },
    {
        label: "Lessons",
        path: "/lessons",
        icon: GraduationCap,
        color: "bg-bauhaus-yellow",
    },
    {
        label: "Quizzes",
        path: "/quizzes",
        icon: ClipboardCheck,
        color: "bg-bauhaus-red",
    },
    {
        label: "Interviews",
        path: "/interviews",
        icon: ScrollText,
        color: "bg-bauhaus-blue",
    },
];

export function AppSidebar() {
    const { data: session } = useSession();
    const location = useLocation();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

    const handleSignOut = async () => {
        await signOut();
        navigate("/login");
    };

    const closeMobile = React.useCallback(() => setMobileOpen(false), [setMobileOpen]);

    const renderLogo = () => (
        <div
            className={cn(
                "border-b-2 border-foreground bg-background h-16 flex items-center flex-shrink-0",
                collapsed ? "justify-center p-3" : "px-6 py-3"
            )}
        >
            {collapsed ? (
                <MarkoIcon className="size-8" />
            ) : (
                <div className="h-7 w-auto flex items-center">
                    <MarkoLogo className="h-full w-auto" />
                </div>
            )}
        </div>
    );

    const renderNav = () => (
        <nav className={cn("flex flex-col gap-1", collapsed ? "px-2 items-center" : "px-3")}>
            {primaryNav.map((item) => {
                const isActive =
                    location.pathname === item.path ||
                    (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        title={collapsed ? item.label : undefined}
                        onClick={closeMobile}
                        className={cn(
                            "flex items-center h-12 w-full px-4 rounded-none transition-none border-b-2 border-transparent",
                            collapsed && "justify-center px-0 w-12",
                            isActive
                                ? `${item.color} text-white font-bold border-foreground bauhaus-border`
                                : "text-foreground hover:bg-muted font-bold border-b-foreground/20 hover:border-b-foreground"
                        )}
                    >
                        <item.icon
                            className={cn("size-5 flex-shrink-0", isActive ? "text-white" : "text-foreground")}
                            strokeWidth={isActive ? 3 : 2}
                        />
                        {!collapsed && (
                            <span className="text-sm truncate uppercase tracking-widest font-bold ml-3">
                                {item.label}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );

    const renderProfile = () => (
        <div className="border-t-2 border-foreground bg-muted group relative">
            <button
                className={cn(
                    "flex items-center w-full h-16 px-4 hover:bg-bauhaus-blue hover:text-white transition-none cursor-pointer focus:outline-none",
                    collapsed && "justify-center px-0"
                )}
                onClick={() => {
                    const menu = document.getElementById("profile-menu");
                    if (menu) menu.classList.toggle("hidden");
                }}
            >
                <div className="size-8 bauhaus-border flex-shrink-0 bg-white overflow-hidden">
                    {session?.user?.image ? (
                        <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center font-bold text-sm">
                            {(session?.user?.name || "GUEST").charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                {!collapsed && (
                    <>
                        <div className="flex flex-1 text-left text-xs leading-tight ml-3">
                            <span className="truncate font-bold uppercase tracking-widest text-xs">
                                {session?.user?.name || "GUEST"}
                            </span>
                        </div>
                        <ChevronUp className="size-3 text-muted-foreground group-hover:text-white" />
                    </>
                )}
            </button>

            {/* Dropdown Menu Overlay */}
            <div id="profile-menu" className="hidden absolute bottom-full left-0 w-full min-w-56 bg-card bauhaus-border shadow-none border-b-0 z-50">
                <Link
                    to="/settings"
                    onClick={closeMobile}
                    className="flex items-center w-full hover:bg-bauhaus-yellow cursor-pointer text-xs py-3 px-4 font-bold uppercase tracking-widest border-b-2 border-foreground transition-none focus:bg-bauhaus-yellow focus:text-black"
                >
                    <Settings className="size-4 mr-3" />
                    Account Settings
                </Link>
                <button
                    onClick={handleSignOut}
                    className="flex items-center w-full hover:bg-bauhaus-red cursor-pointer text-xs py-3 px-4 font-bold uppercase tracking-widest text-destructive transition-none focus:bg-bauhaus-red focus:text-white border-none"
                >
                    <LogOut className="size-4 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );

    const sidebarBody = (
        <>
            {renderLogo()}
            <div className="flex-1 overflow-y-auto scrollbar-none py-4">{renderNav()}</div>
            {renderProfile()}
        </>
    );

    if (isMobile) {
        return (
            <>
                {/* Backdrop */}
                <div
                    onClick={closeMobile}
                    aria-hidden="true"
                    className={cn(
                        "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200",
                        mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                />
                {/* Drawer */}
                <aside
                    className={cn(
                        "fixed top-0 left-0 z-50 flex flex-col w-64 h-screen border-r-2 border-foreground bg-sidebar transition-transform duration-200 ease-linear",
                        mobileOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    {sidebarBody}
                </aside>
            </>
        );
    }

    return (
        <aside
            className={cn(
                "flex flex-col border-r-2 border-foreground bg-sidebar h-screen sticky top-0 transition-[width] duration-200 ease-linear",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {sidebarBody}
        </aside>
    );
}
