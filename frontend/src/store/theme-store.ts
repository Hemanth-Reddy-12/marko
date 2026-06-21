import { create } from "zustand";

type Theme = "dark" | "light";

const STORAGE_KEY = "marko-theme";

function getInitialTheme(): Theme {
    if (typeof window === "undefined") return "dark";
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "dark" || stored === "light") return stored;
    return "dark";
}

interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    theme: getInitialTheme(),
    toggleTheme: () =>
        set((state) => {
            const next = state.theme === "dark" ? "light" : "dark";
            localStorage.setItem(STORAGE_KEY, next);
            return { theme: next };
        }),
}));
