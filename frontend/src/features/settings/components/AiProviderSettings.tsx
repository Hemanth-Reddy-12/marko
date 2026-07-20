import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Key,
    Globe,
    CheckCircle2,
    XCircle,
    Loader2,
    Eye,
    EyeOff,
    RefreshCw,
    AlertTriangle,
    ChevronDown,
    Lock,
    Trash2,
    ShieldCheck,
} from "lucide-react";
import { Icon } from "@iconify/react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AiConfig {
    activeProvider: string;
    activeModel: string;
    // Masked display values (sent from server with •••• chars)
    geminiApiKey: string;
    openaiApiKey: string;
    openaiBaseUrl: string;
    anthropicApiKey: string;
    anthropicBaseUrl: string;
    // Boolean flags — whether a key is stored in the DB
    hasGeminiKey?: boolean;
    hasOpenAiKey?: boolean;
    hasAnthropicKey?: boolean;
    hasConfiguredKey?: boolean;
    hasGeminiEnvKey?: boolean;
    hasOpenAiEnvKey?: boolean;
}

// Per-provider form state
interface ProviderFormState {
    apiKey: string;
    baseUrl: string;
    showKey: boolean;
    isSaving: boolean;
    isDeleting: boolean;
}

const DEFAULT_FORM: ProviderFormState = {
    apiKey: "",
    baseUrl: "",
    showKey: false,
    isSaving: false,
    isDeleting: false,
};

