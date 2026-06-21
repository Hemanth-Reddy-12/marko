"use client";

import { useLocation } from "react-router-dom";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavAI({
    items,
}: {
    items: {
        name: string;
        url: string;
        icon: React.ReactNode;
    }[];
}) {
    const location = useLocation();

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>AI</SidebarGroupLabel>
            <SidebarMenu className="gap-1">
                {items.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                        <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                                render={<a href={item.url} />}
                                data-active={isActive}
                                className={
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : ""
                                }
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
