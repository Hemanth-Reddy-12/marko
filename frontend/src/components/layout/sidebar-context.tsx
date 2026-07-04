import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const STORAGE_KEY = "marko.sidebar.collapsed";

type SidebarContextValue = {
    collapsed: boolean;
    setCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
    toggleCollapsed: () => void;
    mobileOpen: boolean;
    setMobileOpen: (v: boolean) => void;
    toggleMobile: () => void;
    toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();
    const [collapsed, setCollapsedState] = React.useState<boolean>(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) === "true";
        } catch {
            return false;
        }
    });
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const setCollapsed = React.useCallback((value: boolean | ((prev: boolean) => boolean)) => {
        setCollapsedState((prev) => {
            const next = typeof value === "function" ? value(prev) : value;
            try {
                localStorage.setItem(STORAGE_KEY, String(next));
            } catch {
                // ignore storage errors
            }
            return next;
        });
    }, []);

    const toggleCollapsed = React.useCallback(() => setCollapsed((c) => !c), [setCollapsed]);

    const toggleMobile = React.useCallback(() => setMobileOpen((o) => !o), []);

    const toggle = React.useCallback(() => {
        if (isMobile) setMobileOpen((o) => !o);
        else setCollapsed((c) => !c);
    }, [isMobile, setCollapsed]);

    React.useEffect(() => {
        // Close the mobile drawer when the viewport grows past the mobile breakpoint.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!isMobile) setMobileOpen(false);
    }, [isMobile]);

    const value = React.useMemo<SidebarContextValue>(
        () => ({ collapsed, setCollapsed, toggleCollapsed, mobileOpen, setMobileOpen, toggleMobile, toggle }),
        [collapsed, setCollapsed, toggleCollapsed, mobileOpen, setMobileOpen, toggleMobile, toggle]
    );

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
    const ctx = React.useContext(SidebarContext);
    if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
    return ctx;
}
