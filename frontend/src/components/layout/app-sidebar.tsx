import * as React from "react";

import { NavAI } from "@/components/layout/nav-ai";
import { NavMain } from "@/components/layout/nav-main";
import { NavSecondary } from "@/components/layout/nav-secondary";
import { NavUser } from "@/components/layout/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    SquaresFourIcon,
    ListIcon,
    GearIcon,
    QuestionIcon,
    MagnifyingGlassIcon,
    CommandIcon,
    ChatIcon,
    Book,
    Article,
    ClipboardText,
    ChatTeardropText,
    ChartBar,
    Brain,
} from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { NavAnalysis } from "@/components/layout/nav-analysis";

const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/",
            icon: <SquaresFourIcon />,
        },
        {
            title: "Tasks",
            url: "/tasks",
            icon: <ListIcon />,
        },
    ],
    navSecondary: [
        {
            title: "Settings",
            url: "/settings",
            icon: <GearIcon />,
        },
        {
            title: "Get Help",
            url: "/help",
            icon: <QuestionIcon />,
        },
        {
            title: "Search",
            url: "/search",
            icon: <MagnifyingGlassIcon />,
        },
    ],
    AI: [
        {
            name: "Chat",
            url: "/chat",
            icon: <ChatIcon />,
        },
        {
            name: "Topic",
            url: "/topic",
            icon: <Book />,
        },
        {
            name: "Quiz",
            url: "/quiz",
            icon: <Article />,
        },
        {
            name: "Preparation",
            url: "/preparation",
            icon: <ClipboardText />,
        },
        {
            name: "Interview",
            url: "/interview",
            icon: <ChatTeardropText />,
        },
    ],
    analysis: [
        {
            name: "Task Analysis",
            url: "/task-analysis",
            icon: <ChartBar />,
        },
        {
            name: "AI Analysis",
            url: "/ai-analysis",
            icon: <Brain />,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session, isPending } = authClient.useSession();

    const user = session?.user
        ? {
              ...session.user,
              image: session.user.image ?? "",
          }
        : null;

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="data-[slot=sidebar-menu-button]:p-1.5!"
                            render={<a href="/" />}
                        >
                            <CommandIcon className="size-5!" />
                            <span className="text-base font-semibold">
                                Marko
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavAI items={data.AI} />
                <NavAnalysis items={data.analysis} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                {isPending ? (
                    <NavUser loading />
                ) : user ? (
                    <NavUser user={user} />
                ) : (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                render={<a href="/login" />}
                                className="justify-center"
                            >
                                <span>Sign in</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
