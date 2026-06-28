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
    SidebarGroupLabel,
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
                            <div className="flex items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground size-8">
                                <Sparkles data-icon="inline-start" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">Marko</span>
                                <span className="truncate text-xs text-muted-foreground">
                                    Learning Platform
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Navigation */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigate</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const isActive =
                                    location.pathname === item.path ||
                                    (item.path !== "/dashboard" &&
                                        location.pathname.startsWith(item.path));
                                return (
                                    <SidebarMenuItem key={item.path}>
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            tooltip={item.label}
                                            render={<Link to={item.path} />}
                                        >
                                            <item.icon />
                                            <span>{item.label}</span>
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
                                <Avatar className="size-8 rounded-lg">
                                    <AvatarImage
                                        src={session?.user?.image || ""}
                                        alt="Avatar"
                                    />
                                    <AvatarFallback className="rounded-lg">
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
                                <ChevronsUpDown />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem onClick={handleSignOut}>
                                    <LogOut />
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
