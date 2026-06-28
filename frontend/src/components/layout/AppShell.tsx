import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/layout/AppSidebar";

const routeLabels: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/courses": "My Courses",
};

export function AppShell() {
    const { data: session, isPending } = useSession();
    const location = useLocation();

    if (isPending) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Spinner className="text-foreground" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Loading Marko…
                    </p>
                </div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const currentLabel =
        routeLabels[location.pathname] ?? location.pathname.slice(1);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {/* Top header bar with trigger + breadcrumb */}
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink render={<Link to="/dashboard" />}>
                                        Marko
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                {/* Page content */}
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