export function AiProviderSettings() {
    const [config, setConfig] = useState<AiConfig>({
        activeProvider: "",
        activeModel: "",
        geminiApiKey: "",
        openaiApiKey: "",
        openaiBaseUrl: "",
        anthropicApiKey: "",
        anthropicBaseUrl: "",
    });

    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    const [isSavingProvider, setIsSavingProvider] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [testStatus, setTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

    // Per-provider form state
    const [geminiForm, setGeminiForm] = useState<ProviderFormState>({ ...DEFAULT_FORM });
    const [openaiForm, setOpenaiForm] = useState<ProviderFormState>({ ...DEFAULT_FORM, baseUrl: "https://api.openai.com/v1" });
    const [anthropicForm, setAnthropicForm] = useState<ProviderFormState>({ ...DEFAULT_FORM, baseUrl: "https://api.anthropic.com" });

    const [isCustomModel, setIsCustomModel] = useState(false);
    const [customModelInput, setCustomModelInput] = useState("");

    useEffect(() => { loadConfig(); }, []);

    useEffect(() => {
        if (config.activeProvider) loadModels(config.activeProvider);
    }, [config.activeProvider]);

    const loadConfig = async () => {
        try {
            setIsLoadingConfig(true);
            const data = await fetchApi<AiConfig>("/api/ai/config");
            setConfig(data);
            if (data.activeModel) setCustomModelInput(data.activeModel);
            // Pre-fill base URLs from stored config
            if (data.openaiBaseUrl) setOpenaiForm(p => ({ ...p, baseUrl: data.openaiBaseUrl }));
            if (data.anthropicBaseUrl) setAnthropicForm(p => ({ ...p, baseUrl: data.anthropicBaseUrl }));
        } catch (e: any) {
            toast.error("Could not load AI configuration — check your connection and try again.");
        } finally {
            setIsLoadingConfig(false);
        }
    };

    const loadModels = async (provider: string, apiKeyOverride?: string, baseUrlOverride?: string) => {
        try {
            setIsFetchingModels(true);
            let query = `/api/ai/models?provider=${provider}`;
            if (baseUrlOverride) query += `&baseURL=${encodeURIComponent(baseUrlOverride)}`;
            if (apiKeyOverride) query += `&apiKey=${encodeURIComponent(apiKeyOverride)}`;

            const data = await fetchApi<{ models: string[] }>(query);
            if (data.models && data.models.length > 0) {
                setAvailableModels(data.models);
                if (!config.activeModel || !data.models.includes(config.activeModel)) {
                    const firstModel = data.models[0]!;
                    setConfig(prev => ({ ...prev, activeModel: firstModel }));
                    setCustomModelInput(firstModel);
                }
            } else {
                setAvailableModels([]);
            }
        } catch {
            setAvailableModels([]);
            toast.error(`Could not fetch models for ${provider}. Check that your API key and base URL are correct.`);
        } finally {
            setIsFetchingModels(false);
        }
    };

    /** Switches active provider without touching keys */
    const handleSwitchProvider = async (provider: string) => {
        try {
            setIsSavingProvider(true);
            const res = await fetchApi<AiConfig>("/api/ai/config", {
                method: "PUT",
                body: JSON.stringify({ activeProvider: provider }),
            });
            setConfig(prev => ({ ...prev, ...res }));
        } catch (e: any) {
            toast.error("Could not switch provider: " + e.message);
        } finally {
            setIsSavingProvider(false);
        }
    };

    /** Save active model */
    const handleSaveModel = async (model: string) => {
        try {
            const res = await fetchApi<AiConfig>("/api/ai/config", {
                method: "PUT",
                body: JSON.stringify({ activeModel: model }),
            });
            setConfig(prev => ({ ...prev, ...res }));
        } catch (e: any) {
            toast.error("Could not save model: " + e.message);
        }
    };

    /** Save a provider's API key (first time only — one key per provider) */
    const handleSaveKey = async (
        provider: "gemini" | "openai" | "anthropic",
        apiKey: string,
        baseUrl?: string,
        setForm?: React.Dispatch<React.SetStateAction<ProviderFormState>>
    ) => {
        if (!apiKey.trim()) {
            toast.error("Enter a valid API key before saving.");
            return;
        }

        setForm?.(p => ({ ...p, isSaving: true }));
        try {
            const body: Record<string, string> = {
                activeProvider: provider,
                [`${provider === "openai" ? "openai" : provider}ApiKey`]: apiKey.trim(),
            };
            if (provider === "openai" && baseUrl) body.openaiBaseUrl = baseUrl.trim();
            if (provider === "anthropic" && baseUrl) body.anthropicBaseUrl = baseUrl.trim();

            const res = await fetchApi<AiConfig>("/api/ai/config", {
                method: "PUT",
                body: JSON.stringify(body),
            });
            setConfig(prev => ({ ...prev, ...res }));
            toast.success(`${provider} API key saved and encrypted.`);
            // Clear the input now that the key is stored
            setForm?.(p => ({ ...p, apiKey: "", showKey: false }));
            // Load models for the new provider
            loadModels(provider, undefined, baseUrl);
        } catch (e: any) {
            if (e.message?.includes("409") || e.status === 409) {
                toast.error(`A ${provider} key is already stored. Delete the existing key first.`);
            } else {
                toast.error("Could not save API key: " + e.message);
            }
        } finally {
            setForm?.(p => ({ ...p, isSaving: false }));
        }
    };

    /** Delete a specific provider's key */
    const handleDeleteKey = async (
        provider: "gemini" | "openai" | "anthropic",
        setForm?: React.Dispatch<React.SetStateAction<ProviderFormState>>
    ) => {
        setForm?.(p => ({ ...p, isDeleting: true }));
        try {
            const res = await fetchApi<AiConfig>(`/api/ai/config/key/${provider}`, { method: "DELETE" });
            setConfig(prev => ({ ...prev, ...res }));
            toast.success(`${provider} API key removed.`);
            setAvailableModels([]);
        } catch (e: any) {
            toast.error("Could not remove API key: " + e.message);
        } finally {
            setForm?.(p => ({ ...p, isDeleting: false }));
        }
    };

    const handleTestConnection = async () => {
        try {
            setIsTesting(true);
            setTestStatus(null);

            const res = await fetchApi<{ success: boolean; message: string }>("/api/ai/test-connection", {
                method: "POST",
                body: JSON.stringify({
                    provider: config.activeProvider,
                    // Send masked key — server will decode from DB
                    apiKey: (() => {
                        if (config.activeProvider === "gemini") return config.geminiApiKey;
                        if (config.activeProvider === "openai") return config.openaiApiKey;
                        if (config.activeProvider === "anthropic") return config.anthropicApiKey;
                        return "";
                    })(),
                    baseURL: (() => {
                        if (config.activeProvider === "openai") return config.openaiBaseUrl;
                        if (config.activeProvider === "anthropic") return config.anthropicBaseUrl;
                        return "";
                    })(),
                    model: isCustomModel ? customModelInput : config.activeModel,
                }),
            });

            setTestStatus({ success: true, message: res.message });
            toast.success(res.message);
        } catch (e: any) {
            const msg = e.message || "Connection failed — verify your API key.";
            setTestStatus({ success: false, message: msg });
            toast.error("Connection failed: " + msg);
        } finally {
            setIsTesting(false);
        }
    };

    const providers = [
        {
            id: "gemini",
            name: "Google Gemini",
            desc: "Flash & reasoning models.",
            activeColor: "bg-bauhaus-yellow text-black",
            icon: "logos:google-gemini",
            hasKey: config.hasGeminiKey,
        },
        {
            id: "openai",
            name: "OpenAI & Compatible",
            desc: "OpenAI, Groq, OpenRouter, Ollama.",
            activeColor: "bg-bauhaus-blue text-white",
            icon: "logos:openai-icon",
            hasKey: config.hasOpenAiKey,
        },
        {
            id: "anthropic",
            name: "Anthropic",
            desc: "Claude models & compatible endpoints.",
            activeColor: "bg-bauhaus-red text-white",
            icon: "logos:anthropic-icon",
            hasKey: config.hasAnthropicKey,
        },
        {
            id: "mock",
            name: "Mock Provider",
            desc: "Offline testing — no key needed.",
            activeColor: "bg-foreground text-background",
            icon: "ph:cpu-bold",
            hasKey: true,
        },
    ];

    if (isLoadingConfig) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
                <Loader2 className="size-7 animate-spin text-bauhaus-blue" />
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    Loading AI configuration…
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Warning if no key configured */}
            {!config.hasConfiguredKey && (
                <div className="bg-bauhaus-yellow/20 border-2 border-bauhaus-yellow p-5 bauhaus-square flex items-start gap-4">
                    <div className="size-9 bg-bauhaus-yellow text-black flex items-center justify-center shrink-0 bauhaus-square mt-0.5">
                        <AlertTriangle className="size-4" />
                    </div>
                    <div>
                        <h4 className="font-heading font-black uppercase text-foreground text-sm tracking-wide">
                            No API key configured
                        </h4>
                        <p className="text-xs font-mono text-muted-foreground mt-1 leading-relaxed">
                            Add an API key for one provider below. Marko uses the active provider's key
                            to generate courses, lessons, and quizzes.
                        </p>
                    </div>
                </div>
            )}

            {/* Active Provider & Model Selector */}
            <Card className="bauhaus-square bauhaus-border bauhaus-shadow bg-card">
                <CardHeader className="border-b bauhaus-border bg-bauhaus-blue pb-4 text-white">
                    <CardTitle className="text-base font-bold uppercase tracking-wider flex items-center gap-2">
                        <Icon icon="ph:cpu-bold" className="size-5 text-white" />
                        <span>Active Provider & Model</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-5 sm:p-7 flex flex-col gap-6">
                    {/* Provider selector */}
                    <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                            Select active provider
                        </Label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {providers.map((p) => {
                                const isSelected = config.activeProvider === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        aria-pressed={isSelected}
                                        onClick={() => {
                                            setConfig(prev => ({ ...prev, activeProvider: p.id }));
                                            loadModels(p.id);
                                            handleSwitchProvider(p.id);
                                        }}
                                        disabled={isSavingProvider}
                                        className={cn(
                                            "flex flex-col p-4 text-left bauhaus-border transition-all duration-150 bauhaus-square relative",
                                            isSelected ? p.activeColor : "bg-background hover:bg-muted text-foreground"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="size-7 flex items-center justify-center">
                                                <Icon
                                                    icon={p.icon}
                                                    className={cn("size-5", p.id === "openai" && isSelected && "brightness-200")}
                                                />
                                            </div>
                                                {p.hasKey && (
                                                    <ShieldCheck className="size-3.5 opacity-80" />
                                                )}
                                                {isSelected && <CheckCircle2 className="size-4 shrink-0" />}
                                            </div>
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-wider leading-tight">{p.name}</span>
                                        <span className="text-[10px] font-mono opacity-70 mt-1.5 leading-snug">{p.desc}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Model picker */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                Model{config.activeProvider ? ` — ${config.activeProvider.toUpperCase()}` : ""}
                            </Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => loadModels(config.activeProvider || "gemini")}
                                disabled={isFetchingModels || !config.activeProvider}
                                className="h-7 text-[11px] font-black uppercase tracking-wider px-3"
                                aria-label="Refresh available models from provider"
                            >
                                <RefreshCw className={cn("size-3 mr-1.5", isFetchingModels && "animate-spin")} />
                                Refresh models
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 min-w-0">
                                {!isCustomModel ? (
                                    <div className="relative">
                                        <select
                                            value={config.activeModel || ""}
                                            onChange={(e) => {
                                                if (e.target.value === "__custom__") {
                                                    setIsCustomModel(true);
                                                } else {
                                                    setConfig(prev => ({ ...prev, activeModel: e.target.value }));
                                                    handleSaveModel(e.target.value);
                                                }
                                            }}
                                            disabled={isFetchingModels}
                                            className="flex h-10 w-full bauhaus-square bauhaus-border bg-background px-3 py-2 pr-8 text-sm font-bold uppercase tracking-wide text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none disabled:opacity-50"
                                        >
                                            {isFetchingModels ? (
                                                <option value="">Loading models…</option>
                                            ) : availableModels.length === 0 ? (
                                                <option value="">— No models found. Add your API key below. —</option>
                                            ) : (
                                                availableModels.map((modelName) => (
                                                    <option key={modelName} value={modelName}>
                                                        {modelName}
                                                    </option>
                                                ))
                                            )}
                                            <option value="__custom__">+ Type a custom model ID…</option>
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input
                                            value={customModelInput}
                                            onChange={(e) => setCustomModelInput(e.target.value)}
                                            placeholder="e.g. deepseek-ai/DeepSeek-V3"
                                            className="bauhaus-square bauhaus-border bg-background h-10 flex-1"
                                            autoFocus
                                        />
                                        <Button
                                            onClick={() => {
                                                setIsCustomModel(false);
                                                handleSaveModel(customModelInput);
                                            }}
                                            variant="outline"
                                            className="bauhaus-square bauhaus-border h-10 text-xs font-black uppercase tracking-wider shrink-0"
                                        >
                                            Use this model
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Test connection */}
                            <div className="flex items-center gap-2.5 shrink-0">
                                <Button
                                    onClick={handleTestConnection}
                                    disabled={isTesting || !config.activeProvider}
                                    className="bauhaus-square bauhaus-border bg-foreground text-background hover:bg-bauhaus-yellow hover:text-black h-10 px-5 font-black uppercase tracking-wider text-xs whitespace-nowrap"
                                >
                                    {isTesting ? (
                                        <><Loader2 className="size-3.5 animate-spin mr-1.5" />Testing…</>
                                    ) : (
                                        "Test connection"
                                    )}
                                </Button>

                                {testStatus && (
                                    <div
                                        className={cn(
                                            "flex items-center gap-1 text-xs font-black uppercase tracking-wider whitespace-nowrap",
                                            testStatus.success ? "text-success" : "text-destructive"
                                        )}
                                        title={testStatus.message}
                                    >
                                        {testStatus.success
                                            ? <CheckCircle2 className="size-4 shrink-0" />
                                            : <XCircle className="size-4 shrink-0" />}
                                        {testStatus.success ? "Connected" : "Failed"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── GOOGLE GEMINI ─────────────────────────────────── */}
            <ProviderKeyCard
                title="Google Gemini"
                icon="logos:google-gemini"
                headerColor="bg-bauhaus-yellow text-black"
                hasKey={Boolean(config.hasGeminiKey)}
                maskedKey={config.geminiApiKey}
                form={geminiForm}
                setForm={setGeminiForm}
                keyPlaceholder="AIzaSy…"
                helpText={
                    <>
                        Get a free key at{" "}
                        <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                            aistudio.google.com
                        </a>
                        .
                    </>
                }
                onSave={() =>
                    handleSaveKey("gemini", geminiForm.apiKey, undefined, setGeminiForm)
                }
                onDelete={() => handleDeleteKey("gemini", setGeminiForm)}
                saveLabel="Save & use Gemini"
            />

            {/* ── OPENAI & COMPATIBLE ───────────────────────────── */}
            <Card className="bauhaus-square bauhaus-border bauhaus-shadow bg-card">
                <CardHeader className="border-b bauhaus-border bg-bauhaus-blue pb-4 text-white">
                    <CardTitle className="text-base font-bold uppercase tracking-wider flex items-center gap-2">
                        <Icon icon="logos:openai-icon" className="size-5 brightness-200" />
                        <span>OpenAI & Compatible</span>
                        {config.hasOpenAiKey && (
                            <span className="ml-auto flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest opacity-80">
                                <ShieldCheck className="size-3.5" /> Key encrypted
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-5 sm:p-7 flex flex-col gap-6">
                    {/* Quick presets — always visible so user can set base URL */}
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                            Base URL preset
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: "OpenAI Official", url: "https://api.openai.com/v1", icon: "logos:openai-icon" },
                                { label: "Groq Cloud", url: "https://api.groq.com/openai/v1", icon: "simple-icons:groq" },
                                { label: "OpenRouter", url: "https://openrouter.ai/api/v1", icon: "simple-icons:openrouter" },
                                { label: "Ollama Local", url: "http://localhost:11434/v1", icon: "simple-icons:ollama" },
                            ].map((preset) => (
                                <Button
                                    key={preset.label}
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpenaiForm(p => ({ ...p, baseUrl: preset.url }))}
                                    className="bauhaus-square bauhaus-border h-9 text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                                >
                                    <Icon icon={preset.icon} className="size-3.5" />
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="openai-baseurl" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Globe className="size-3.5" /> Base URL
                        </Label>
                        <Input
                            id="openai-baseurl"
                            value={openaiForm.baseUrl}
                            onChange={(e) => setOpenaiForm(p => ({ ...p, baseUrl: e.target.value }))}
                            placeholder="https://api.openai.com/v1"
                            disabled={Boolean(config.hasOpenAiKey)}
                            className="bauhaus-square bauhaus-border bg-background h-10 disabled:opacity-50"
                        />
                    </div>

                    {config.hasOpenAiKey ? (
                        <KeyLockedState
                            maskedKey={config.openaiApiKey}
                            isDeleting={openaiForm.isDeleting}
                            onDelete={() => handleDeleteKey("openai", setOpenaiForm)}
                        />
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="openai-key" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Key className="size-3.5" /> API Key
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="openai-key"
                                        type={openaiForm.showKey ? "text" : "password"}
                                        value={openaiForm.apiKey}
                                        onChange={(e) => setOpenaiForm(p => ({ ...p, apiKey: e.target.value }))}
                                        placeholder="sk-…"
                                        className="bauhaus-square bauhaus-border bg-background h-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setOpenaiForm(p => ({ ...p, showKey: !p.showKey }))}
                                        aria-label={openaiForm.showKey ? "Hide API key" : "Show API key"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {openaiForm.showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleSaveKey("openai", openaiForm.apiKey, openaiForm.baseUrl, setOpenaiForm)}
                                disabled={openaiForm.isSaving}
                                className="bauhaus-square bauhaus-border bg-foreground text-background hover:bg-bauhaus-blue hover:text-white self-start px-8 font-black uppercase tracking-wider text-sm h-10"
                            >
                                {openaiForm.isSaving ? (
                                    <><Loader2 className="size-3.5 animate-spin mr-1.5" />Saving…</>
                                ) : "Save & use OpenAI"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── ANTHROPIC ─────────────────────────────────────── */}
            <Card className="bauhaus-square bauhaus-border bauhaus-shadow bg-card">
                <CardHeader className="border-b bauhaus-border bg-bauhaus-red pb-4 text-white">
                    <CardTitle className="text-base font-bold uppercase tracking-wider flex items-center gap-2">
                        <Icon icon="logos:anthropic-icon" className="size-5 brightness-200" />
                        <span>Anthropic</span>
                        {config.hasAnthropicKey && (
                            <span className="ml-auto flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest opacity-80">
                                <ShieldCheck className="size-3.5" /> Key encrypted
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-5 sm:p-7 flex flex-col gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="anthropic-baseurl" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Globe className="size-3.5" /> Base URL
                        </Label>
                        <Input
                            id="anthropic-baseurl"
                            value={anthropicForm.baseUrl}
                            onChange={(e) => setAnthropicForm(p => ({ ...p, baseUrl: e.target.value }))}
                            placeholder="https://api.anthropic.com"
                            disabled={Boolean(config.hasAnthropicKey)}
                            className="bauhaus-square bauhaus-border bg-background h-10 disabled:opacity-50"
                        />
                    </div>

                    {config.hasAnthropicKey ? (
                        <KeyLockedState
                            maskedKey={config.anthropicApiKey}
                            isDeleting={anthropicForm.isDeleting}
                            onDelete={() => handleDeleteKey("anthropic", setAnthropicForm)}
                        />
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="anthropic-key" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Key className="size-3.5" /> API Key
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="anthropic-key"
                                        type={anthropicForm.showKey ? "text" : "password"}
                                        value={anthropicForm.apiKey}
                                        onChange={(e) => setAnthropicForm(p => ({ ...p, apiKey: e.target.value }))}
                                        placeholder="sk-ant-…"
                                        className="bauhaus-square bauhaus-border bg-background h-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setAnthropicForm(p => ({ ...p, showKey: !p.showKey }))}
                                        aria-label={anthropicForm.showKey ? "Hide API key" : "Show API key"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {anthropicForm.showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleSaveKey("anthropic", anthropicForm.apiKey, anthropicForm.baseUrl, setAnthropicForm)}
                                disabled={anthropicForm.isSaving}
                                className="bauhaus-square bauhaus-border bg-foreground text-background hover:bg-bauhaus-red hover:text-white self-start px-8 font-black uppercase tracking-wider text-sm h-10"
                            >
                                {anthropicForm.isSaving ? (
                                    <><Loader2 className="size-3.5 animate-spin mr-1.5" />Saving…</>
                                ) : "Save & use Anthropic"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface ProviderKeyCardProps {
    title: string;
    icon: string;
    headerColor: string;
    hasKey: boolean;
    maskedKey: string;
    form: ProviderFormState;
    setForm: React.Dispatch<React.SetStateAction<ProviderFormState>>;
    keyPlaceholder: string;
    helpText?: React.ReactNode;
    onSave: () => void;
    onDelete: () => void;
    saveLabel: string;
}

function ProviderKeyCard({
    title, icon, headerColor, hasKey, maskedKey,
    form, setForm, keyPlaceholder, helpText,
    onSave, onDelete, saveLabel,
}: ProviderKeyCardProps) {
    return (
        <Card className="bauhaus-square bauhaus-border bauhaus-shadow bg-card">
            <CardHeader className={cn("border-b bauhaus-border pb-4", headerColor)}>
                <CardTitle className="text-base font-bold uppercase tracking-wider flex items-center gap-2">
                    <Icon icon={icon} className="size-5" />
                    <span>{title}</span>
                    {hasKey && (
                        <span className="ml-auto flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest opacity-80">
                            <ShieldCheck className="size-3.5" /> Key encrypted
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-7 flex flex-col gap-6">
                {hasKey ? (
                    <KeyLockedState
                        maskedKey={maskedKey}
                        isDeleting={form.isDeleting}
                        onDelete={onDelete}
                    />
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Key className="size-3.5" /> API Key
                            </Label>
                            <div className="relative">
                                <Input
                                    type={form.showKey ? "text" : "password"}
                                    value={form.apiKey}
                                    onChange={(e) => setForm(p => ({ ...p, apiKey: e.target.value }))}
                                    placeholder={keyPlaceholder}
                                    className="bauhaus-square bauhaus-border bg-background h-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, showKey: !p.showKey }))}
                                    aria-label={form.showKey ? "Hide API key" : "Show API key"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {form.showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            {helpText && (
                                <p className="text-xs text-muted-foreground font-mono">{helpText}</p>
                            )}
                        </div>
                        <Button
                            onClick={onSave}
                            disabled={form.isSaving}
                            className="bauhaus-square bauhaus-border bg-foreground text-background hover:bg-bauhaus-yellow hover:text-black self-start px-8 font-black uppercase tracking-wider text-sm h-10"
                        >
                            {form.isSaving ? (
                                <><Loader2 className="size-3.5 animate-spin mr-1.5" />Saving…</>
                            ) : saveLabel}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface KeyLockedStateProps {
    maskedKey: string;
    isDeleting: boolean;
    onDelete: () => void;
}

function KeyLockedState({ maskedKey, isDeleting, onDelete }: KeyLockedStateProps) {
    const [confirmDelete, setConfirmDelete] = React.useState(false);

    return (
        <div className="flex flex-col gap-4">
            {/* Locked display */}
            <div className="flex items-center gap-3 p-4 bg-success/10 border-2 border-success bauhaus-square">
                <Lock className="size-4 text-success shrink-0" />
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-xs font-black uppercase tracking-wider text-success">
                        API key stored & encrypted
                    </span>
                    <span className="text-xs font-mono text-muted-foreground truncate">
                        {maskedKey || "••••••••••••••••"}
                    </span>
                </div>
            </div>

            {/* Delete section */}
            {!confirmDelete ? (
                <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-destructive hover:text-destructive/80 transition-colors self-start"
                >
                    <Trash2 className="size-3.5" />
                    Remove key to add a new one
                </button>
            ) : (
                <div className="flex flex-col gap-3 p-4 border-2 border-destructive bg-destructive/5 bauhaus-square">
                    <p className="text-xs font-mono text-destructive">
                        This will permanently remove the stored key. You'll need to enter a new one to use this provider.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => { onDelete(); setConfirmDelete(false); }}
                            disabled={isDeleting}
                            className="bauhaus-square bauhaus-border bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-5 font-black uppercase tracking-wider text-xs"
                        >
                            {isDeleting ? (
                                <><Loader2 className="size-3.5 animate-spin mr-1.5" />Removing…</>
                            ) : (
                                <><Trash2 className="size-3.5 mr-1.5" />Delete key</>
                            )}
                        </Button>
                        <Button
                            onClick={() => setConfirmDelete(false)}
                            variant="outline"
                            className="bauhaus-square bauhaus-border h-9 px-4 font-black uppercase tracking-wider text-xs"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
