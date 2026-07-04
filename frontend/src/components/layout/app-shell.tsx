import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

import { AppSidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { motion, AnimatePresence } from "framer-motion";

const pageVariants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
};

const pageTransition = {
    duration: 0.22,
    ease: [0.16, 1, 0.3, 1] as any,
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
            <div className="flex h-screen w-screen overflow-hidden bg-background">
                <AppSidebar />
                <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                    {/* Context Identity Navbar */}
                    <Navbar />

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
                </div>
            </div>
        </SidebarProvider>
    );
}
