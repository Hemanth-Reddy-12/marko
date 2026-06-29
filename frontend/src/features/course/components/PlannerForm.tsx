import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { FieldGroup, Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { fetchApi } from "@/lib/api";
import { Sparkles, AlertCircle } from "lucide-react";

interface PlannerFormProps {
    isOpen: boolean;
    onClose: () => void;
    onCourseCreated: (course: any) => void;
}

export function PlannerForm({ isOpen, onClose, onCourseCreated }: PlannerFormProps) {
    const [goal, setGoal] = React.useState("");
    const [durationDays, setDurationDays] = React.useState(5);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

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
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-white border border-zinc-200 shadow-lg rounded-xl">
                <DialogHeader className="flex flex-col gap-1.5 p-1">
                    <DialogTitle className="text-zinc-900 font-bold flex items-center gap-1.5 text-lg">
                        <Sparkles className="size-4.5 text-zinc-900 fill-zinc-900/10" />
                        <span>Create Custom Course</span>
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 font-normal text-xs leading-relaxed">
                        Specify what you want to learn and the duration. Our AI Planner will draft your personalized curriculum dynamically.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
                    {error && !hasGoalError && (
                        <div className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-center gap-1.5">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{displayError}</span>
                        </div>
                    )}

                    <FieldGroup>
                        <Field data-invalid={hasGoalError || undefined}>
                            <FieldLabel htmlFor="goal" className="text-xs font-semibold text-zinc-700">
                                Learning Goal
                            </FieldLabel>
                            <Textarea
                                id="goal"
                                placeholder="e.g., Master Docker, Kubernetes container orchestration, and Helm charts for cloud-native apps."
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                disabled={loading}
                                required
                                aria-invalid={hasGoalError || undefined}
                                className="bg-zinc-50/50 border-zinc-200/80 focus-visible:ring-zinc-900 focus-visible:border-zinc-900 text-xs font-normal"
                            />
                            <FieldDescription>
                                What topic or skill do you want to learn?
                            </FieldDescription>
                            {hasGoalError && (
                                <FieldError>{displayError}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="duration" className="text-xs font-semibold text-zinc-700">
                                Duration (Days)
                            </FieldLabel>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="duration"
                                    type="number"
                                    value={durationDays}
                                    onChange={(e) => setDurationDays(Number(e.target.value))}
                                    disabled={loading}
                                    required
                                    className="w-24 bg-zinc-50/50 border-zinc-200/80 focus-visible:ring-zinc-900 focus-visible:border-zinc-900 text-xs font-semibold"
                                />
                            </div>
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="text-xs font-semibold text-zinc-600 border-zinc-200 bg-white hover:bg-zinc-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center"
                        >
                            {loading ? (
                                <>
                                    <Spinner data-icon="inline-start" className="text-white animate-spin" />
                                    Generating Curriculum...
                                </>
                            ) : (
                                <>
                                    <Sparkles data-icon="inline-start" />
                                    Generate Course
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
