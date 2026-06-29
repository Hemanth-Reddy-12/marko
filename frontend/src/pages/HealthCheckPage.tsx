import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Server, Database, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface HealthStatus {
    status: string;
    db: boolean;
}

export function HealthCheckPage() {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const checkHealth = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${baseUrl}/api/health`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setHealth(data);
        } catch (err) {
            console.error("Health check failed:", err);
            setError("Failed to connect to the server.");
        } finally {
            setLoading(false);
            setLastChecked(new Date());
        }
    };

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const StatusBadge = ({ isOk, label }: { isOk: boolean; label: string }) => (
        <Badge variant={isOk ? "default" : "destructive"} className="flex items-center gap-1.5 font-bold px-3 py-1 text-xs">
            {isOk ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
            {label}
        </Badge>
    );

    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-50 p-4">
            <Card className="w-full max-w-md bg-white border border-zinc-200 shadow-sm rounded-lg">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-zinc-100 border border-zinc-200/50 size-12 rounded-lg flex items-center justify-center mb-4 text-zinc-900">
                        <Activity className={`size-6 ${loading ? 'animate-pulse' : ''}`} />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">System Status</CardTitle>
                    <CardDescription className="font-medium text-xs text-zinc-400">
                        Real-time health check of core services
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-5 pt-4">
                    {/* Status Indicators */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 border border-zinc-200/40">
                            <div className="flex items-center gap-3">
                                <Server className="size-4 text-zinc-500" />
                                <span className="font-semibold text-xs text-zinc-700">API Server</span>
                            </div>
                            {loading && !health && !error ? (
                                <div className="w-16 h-6 bg-zinc-200 rounded animate-pulse" />
                            ) : (
                                <StatusBadge
                                    isOk={health?.status === "ok" && !error}
                                    label={error ? "Offline" : "Online"}
                                />
                            )}
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 border border-zinc-200/40">
                            <div className="flex items-center gap-3">
                                <Database className="size-4 text-zinc-500" />
                                <span className="font-semibold text-xs text-zinc-700">Database</span>
                            </div>
                            {loading && !health && !error ? (
                                <div className="w-16 h-6 bg-zinc-200 rounded animate-pulse" />
                            ) : (
                                <StatusBadge
                                    isOk={health?.db === true && !error}
                                    label={error || !health?.db ? "Offline" : "Connected"}
                                />
                            )}
                        </div>
                    </div>

                    {/* Actions and Meta */}
                    <div className="pt-2 flex flex-col gap-3">
                        <Button
                            onClick={checkHealth}
                            disabled={loading}
                            className="w-full h-10 font-semibold text-xs shadow-sm bg-zinc-900 hover:bg-zinc-800 text-white rounded-md flex items-center justify-center gap-2"
                        >
                            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? "Checking..." : "Refresh Status"}
                        </Button>

                        {lastChecked && (
                            <p className="text-[10px] text-center text-zinc-400 font-medium">
                                Last checked: {lastChecked.toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
