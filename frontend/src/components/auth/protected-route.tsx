import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
        null,
    );

    useEffect(() => {
        authClient.getSession().then((session) => {
            setIsAuthenticated(!!session.data);
        });
    }, []);

    if (isAuthenticated === null) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
        null,
    );

    useEffect(() => {
        authClient.getSession().then((session) => {
            setIsAuthenticated(!!session.data);
        });
    }, []);

    if (isAuthenticated === null) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}
