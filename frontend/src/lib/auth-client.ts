import { createAuthClient } from "better-auth/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const authClient = createAuthClient({
    baseURL: baseUrl,
});

export const { useSession, signIn, signUp, signOut } = authClient;
