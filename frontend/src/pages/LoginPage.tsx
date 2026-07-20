import { authClient, useSession } from "@/lib/auth-client";
import { Navigate } from "react-router-dom";
import { BGPattern } from "@/components/ui/bg-pattern";
import { motion } from "framer-motion";
import { useState } from "react";
import { MarkoLogo } from "@/components/ui/logo";

function GoogleIcon({
    className,
    skeleton,
}: {
    className?: string;
    skeleton?: boolean;
}) {
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

function GithubIcon({
    className,
    skeleton,
}: {
    className?: string;
    skeleton?: boolean;
}) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 2.247a10 10 0 0 0-3.162 19.487c.5.088.687-.212.687-.475 0-.237-.012-1.025-.012-1.862-2.513.462-3.163-.613-3.363-1.175a3.64 3.64 0 0 0-1.025-1.413c-.35-.187-.85-.65-.013-.662a2 2 0 0 1 1.538 1.025 2.137 2.137 0 0 0 2.912.825 2.1 2.1 0 0 1 .638-1.338c-2.225-.25-4.55-1.112-4.55-4.937a3.9 3.9 0 0 1 1.025-2.688 3.6 3.6 0 0 1 .1-2.65s.837-.262 2.75 1.025a9.43 9.43 0 0 1 5 0c1.912-1.3 2.75-1.025 2.75-1.025a3.6 3.6 0 0 1 .1 2.65 3.87 3.87 0 0 1 1.025 2.688c0 3.837-2.338 4.687-4.562 4.937a2.37 2.37 0 0 1 .674 1.85c0 1.338-.012 2.413-.012 2.75 0 .263.187.575.687.475A10.005 10.005 0 0 0 12 2.247"
                style={{
                    fill: skeleton ? "currentColor" : undefined,
                    opacity: skeleton ? 0.15 : 1,
                }}
            />
        </svg>
    );
}

export function LoginPage() {
    const [loadingProvider, setLoadingProvider] = useState<
        "google" | "github" | null
    >(null);

    const { data: session } = useSession();

    if (session) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleGoogleLogin = () => {
        setLoadingProvider("google");
        authClient.signIn.social({
            provider: "google",
            callbackURL: `${window.location.origin}/dashboard`,
        });
    };

    const handleGithubLogin = () => {
        setLoadingProvider("github");
        authClient.signIn.social({
            provider: "github",
            callbackURL: `${window.location.origin}/dashboard`,
        });
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4 bg-bauhaus-yellow">
            {/* Bauhaus Decor */}
            <div className="absolute top-0 left-0 w-32 h-screen bg-bauhaus-blue border-r-4 border-black hidden md:block" />
            <div className="absolute bottom-16 right-16 size-48 bg-bauhaus-red rounded-full border-4 border-black" />
            <div className="flex w-full max-w-md flex-col items-center gap-8 relative z-10 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8">
                <div className="text-center flex flex-col items-center gap-4 w-full">
                    <div className="w-full max-w-[240px] px-2 py-4 flex items-center justify-center">
                        <MarkoLogo className="w-full h-auto" />
                    </div>
                    <p className="text-xs font-bold text-black/70 uppercase tracking-widest mt-2">
                        LOGIN TO YOUR WORKSPACE
                    </p>
                </div>

                <div className="flex flex-col w-full gap-4">
                    <motion.div
                        onClick={
                            loadingProvider ? undefined : handleGoogleLogin
                        }
                        whileHover={
                            loadingProvider ? undefined : { x: 2, y: 2 }
                        }
                        className={
                            loadingProvider === "google"
                                ? "animate-pulse cursor-not-allowed bg-white border-4 border-black p-4 flex items-center justify-center gap-4"
                                : "cursor-pointer bg-white border-4 border-black p-4 flex items-center justify-center gap-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                        }
                    >
                        <GoogleIcon
                            className="size-6"
                            skeleton={loadingProvider === "google"}
                        />
                        <span className="text-sm font-black uppercase tracking-widest text-black">
                            {loadingProvider === "google"
                                ? "LOADING..."
                                : "CONTINUE WITH GOOGLE"}
                        </span>
                    </motion.div>

                    <motion.div
                        onClick={
                            loadingProvider ? undefined : handleGithubLogin
                        }
                        whileHover={
                            loadingProvider ? undefined : { x: 2, y: 2 }
                        }
                        className={
                            loadingProvider === "github"
                                ? "animate-pulse cursor-not-allowed bg-black text-white border-4 border-black p-4 flex items-center justify-center gap-4"
                                : "cursor-pointer bg-black text-white border-4 border-black p-4 flex items-center justify-center gap-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                        }
                    >
                        <GithubIcon
                            className="size-6 fill-white"
                            skeleton={loadingProvider === "github"}
                        />
                        <span className="text-sm font-black uppercase tracking-widest text-white">
                            {loadingProvider === "github"
                                ? "LOADING..."
                                : "CONTINUE WITH GITHUB"}
                        </span>
                    </motion.div>
                </div>

                <p className="text-center text-[10px] font-bold text-black/60 uppercase tracking-widest leading-relaxed">
                    BY CONTINUING, YOU AGREE TO OUR
                    <br />
                    TERMS OF SERVICE AND PRIVACY POLICY
                </p>
            </div>
        </div>
    );
}
