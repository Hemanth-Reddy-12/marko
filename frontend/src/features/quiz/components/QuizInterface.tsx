import * as React from "react";
import { fetchQuiz, pollQuiz, submitQuizAttempt } from "../api/quiz.api";
import type { Quiz, QuizAttemptResult } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface QuizInterfaceProps {
    courseId: string;
    lessonId: string;
    onContinue?: () => void;
    onProgressChange?: (answeredCount: number, totalCount: number) => void;
}

const cardVariants = {
    initial: { opacity: 0, y: 16 },
    animate: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 },
    }),
};

export function QuizInterface({ courseId, lessonId, onContinue, onProgressChange }: QuizInterfaceProps) {
    const [quiz, setQuiz] = React.useState<Quiz | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [statusText, setStatusText] = React.useState("Loading quiz...");
    const [error, setError] = React.useState<string | null>(null);

    const [answers, setAnswers] = React.useState<Record<string, number>>({});
    const [submitting, setSubmitting] = React.useState(false);
    const [result, setResult] = React.useState<QuizAttemptResult | null>(null);

    const loadQuiz = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        setAnswers({});
        try {
            const data = await fetchQuiz(courseId, lessonId);
            if (data.status === "GENERATING") {
                setStatusText("Generating your personalised quiz…");
                const polled = await pollQuiz(courseId, lessonId, () =>
                    setStatusText("Still generating… almost there")
                );
                setQuiz(polled);
            } else {
                setQuiz(data);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load quiz");
        } finally {
            setLoading(false);
        }
    }, [courseId, lessonId]);

    React.useEffect(() => { loadQuiz(); }, [loadQuiz]);

    React.useEffect(() => {
        if (!onProgressChange) return;
        if (quiz) {
            onProgressChange(Object.keys(answers).length, quiz.questions.length);
        } else {
            onProgressChange(0, 0);
        }
    }, [answers, quiz, onProgressChange]);

    const handleSelect = (uniqueQId: string, index: number) => {
        if (result) return;
        setAnswers((prev) => ({ ...prev, [uniqueQId]: index }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;
        if (Object.keys(answers).length !== quiz.questions.length) {
            // Use toast instead of alert in a real scenario
            return;
        }
        const answerArray = quiz.questions.map((q, qIndex) => answers[`${q.id}-${qIndex}`]);
        setSubmitting(true);
        try {
            const res = await submitQuizAttempt(courseId, lessonId, { answers: answerArray });
            setResult(res);
        } catch (err: any) {
            setError(err.message || "Failed to submit quiz attempt");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="size-4 rounded-full border-2 border-border border-t-accent animate-spin" />
                    <span className="animate-pulse">{statusText}</span>
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-6">
                        <Skeleton className="h-5 w-3/4 rounded mb-5" />
                        <div className="flex flex-col gap-3">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <Skeleton key={j} className="h-12 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center max-w-md mx-auto">
                <div className="size-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="size-6 text-destructive" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-foreground">Failed to load quiz</h3>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
                <Button onClick={loadQuiz} variant="outline" className="mt-2 gap-2">
                    <RotateCcw className="size-4" />
                    Try again
                </Button>
            </div>
        );
    }

    if (!quiz || !quiz.questions.length) {
        return <div className="p-6 text-center text-muted-foreground text-sm">No questions available.</div>;
    }

    const questionsToDisplay = result?.quiz.questions || quiz.questions;
    const isCompleted = !!result;
    const allAnswered = Object.keys(answers).length === quiz.questions.length;
    const scorePercent = result ? Math.round(result.attempt.score * 100) : 0;

    return (
        <div className="max-w-3xl mx-auto w-full pb-16">
            <motion.h2
                className="text-xl font-bold text-foreground mb-6"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                Lesson Knowledge Check
            </motion.h2>

            <div className="flex flex-col gap-5">
                {questionsToDisplay.map((q, qIndex) => {
                    const uniqueQId = `${q.id}-${qIndex}`;
                    const selectedIdx = answers[uniqueQId];
                    const correctIdx = q.correctAnswerIndex;
                    const isCorrect = selectedIdx === correctIdx;

                    return (
                        <motion.div
                            key={uniqueQId}
                            custom={qIndex}
                            variants={cardVariants}
                            initial="initial"
                            animate="animate"
                            className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm"
                        >
                            <h3 className="text-sm font-semibold text-foreground mb-4 leading-relaxed">
                                <span className="inline-flex items-center justify-center size-6 rounded-lg bg-accent/10 text-accent text-xs font-bold mr-2 shrink-0">
                                    {qIndex + 1}
                                </span>
                                {q.text}
                            </h3>

                            <RadioGroup
                                name={uniqueQId}
                                value={selectedIdx !== undefined ? selectedIdx.toString() : ""}
                                onValueChange={(val) => handleSelect(uniqueQId, parseInt(val))}
                                className="flex flex-col gap-2.5"
                                disabled={isCompleted}
                            >
                                {q.options.map((opt, optIdx) => {
                                    let itemStateClass = "";
                                    let icon = null;

                                    if (isCompleted) {
                                        if (optIdx === correctIdx) {
                                            itemStateClass = "bg-emerald-50 border-emerald-300 text-emerald-900";
                                            icon = <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />;
                                        } else if (optIdx === selectedIdx && optIdx !== correctIdx) {
                                            itemStateClass = "bg-red-50 border-red-300 text-red-900";
                                            icon = <XCircle className="size-4 text-red-500 shrink-0" />;
                                        } else {
                                            itemStateClass = "opacity-40";
                                        }
                                    }

                                    const isSelected = selectedIdx === optIdx && !isCompleted;

                                    return (
                                        <Label
                                            key={optIdx}
                                            className={cn(
                                                "group flex items-center gap-3 border rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none",
                                                !isCompleted && "hover:bg-accent/5 border-border hover:border-accent/40 hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0",
                                                isSelected && "border-accent bg-accent/5 ring-1 ring-accent shadow-sm",
                                                isCompleted && "cursor-default",
                                                itemStateClass
                                            )}
                                        >
                                            <RadioGroupItem
                                                value={optIdx.toString()}
                                                id={`${uniqueQId}-${optIdx}`}
                                                className="sr-only"
                                            />

                                            {/* Custom radio indicator */}
                                            {!isCompleted && (
                                                <div className={cn(
                                                    "size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                                                    isSelected
                                                        ? "border-accent bg-accent"
                                                        : "border-border group-hover:border-accent/60"
                                                )}>
                                                    {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                                                </div>
                                            )}

                                            <div className="flex-1 text-sm leading-relaxed">{opt}</div>
                                            {icon}
                                        </Label>
                                    );
                                })}
                            </RadioGroup>

                            {/* Rationale */}
                            <AnimatePresence>
                                {isCompleted && q.rationale && (
                                    <motion.div
                                        className={cn(
                                            "mt-4 p-3.5 rounded-xl text-sm border",
                                            isCorrect
                                                ? "bg-emerald-50 border-emerald-100 text-emerald-900"
                                                : "bg-red-50 border-red-100 text-red-900"
                                        )}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25, delay: 0.1 }}
                                    >
                                        <span className="font-semibold">{isCorrect ? "Correct: " : "Incorrect: "}</span>
                                        {q.rationale}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Submit / Result section */}
            <div className="mt-8">
                <AnimatePresence mode="wait">
                    {!isCompleted ? (
                        <motion.div
                            key="submit"
                            className="flex flex-col items-center gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {!allAnswered && (
                                <p className="text-xs text-muted-foreground">
                                    Answer all {quiz.questions.length} questions to submit.
                                </p>
                            )}
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting || !allAnswered}
                                className="min-w-[200px] bg-accent hover:bg-accent/90 text-white shadow-sm"
                                size="lg"
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        Submitting…
                                    </span>
                                ) : "Submit Answers"}
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
                            initial={{ opacity: 0, y: 16, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className={cn(
                                "px-6 py-5 border-b border-border flex items-center justify-between",
                                result.attempt.passed ? "bg-emerald-50" : "bg-red-50"
                            )}>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Quiz Result</p>
                                    <h3 className="text-lg font-bold text-foreground">
                                        {result.attempt.passed ? "You passed! 🎉" : "Not quite — try again"}
                                    </h3>
                                </div>
                                <div className={cn(
                                    "size-16 rounded-2xl flex flex-col items-center justify-center border-2 shrink-0",
                                    result.attempt.passed
                                        ? "border-emerald-300 bg-emerald-100"
                                        : "border-red-300 bg-red-100"
                                )}>
                                    <Trophy className={cn(
                                        "size-5 mb-0.5",
                                        result.attempt.passed ? "text-emerald-600" : "text-red-400"
                                    )} />
                                    <span className={cn(
                                        "text-sm font-black",
                                        result.attempt.passed ? "text-emerald-700" : "text-red-600"
                                    )}>
                                        {scorePercent}%
                                    </span>
                                </div>
                            </div>

                            {/* Animated score bar */}
                            <div className="px-6 py-4">
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <motion.div
                                        className={cn("h-full rounded-full", result.attempt.passed ? "bg-emerald-500" : "bg-red-400")}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${scorePercent}%` }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                                    />
                                </div>
                                <p className={cn(
                                    "text-sm font-medium mt-2",
                                    result.attempt.passed ? "text-emerald-700" : "text-red-600"
                                )}>
                                    {result.attempt.passed
                                        ? "Excellent work! Ready for the next lesson."
                                        : "Review the explanations above and try again."}
                                </p>
                            </div>

                            <div className="px-6 pb-6">
                                {result.attempt.passed ? (
                                    <Button
                                        onClick={onContinue}
                                        className="w-full bg-accent hover:bg-accent/90 text-white shadow-sm gap-2"
                                        size="lg"
                                    >
                                        Continue to Next Topic
                                        <ArrowRight className="size-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={loadQuiz}
                                        className="w-full gap-2"
                                        size="lg"
                                        variant="outline"
                                    >
                                        <RotateCcw className="size-4" />
                                        Retry Quiz
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
