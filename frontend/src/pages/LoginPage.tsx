import { authClient } from "@/lib/auth-client";
import { BGPattern } from "@/components/ui/bg-pattern";
import { motion } from "framer-motion";
import { useState } from "react";

function GoogleIcon({ className, skeleton }: { className?: string; skeleton?: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className={className}
            xmlSpace="preserve"
        >
            <path
                d="M8.9 16c0 .6.1 1.2.2 1.8L11 16l-1.8-1.8q-.3.9-.3 1.8"
                style={{ fill: skeleton ? "none" : "none" }}
            />
            <path
                d="M16 23.1c-3.3 0-6-2.2-6.8-5.2l-6.7 6.7C5.3 29 10.3 32 16 32c3.1 0 6-.9 8.5-2.5l-6.7-6.7q-.9.3-1.8.3"
                style={{ fill: skeleton ? "none" : "#34a853" }}
            />
            <path
                d="M32 13.8c-.1-.5-.5-.8-1-.8H16c-.6 0-1 .4-1 1v5c0 .6.4 1 1 1h5.3c-.9 1.4-2.2 2.3-3.5 2.8l6.7 6.7C29 26.7 32 21.7 32 16v-.7q.15-.6 0-1.5"
                style={{ fill: skeleton ? "none" : "#4285f4" }}
            />
            <path
                d="M8.9 16c0-.6.1-1.2.2-1.8L2.5 7.5C.9 10 0 12.9 0 16s.9 6 2.5 8.5l6.7-6.7q-.3-.9-.3-1.8"
                style={{ fill: skeleton ? "none" : "#fbbc05" }}
            />
            <path
                d="M28.5 6c-1.1-1.4-2.5-2.6-4-3.6C22 .9 19.1 0 16 0 10.3 0 5.3 3 2.5 7.5l6.7 6.7C10 11.2 12.8 9 16 9q.9 0 1.8.3c.9.3 1.7.8 2.6 1.5.3.3.7.3 1.1.1l6.7-3.3c.3-.1.5-.4.5-.7.1-.3 0-.6-.2-.9"
                style={{ fill: skeleton ? "none" : "#ea4335" }}
            />
            {skeleton && (
                <path
                    d="M16 0C7.2 0 0 7.2 0 16s7.2 16 16 16 16-7.2 16-16S24.8 0 16 0zm0 28c-6.6 0-12-5.4-12-12S9.4 4 16 4s12 5.4 12 12-5.4 12-12 12z"
                    style={{ fill: "currentColor", opacity: 0.15 }}
                />
            )}
        </svg>
    );
}

function GithubIcon({ className, skeleton }: { className?: string; skeleton?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 2.247a10 10 0 0 0-3.162 19.487c.5.088.687-.212.687-.475 0-.237-.012-1.025-.012-1.862-2.513.462-3.163-.613-3.363-1.175a3.64 3.64 0 0 0-1.025-1.413c-.35-.187-.85-.65-.013-.662a2 2 0 0 1 1.538 1.025 2.137 2.137 0 0 0 2.912.825 2.1 2.1 0 0 1 .638-1.338c-2.225-.25-4.55-1.112-4.55-4.937a3.9 3.9 0 0 1 1.025-2.688 3.6 3.6 0 0 1 .1-2.65s.837-.262 2.75 1.025a9.43 9.43 0 0 1 5 0c1.912-1.3 2.75-1.025 2.75-1.025a3.6 3.6 0 0 1 .1 2.65 3.87 3.87 0 0 1 1.025 2.688c0 3.837-2.338 4.687-4.562 4.937a2.37 2.37 0 0 1 .674 1.85c0 1.338-.012 2.413-.012 2.75 0 .263.187.575.687.475A10.005 10.005 0 0 0 12 2.247"
                style={{ fill: skeleton ? "currentColor" : undefined, opacity: skeleton ? 0.15 : 1 }}
            />
        </svg>
    );
}

export function LoginPage() {
    const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);

    const handleGoogleLogin = () => {
        setLoadingProvider("google");
        authClient.signIn.social({
            provider: "google",
            callbackURL: "http://localhost:5173/",
        });
    };

    const handleGithubLogin = () => {
        setLoadingProvider("github");
        authClient.signIn.social({
            provider: "github",
            callbackURL: "http://localhost:5173/",
        });
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4">
            <BGPattern variant="grid" mask="fade-edges" size={32} />
            <div className="flex w-full max-w-md flex-col items-center gap-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight">
                        <span className="relative inline-block">
                            <span className="relative z-10 bg-linear-to-r from-primary via-foreground to-primary bg-clip-text text-transparent">
                                Marko
                            </span>
                            <span className="absolute -bottom-1 left-0 h-2 w-full rounded-sm bg-primary/20" />
                        </span>
                    </h1>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Login with your Google or Github account
                    </p>
                </div>

                <div className="grid w-full grid-cols-2 gap-4">
                    <div className="group relative flex aspect-square flex-col items-center justify-center duration-300">
                        <motion.div
                            onClick={loadingProvider ? undefined : handleGoogleLogin}
                            whileHover={loadingProvider ? undefined : { scale: 1.2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className={loadingProvider === "google" ? "animate-pulse cursor-not-allowed" : "cursor-pointer"}
                        >
                            <GoogleIcon className="h-12 w-12" skeleton={loadingProvider === "google"} />
                            <span className="text-sm font-medium text-foreground transition-colors duration-300">
                                Google
                            </span>
                        </motion.div>
                    </div>

                    <div className="group relative flex aspect-square flex-col items-center justify-center duration-300">
                        <motion.div
                            onClick={loadingProvider ? undefined : handleGithubLogin}
                            whileHover={loadingProvider ? undefined : { scale: 1.2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className={loadingProvider === "github" ? "animate-pulse cursor-not-allowed" : "cursor-pointer"}
                        >
                            <GithubIcon className="h-12 w-12 fill-foreground transition-colors duration-300" skeleton={loadingProvider === "github"} />
                            <span className="text-sm font-medium text-foreground transition-colors duration-300 group-hover:text-foreground">
                                GitHub
                            </span>
                        </motion.div>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy
                    Policy
                </p>
            </div>
        </div>
    );
}
