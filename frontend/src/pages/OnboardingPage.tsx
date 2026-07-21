import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MarkoLogo } from "@/components/ui/logo";
import { Spinner } from "@/components/ui/spinner";
import { Sparkles, Key, Globe, Cpu, AlertCircle, CheckCircle2 } from "lucide-react";

type ProviderType = "openai" | "anthropic" | "gemini";

export function OnboardingPage() {
    const navigate = useNavigate();
    const [selectedProvider, setSelectedProvider] = useState<ProviderType>("gemini");
    
    // Form states
    const [apiKey, setApiKey] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [model, setModel] = useState("gemini-1.5-pro");
    
    // Status states
    const [isValidating, setIsValidating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error">("idle");
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    const handleProviderChange = (provider: ProviderType) => {
        setSelectedProvider(provider);
        setValidationStatus("idle");
        setApiKey("");
        setAvailableModels([]);
        
        // Set default models and base URLs
        if (provider === "gemini") {
            setBaseUrl("");
            setModel("gemini-1.5-pro");
        } else if (provider === "openai") {
            setBaseUrl("https://api.openai.com/v1");
            setModel("gpt-4o");
        } else if (provider === "anthropic") {
            setBaseUrl("https://api.anthropic.com");
            setModel("claude-3-5-sonnet-20240620");
        }
    };

    const handleValidateKey = async () => {
        if (!apiKey.trim()) {
            toast.error("Please enter an API Key first.");
            return;
        }

        setIsValidating(true);
        setValidationStatus("idle");
        try {
            let query = `/api/ai/models?provider=${selectedProvider}&apiKey=${encodeURIComponent(apiKey.trim())}`;
            if (baseUrl.trim()) {
                query += `&baseURL=${encodeURIComponent(baseUrl.trim())}`;
            }

            const data = await fetchApi<{ models: string[] }>(query);
            if (data.models && data.models.length > 0) {
                setAvailableModels(data.models);
                setValidationStatus("success");
                toast.success("Connection verified successfully!");
                // If the selected model is not in the fetched list, default to the first available model
                if (!data.models.includes(model)) {
                    setModel(data.models[0]!);
                }
            } else {
                setValidationStatus("error");
                toast.error("Connected but no models were returned by the endpoint.");
            }
        } catch (e: any) {
            setValidationStatus("error");
            toast.error("Validation failed: " + (e.message || "Invalid API key or Base URL configuration."));
        } finally {
            setIsValidating(false);
        }
    };

    const handleSaveAndConnect = async () => {
        if (!apiKey.trim()) {
            toast.error("Please enter your API Key.");
            return;
        }
        if (!model.trim()) {
            toast.error("Please enter or select a Model Name.");
            return;
        }

        setIsSaving(true);
        try {
            const body: Record<string, any> = {
                activeProvider: selectedProvider,
                activeModel: model.trim(),
            };

            if (selectedProvider === "gemini") {
                body.geminiApiKey = apiKey.trim();
            } else if (selectedProvider === "openai") {
                body.openaiApiKey = apiKey.trim();
                body.openaiBaseUrl = baseUrl.trim() || null;
            } else if (selectedProvider === "anthropic") {
                body.anthropicApiKey = apiKey.trim();
                body.anthropicBaseUrl = baseUrl.trim() || null;
            }

            await fetchApi("/api/ai/config", {
                method: "PUT",
                body: JSON.stringify(body),
            });

            toast.success("AI Configuration saved! Unlocking platform...");
            
            // Wait briefly to allow state updates/redirection check to register
            setTimeout(() => {
                navigate("/dashboard");
            }, 800);
        } catch (e: any) {
            toast.error("Failed to save configuration: " + e.message);
            setIsSaving(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4 bg-bauhaus-yellow overflow-y-auto">
            {/* Bauhaus Decor elements */}
            <div className="absolute top-0 left-0 w-32 h-full bg-bauhaus-blue border-r-4 border-black hidden md:block" />
            <div className="absolute bottom-16 right-16 size-48 bg-bauhaus-red rounded-full border-4 border-black hidden lg:block" />

            <div className="w-full max-w-xl relative z-10 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 md:p-8 my-8">
                
                <div className="text-center flex flex-col items-center gap-4 w-full mb-6">
                    <div className="max-w-[200px] py-2 flex items-center justify-center">
                        <MarkoLogo className="w-full h-auto" />
                    </div>
                    <div className="flex items-center gap-2 bg-bauhaus-blue/10 border-2 border-bauhaus-blue px-3 py-1 text-xs font-bold text-bauhaus-blue uppercase tracking-wider">
                        <Sparkles className="size-3.5" />
                        Bring Your Own AI Key
                    </div>
                    <h2 className="font-heading font-black text-2xl md:text-3xl text-black uppercase tracking-tight mt-2">
                        Configure Your AI Engine
                    </h2>
                    <p className="text-xs font-bold text-black/60 uppercase tracking-widest leading-relaxed max-w-md">
                        To unlock Marko's autonomous learning features, connect your preferred LLM provider or custom endpoint API key.
                    </p>
                </div>

                {/* Provider Cards Selector */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {(["gemini", "openai", "anthropic"] as ProviderType[]).map((prov) => {
                        const isSelected = selectedProvider === prov;
                        const label = prov === "gemini" ? "Gemini" : prov === "openai" ? "OpenAI Comp." : "Anthropic Comp.";
                        
                        return (
                            <motion.button
                                key={prov}
                                type="button"
                                onClick={() => handleProviderChange(prov)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-4 border-4 border-black text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer font-bold uppercase tracking-wider text-xs ${
                                    isSelected 
                                        ? "bg-black text-white shadow-none" 
                                        : "bg-white text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                                }`}
                            >
                                <span className="font-black">{label}</span>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Dynamic Configuration Form */}
                <div className="flex flex-col gap-4 border-4 border-black p-4 bg-muted/20 mb-6">
                    {/* Base URL (only visible/editable for OpenAI/Anthropic Compatible) */}
                    {selectedProvider !== "gemini" && (
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="baseUrl" className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                <Globe className="size-3.5 text-bauhaus-blue" />
                                Custom Base URL (Endpoint)
                            </Label>
                            <Input
                                id="baseUrl"
                                type="text"
                                placeholder={selectedProvider === "openai" ? "https://api.openai.com/v1" : "https://api.anthropic.com"}
                                value={baseUrl}
                                onChange={(e) => {
                                    setBaseUrl(e.target.value);
                                    setValidationStatus("idle");
                                }}
                                className="border-2 border-black font-mono text-xs rounded-none h-10 focus-visible:ring-0 focus-visible:border-black bg-white"
                            />
                            <p className="text-[10px] text-muted-foreground font-mono">
                                Customize this to use DeepSeek, OpenRouter, Groq, or local proxies.
                            </p>
                        </div>
                    )}

                    {/* API Key */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="apiKey" className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <Key className="size-3.5 text-bauhaus-red" />
                            API Key
                        </Label>
                        <Input
                            id="apiKey"
                            type="password"
                            placeholder={`Enter your ${selectedProvider} compatible API key`}
                            value={apiKey}
                            onChange={(e) => {
                                setApiKey(e.target.value);
                                setValidationStatus("idle");
                            }}
                            className="border-2 border-black font-mono text-xs rounded-none h-10 focus-visible:ring-0 focus-visible:border-black bg-white"
                        />
                    </div>

                    {/* Model Selector / Custom Model Input */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="model" className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <Cpu className="size-3.5" />
                            Model Name
                        </Label>
                        
                        {availableModels.length > 0 ? (
                            <select
                                id="model"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="border-2 border-black font-mono text-xs rounded-none h-10 px-2 bg-white focus-visible:ring-0"
                            >
                                {availableModels.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <Input
                                id="model"
                                type="text"
                                placeholder={
                                    selectedProvider === "gemini" 
                                        ? "gemini-1.5-pro" 
                                        : selectedProvider === "openai" 
                                        ? "gpt-4o" 
                                        : "claude-3-5-sonnet-20240620"
                                }
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="border-2 border-black font-mono text-xs rounded-none h-10 focus-visible:ring-0 focus-visible:border-black bg-white"
                            />
                        )}
                        <p className="text-[10px] text-muted-foreground font-mono">
                            Specify the model ID (e.g. <code>gpt-4o</code>, <code>deepseek-chat</code>, <code>claude-3-5-sonnet</code>).
                        </p>
                    </div>

                    {/* Validation Action */}
                    <div className="flex items-center justify-between gap-4 mt-2">
                        <Button
                            type="button"
                            onClick={handleValidateKey}
                            disabled={isValidating || !apiKey}
                            className="border-2 border-black bg-white hover:bg-muted text-black font-bold uppercase tracking-wider text-xs rounded-none h-9 px-4 flex items-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
                        >
                            {isValidating ? (
                                <>
                                    <Spinner className="size-3.5 text-black" />
                                    Verifying Connection...
                                </>
                            ) : (
                                "Test API Connection"
                            )}
                        </Button>

                        {/* Validation Feedback Status */}
                        {validationStatus === "success" && (
                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                                <CheckCircle2 className="size-4" />
                                Connected!
                            </div>
                        )}
                        {validationStatus === "error" && (
                            <div className="flex items-center gap-1.5 text-bauhaus-red font-bold text-xs uppercase tracking-wider">
                                <AlertCircle className="size-4" />
                                Connection Failed
                            </div>
                        )}
                    </div>
                </div>

                {/* Finalize Action */}
                <div className="w-full flex flex-col gap-3">
                    <Button
                        type="button"
                        onClick={handleSaveAndConnect}
                        disabled={isSaving || !apiKey || (validationStatus !== "success" && !isValidating)}
                        className="w-full border-4 border-black bg-black text-white hover:bg-black/90 font-black uppercase tracking-widest text-sm rounded-none h-12 shadow-[4px_4px_0px_var(--bauhaus-red)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSaving ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner className="size-4 text-white" />
                                Connecting to Marko...
                            </span>
                        ) : (
                            "Save & Unlock Platform"
                        )}
                    </Button>

                    {validationStatus !== "success" && (
                        <p className="text-[10px] font-bold text-black/50 text-center uppercase tracking-widest">
                            * Please test the API connection before unlocking.
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}
