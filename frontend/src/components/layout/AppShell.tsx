import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { motion, AnimatePresence } from "framer-motion";

const pageVariants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
};

const pageTransition = {
    duration: 0.22,
    ease: [0.16, 1, 0.3, 1],
};

export function AppShell() {
    const { data: session, isPending } = useSession();
    const location = useLocation();

    if (isPending) {
        return (
            <div className="flex h-dvh items-center justify-center bg-background">
                <motion.div
                    className="flex flex-col items-center gap-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Spinner className="text-accent size-6" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Loading Marko…
                    </p>
                </motion.div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Hide sidebar for immersive focus routes: quiz AND interview
    const isImmersiveRoute =
        (location.pathname.includes("/lessons/") && location.pathname.endsWith("/quiz")) ||
        location.pathname.endsWith("/interview");

    if (isImmersiveRoute) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    className="flex h-dvh w-screen flex-col bg-background overflow-hidden"
                    initial={pageVariants.initial}
                    animate={pageVariants.animate}
                    exit={pageVariants.exit}
                    transition={pageTransition}
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {/* Top header bar with sidebar trigger */}
                <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-20">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                    </div>
                </header>

                {/* Page content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        className="flex flex-1 flex-col gap-4 p-4 pt-4"
                        initial={pageVariants.initial}
                        animate={pageVariants.animate}
                        exit={pageVariants.exit}
                        transition={pageTransition}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </SidebarInset>
        </SidebarProvider>
    );
}
