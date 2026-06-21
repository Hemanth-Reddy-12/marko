import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DotsThreeVerticalIcon,
    UserCircleIcon,
    CreditCardIcon,
    BellIcon,
    SignOutIcon,
} from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";

function NavUserSkeleton() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex items-center gap-2 px-2 py-1.5">
                    <Skeleton className="size-8 rounded-lg" />
                    <div className="flex flex-col gap-1 flex-1">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

export function NavUser({
    user,
    loading,
}: {
    user?: {
        name: string;
        email: string;
        image: string;
    };
    loading?: boolean;
}) {
    const { isMobile } = useSidebar();

    if (loading) {
        return <NavUserSkeleton />;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton
                                size="lg"
                                className="aria-expanded:bg-muted"
                            />
                        }
                    >
                        <Avatar className="size-8 rounded-lg ">
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback className="rounded-lg">
                                CN
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">
                                {user.name}
                            </span>
                            <span className="truncate text-xs text-foreground/70">
                                {user.email}
                            </span>
                        </div>
                        <DotsThreeVerticalIcon className="ml-auto size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="min-w-56"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="size-8">
                                        <AvatarImage
                                            src={user.image}
                                            alt={user.name}
                                        />
                                        <AvatarFallback className="rounded-lg">
                                            CN
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">
                                            {user.name}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {user.email}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onSelect={() => (window.location.href = "/account")}>
                                <UserCircleIcon />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => (window.location.href = "/billing")}>
                                <CreditCardIcon />
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => (window.location.href = "/notifications")}>
                                <BellIcon />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={async () => {
                                await authClient.signOut();
                                window.location.href = "/login";
                            }}
                            className="text-red-500"
                        >
                            <SignOutIcon />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
