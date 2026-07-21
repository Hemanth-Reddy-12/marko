import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { FieldGroup, Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { fetchApi } from "@/lib/api";
import { AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface PlannerFormProps {
    isOpen: boolean;
    onClose: () => void;
    onCourseCreated: (course: any) => void;
}

interface AiConfig {
    activeProvider: string;
    activeModel: string;
    hasConfiguredKey?: boolean;
}

export function getProviderIcon(provider?: string): string {
    if (provider === "openai") return "logos:openai-icon";
    if (provider === "anthropic") return "logos:anthropic-icon";
    if (provider === "mock") return "ph:cpu-bold";
    return "logos:google-gemini";
}

export function getProviderName(provider?: string): string {
    if (provider === "openai") return "OpenAI";
    if (provider === "anthropic") return "Anthropic";
    if (provider === "mock") return "Mock Engine";
    return "Google Gemini";
}

export function PlannerForm({ isOpen, onClose, onCourseCreated }: PlannerFormProps) {
    const [goal, setGoal] = React.useState("");
    const [durationDays, setDurationDays] = React.useState(5);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [aiConfig, setAiConfig] = React.useState<AiConfig | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            fetchApi<AiConfig>("/api/ai/config")
                .then((cfg) => setAiConfig(cfg))
                .catch(() => setAiConfig(null));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goal.trim()) {
            setError("goal: Please enter a learning goal.");
            return;
        }
        if (goal.length < 5) {
            setError("goal: Goal must be at least 5 characters.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const course = await fetchApi<any>("/api/courses", {
                method: "POST",
                body: JSON.stringify({
                    goal,
                    durationDays: Number(durationDays),
                }),
            });
            onCourseCreated(course);
            setGoal("");
            setDurationDays(5);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to create course. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const hasGoalError = error?.startsWith("goal:");
    const displayError = hasGoalError ? error?.substring(5) : error;

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl bg-card bauhaus-border rounded-none p-0 overflow-hidden gap-0">
                <div className="bg-bauhaus-red/10 border-b-2 border-foreground p-6 sm:p-8 flex flex-col gap-2">
                    <DialogTitle className="font-heading font-bold uppercase tracking-tight text-foreground flex items-center gap-3 text-2xl">
                        <div className="size-4 bg-bauhaus-red bauhaus-square shrink-0"></div>
                        <span>Create Course</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium text-sm">
                        Define your learning objective and timeline.
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col p-6 sm:p-8 gap-8">
                    {/* Active Model Indicator */}
                    {aiConfig && aiConfig.hasConfiguredKey && (
                        <div className="flex items-center justify-between text-xs font-mono text-foreground bg-muted/40 p-3.5 bauhaus-square bauhaus-border border-border">
                            <div className="flex items-center gap-2">
                                <Icon icon={getProviderIcon(aiConfig.activeProvider)} className="size-4 shrink-0" />
                                <span className="font-bold uppercase tracking-wide">
                                    AI Engine: {getProviderName(aiConfig.activeProvider)}
                                </span>
                            </div>
                            <span className="font-bold tracking-wide text-muted-foreground border-l border-border pl-3">
                                {aiConfig.activeModel}
                            </span>
                        </div>
                    )}

                    {aiConfig && !aiConfig.hasConfiguredKey && (
                        <div className="text-xs font-bold uppercase tracking-widest text-bauhaus-red bg-bauhaus-red/5 p-5 flex flex-col gap-3 border-2 border-bauhaus-red rounded-none shadow-[3px_3px_0px_0px_var(--color-bauhaus-red)]">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="size-4 shrink-0 text-bauhaus-red" />
                                <span>No AI API Key Configured</span>
                            </div>
                            <p className="text-[10px] font-mono text-muted-foreground normal-case font-normal leading-relaxed">
                                You must add an API key and configure your active model in settings before you can plan or generate a course.
                            </p>
                            <Button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    window.location.href = "/settings";
                                }}
                                className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-widest text-xs h-11 rounded-none border-2 border-foreground shadow-[3px_3px_0px_0px_var(--color-bauhaus-red)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                            >
                                Configure API Key
                            </Button>
                        </div>
                    )}

                    {error && !hasGoalError && (
                        <div className="text-xs font-bold uppercase tracking-widest text-bauhaus-red bg-bauhaus-red/10 p-3 flex items-center gap-2 bauhaus-border">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{displayError}</span>
                        </div>
                    )}

                    <FieldGroup className="gap-6">
                        <Field data-invalid={hasGoalError || undefined}>
                            <FieldLabel htmlFor="goal" className="text-xs font-bold text-foreground uppercase tracking-widest">
                                Learning Goal
                            </FieldLabel>
                            <Textarea
                                id="goal"
                                placeholder="E.g., Master Docker, Kubernetes and Microservices..."
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                disabled={loading}
                                required
                                aria-invalid={hasGoalError || undefined}
                                className={cn(
                                    "bg-background bauhaus-border rounded-none focus-visible:ring-0 focus-visible:border-foreground text-base font-medium p-4 resize-none h-32",
                                    hasGoalError && "border-bauhaus-red bg-bauhaus-red/5"
                                )}
                            />
                            <FieldDescription className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mt-2">
                                Be specific about the skills you want to acquire.
                            </FieldDescription>
                            {hasGoalError && (
                                <FieldError className="text-bauhaus-red font-bold uppercase text-[10px] tracking-widest mt-1">{displayError}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="duration" className="text-xs font-bold text-foreground uppercase tracking-widest">
                                Duration (Days)
                            </FieldLabel>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="duration"
                                    type="number"
                                    min={1}
                                    max={90}
                                    value={durationDays}
                                    onChange={(e) => setDurationDays(Number(e.target.value))}
                                    disabled={loading}
                                    required
                                    className="w-24 bg-background bauhaus-border rounded-none focus-visible:ring-0 focus-visible:border-foreground text-base font-bold text-center h-12"
                                />
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Days</span>
                            </div>
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="pt-4 flex flex-row gap-4 justify-end items-center border-t-2 border-foreground/10">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            disabled={loading || !aiConfig?.hasConfiguredKey}
                            className="rounded-none bg-bauhaus-red text-white hover:bg-bauhaus-red/90 font-bold uppercase tracking-widest text-xs px-8 h-12 bauhaus-border hover:bauhaus-shadow hover:-translate-y-1 hover:translate-x-1 transition-all flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Icon
                                        icon={getProviderIcon(aiConfig?.activeProvider)}
                                        className="size-4 animate-spin text-white"
                                    />
                                    <span>Planning with {aiConfig?.activeModel || "AI"}...</span>
                                </>
                            ) : (
                                <>
                                    <span>Generate</span>
                                    <ArrowRight className="size-4" />
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
