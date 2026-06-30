import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSession, signOut } from "@/lib/auth-client";
import {
    LayoutDashboard,
    BookOpen,
    Sparkles,
    LogOut,
    ChevronsUpDown,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/courses", label: "My Courses", icon: BookOpen },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    const { data: session } = useSession();
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/login");
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            {/* Brand header */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
                            <div className="flex items-center justify-center rounded-xl bg-accent text-white size-8 shadow-sm">
                                <Sparkles className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-bold text-foreground">Marko</span>
                                <span className="truncate text-[10px] text-muted-foreground font-medium">AI Learning</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Navigation */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const isActive =
                                    location.pathname === item.path ||
                                    (item.path !== "/dashboard" &&
                                        location.pathname.startsWith(item.path));
                                return (
                                    <SidebarMenuItem key={item.path} className="relative">
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            tooltip={item.label}
                                            render={<Link to={item.path} />}
                                            className={cn(
                                                "relative transition-all duration-200",
                                                isActive && "text-accent font-semibold"
                                            )}
                                        >
                                            {/* Animated active pill */}
                                            <AnimatePresence>
                                                {isActive && (
                                                    <motion.span
                                                        layoutId="sidebar-active-pill"
                                                        className="absolute inset-0 rounded-lg bg-accent/10 border border-accent/20"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    />
                                                )}
                                            </AnimatePresence>
                                            <item.icon className={cn(
                                                "relative z-10 transition-colors duration-200",
                                                isActive ? "text-accent" : "text-muted-foreground"
                                            )} />
                                            <span className="relative z-10">{item.label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* User footer */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger render={
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                />
                            }>
                                <Avatar className="size-8 rounded-xl">
                                    <AvatarImage
                                        src={session?.user?.image || ""}
                                        alt="Avatar"
                                    />
                                    <AvatarFallback className="rounded-xl bg-accent text-white text-xs font-bold">
                                        {session?.user?.name
                                            ? session.user.name[0].toUpperCase()
                                            : "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {session?.user?.name || "User"}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {session?.user?.email || ""}
                                    </span>
                                </div>
                                <ChevronsUpDown className="text-muted-foreground size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="min-w-56 rounded-xl"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                >
                                    <LogOut className="size-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
