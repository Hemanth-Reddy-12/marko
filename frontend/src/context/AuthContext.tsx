import React, { createContext, useEffect, useState, useContext } from "react";
import { authClient } from "../lib/auth-client";
// Types for the auth session – using any to avoid strict dependency on better-auth types
type Session = any;

interface AuthContextValue {
    session: Session | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ session: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const loadSession = async () => {
        try {
            const s = await authClient.getSession();
            setSession(s);
        } catch {
            setSession(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSession();
        // Listen to storage changes (better-auth stores the session in localStorage)
        const handler = (e: StorageEvent) => {
            if (e.key?.startsWith("better-auth")) {
                loadSession();
            }
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    return (
        <AuthContext.Provider value={{ session, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
