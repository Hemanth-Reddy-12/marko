"use client";

import * as React from "react";
import { useLocation } from "react-router-dom";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSecondary({
    items,
    ...props
}: {
    items: {
        title: string;
        url: string;
        icon: React.ReactNode;
    }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    const location = useLocation();

    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = location.pathname === item.url;
                        return (
                            <SidebarMenuItem key={item.title}>
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
