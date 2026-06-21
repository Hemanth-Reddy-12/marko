import { useLocation } from "react-router-dom";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: React.ReactNode;
    }[];
}) {
    const location = useLocation();

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu className="gap-1">
                    {items.map((item) => {
                        const isActive = location.pathname === item.url;
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    tooltip={item.title}
                                    render={<a href={item.url} />}
                                    data-active={isActive}
                                    className={
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                            : ""
                                    }
                                >
                                    {item.icon}
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
