import * as React from "react";
import { fetchQuiz, pollQuiz, submitQuizAttempt } from "../api/quiz.api";
import type { Quiz, QuizAttemptResult } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw, Key } from "lucide-react";
import { QuizMorphLoader } from "./QuizMorphLoader";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Celebration } from "@/components/ui/celebration";
import { useNavigate } from "react-router-dom";

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
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as any, delay: i * 0.06 },
    }),
};

export function QuizInterface({ courseId, lessonId, onContinue, onProgressChange }: QuizInterfaceProps) {
    const navigate = useNavigate();
    const [quiz, setQuiz] = React.useState<Quiz | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [statusText, setStatusText] = React.useState("Loading quiz...");
    const [error, setError] = React.useState<string | null>(null);

    const [answers, setAnswers] = React.useState<Record<string, number>>({});
    const [submitting, setSubmitting] = React.useState(false);
    const [result, setResult] = React.useState<QuizAttemptResult | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);

    const loadQuiz = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        setAnswers({});
        setCurrentQuestionIndex(0);
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

    const handleNext = () => {
        if (!quiz) return;
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (!quiz) return;
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!quiz) return;
        if (Object.keys(answers).length !== quiz.questions.length) {
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
            <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full">
                <QuizMorphLoader statusText={statusText} />
            </div>
        );
    }

    const isApiKeyError = error && (/api key/i.test(error) || /unauthorized|401|invalid/i.test(error));

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 py-20 px-6 text-center max-w-lg mx-auto">
                <div className="size-16 border-2 border-destructive bg-destructive/10 flex items-center justify-center bauhaus-square">
                    <AlertCircle className="size-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-heading font-black text-foreground uppercase tracking-tight">
                        {isApiKeyError ? "AI Provider API Key Error" : "Failed to Load Quiz"}
                    </h3>
                    <p className="text-sm font-mono text-muted-foreground mt-2 leading-relaxed">{error}</p>
                </div>
                {isApiKeyError ? (
                    <Button
                        onClick={() => navigate("/settings")}
                        className="mt-2 bauhaus-square bg-bauhaus-red text-white hover:bg-bauhaus-red/90 h-11 px-8 font-bold uppercase tracking-widest text-xs bauhaus-border shadow-[3px_3px_0px_0px_var(--foreground)] hover:shadow-none transition-all"
                    >
                        <Key className="size-4 mr-2" />
                        Configure API Key in Settings
                    </Button>
                ) : (
                    <Button
                        onClick={loadQuiz}
                        className="mt-2 bauhaus-square h-12 px-8 bg-foreground text-background font-bold uppercase tracking-widest text-xs"
                    >
                        <RotateCcw className="size-4 mr-2" />
                        Try Again
                    </Button>
                )}
            </div>
        );
    }

    if (!quiz || !quiz.questions.length) {
        return <div className="p-12 text-center text-muted-foreground text-sm font-mono uppercase tracking-widest">No questions available.</div>;
    }

    const isCompleted = !!result;
    const questionsToDisplay = isCompleted ? (result?.quiz.questions || quiz.questions) : [quiz.questions[currentQuestionIndex]];
    const allAnswered = Object.keys(answers).length === quiz.questions.length;
    const scorePercent = result ? Math.round(result.attempt.score * 100) : 0;
    
    const getActualIndex = (displayIndex: number) => isCompleted ? displayIndex : currentQuestionIndex;

    return (
        <div className="max-w-3xl mx-auto w-full pb-20">
            <motion.div
                className="flex items-end justify-between border-b border-border pb-4 mb-8"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h2 className="text-3xl font-heading font-semibold text-foreground tracking-tight">
                    {isCompleted ? "Quiz Result" : "Knowledge Check"}
                </h2>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">
                    {isCompleted ? `${quiz.questions.length} Questions` : `Question ${currentQuestionIndex + 1} of ${quiz.questions.length}`}
                </span>
            </motion.div>

            <div className="flex flex-col gap-8">
                {questionsToDisplay.map((q, qIndex) => {
                    const actualIdx = getActualIndex(qIndex);
                    const uniqueQId = `${q.id}-${actualIdx}`;
                    const selectedIdx = answers[uniqueQId];
                    const correctIdx = q.correctAnswerIndex;
                    const isCorrect = selectedIdx === correctIdx;

                    return (
                        <motion.div
                            key={uniqueQId}
                            custom={actualIdx}
                            variants={cardVariants}
                            initial="initial"
                            animate="animate"
                            className="bg-card border border-border rounded-none p-6 md:p-8 relative"
                        >
                            <div className="absolute top-0 left-0 bg-foreground text-background font-heading font-bold text-lg px-4 py-1">
                                {actualIdx + 1}
                            </div>
                            
                            <h3 className="text-lg font-medium text-foreground mt-8 mb-6 leading-relaxed">
                                {q.text}
                            </h3>

                            <RadioGroup
                                name={uniqueQId}
                                value={selectedIdx !== undefined ? selectedIdx.toString() : ""}
                                onValueChange={(val) => handleSelect(uniqueQId, parseInt(val))}
                                className="flex flex-col gap-3"
                                disabled={isCompleted}
                            >
                                {q.options.map((opt, optIdx) => {
                                    let itemStateClass = "";
                                    let icon = null;

                                    if (isCompleted) {
                                        if (optIdx === correctIdx) {
                                            itemStateClass = "bg-success/10 border-success text-success-foreground";
                                            icon = <CheckCircle2 className="size-4 text-success shrink-0" />;
                                        } else if (optIdx === selectedIdx && optIdx !== correctIdx) {
                                            itemStateClass = "bg-destructive/10 border-destructive text-destructive";
                                            icon = <XCircle className="size-4 text-destructive shrink-0" />;
                                        } else {
                                            itemStateClass = "opacity-50 bg-muted/30 border-border";
                                        }
                                    }

                                    const isSelected = selectedIdx === optIdx && !isCompleted;

                                    return (
                                        <Label
                                            key={optIdx}
                                            className={cn(
                                                "group flex items-center gap-4 border border-border rounded-none p-4 cursor-pointer transition-all duration-200 select-none",
                                                !isCompleted && "hover:bg-muted/50 hover:border-foreground",
                                                isSelected && "border-foreground bg-muted/20 ring-1 ring-foreground",
                                                isCompleted && "cursor-default",
                                                itemStateClass
                                            )}
                                        >
                                            <RadioGroupItem
                                                value={optIdx.toString()}
                                                id={`${uniqueQId}-${optIdx}`}
                                                className="sr-only"
                                            />

                                            {!isCompleted && (
                                                <div className={cn(
                                                    "size-5 border-2 rounded-none flex items-center justify-center shrink-0 transition-all duration-200",
                                                    isSelected
                                                        ? "border-foreground bg-foreground"
                                                        : "border-muted-foreground group-hover:border-foreground"
                                                )}>
                                                    {isSelected && <div className="size-2 bg-background rounded-none" />}
                                                </div>
                                            )}

                                            <div className="flex-1 text-base leading-relaxed">{opt}</div>
                                            {icon}
                                        </Label>
                                    );
                                })}
                            </RadioGroup>

                            <AnimatePresence>
                                {isCompleted && q.rationale && (
                                    <motion.div
                                        className={cn(
                                            "mt-6 p-5 rounded-none text-sm border",
                                            isCorrect
                                                ? "bg-success/5 border-success/30 text-foreground"
                                                : "bg-destructive/5 border-destructive/30 text-foreground"
                                        )}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <span className={cn(
                                            "font-bold uppercase tracking-widest text-[10px] mr-2",
                                            isCorrect ? "text-success" : "text-destructive"
                                        )}>
                                            {isCorrect ? "Correct" : "Incorrect"}
                                        </span>
                                        <span className="leading-relaxed">{q.rationale}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-12">
                <AnimatePresence mode="wait">
                    {!isCompleted ? (
                        <motion.div
                            key="submit"
                            className="flex flex-col gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="flex justify-between items-center gap-3">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    {answers[`${quiz.questions[currentQuestionIndex].id}-${currentQuestionIndex}`] === undefined 
                                        ? "Select an answer to continue"
                                        : (currentQuestionIndex < quiz.questions.length - 1 ? "Ready for next question" : "Ready to submit")}
                                </span>
                                
                                <div className="flex items-center gap-3">
                                    {currentQuestionIndex > 0 && (
                                        <Button
                                            onClick={handlePrevious}
                                            variant="outline"
                                            className="rounded-none h-14 border-2 border-foreground bg-card text-foreground hover:bg-muted font-semibold tracking-wide text-sm"
                                        >
                                            <ArrowLeft className="size-4 mr-2" />
                                            PREVIOUS
                                        </Button>
                                    )}
                                    
                                    {currentQuestionIndex < quiz.questions.length - 1 ? (
                                        <Button
                                            onClick={handleNext}
                                            disabled={answers[`${quiz.questions[currentQuestionIndex].id}-${currentQuestionIndex}`] === undefined}
                                            className="min-w-[200px] rounded-none h-14 bg-foreground text-background hover:bg-foreground/90 font-semibold tracking-wide text-sm"
                                        >
                                            NEXT QUESTION
                                            <ArrowRight className="size-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={submitting || !allAnswered}
                                            className="min-w-[200px] rounded-none h-14 bg-bauhaus-red hover:bg-bauhaus-red/90 text-white font-semibold tracking-wide text-sm"
                                        >
                                            {submitting ? (
                                                <span className="flex items-center gap-3">
                                                    <div className="size-4 rounded-none border-2 border-white/30 border-t-white animate-spin" />
                                                    SUBMITTING
                                                </span>
                                            ) : "SUBMIT QUIZ"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="w-full h-1 bg-muted mt-4 overflow-hidden border border-border">
                                <motion.div 
                                    className="h-full bg-foreground"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(currentQuestionIndex / quiz.questions.length) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            className="rounded-none border border-border bg-card shadow-none mt-12"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as any }}
                        >
                            <div className={cn(
                                "px-8 py-6 border-b border-border flex items-center justify-between",
                                result.attempt.passed ? "bg-success/10" : "bg-destructive/10"
                            )}>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Quiz Result</p>
                                    <h3 className="text-2xl font-heading font-semibold text-foreground">
                                        {result.attempt.passed ? "You passed!" : "Review and try again."}
                                    </h3>
                                </div>
                                <div className={cn(
                                    "size-20 flex flex-col items-center justify-center border shrink-0 bg-card",
                                    result.attempt.passed
                                        ? "border-success"
                                        : "border-destructive"
                                )}>
                                    <span className={cn(
                                        "text-xl font-heading font-black",
                                        result.attempt.passed ? "text-success" : "text-destructive"
                                    )}>
                                        {scorePercent}%
                                    </span>
                                </div>
                            </div>

                            <div className="px-8 py-6">
                                <div className="h-2 bg-muted overflow-hidden border border-border">
                                    <motion.div
                                        className={cn("h-full", result.attempt.passed ? "bg-success" : "bg-destructive")}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${scorePercent}%` }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as any, delay: 0.2 }}
                                    />
                                </div>
                                <p className="text-sm font-medium mt-4 text-foreground">
                                    {result.attempt.passed
                                        ? "Excellent work! Ready for the next lesson."
                                        : "Review the explanations above and try again."}
                                </p>
                            </div>

                            <div className="px-8 pb-8">
                                {result.attempt.passed ? (
                                    <Button
                                        onClick={onContinue}
                                        className="w-full rounded-none h-14 bg-bauhaus-blue hover:bg-bauhaus-blue/90 text-white font-semibold tracking-wide text-sm"
                                    >
                                        CONTINUE TO NEXT MODULE
                                        <ArrowRight className="size-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={loadQuiz}
                                        className="w-full rounded-none h-14 font-semibold tracking-wide text-sm border-2 border-foreground bg-card text-foreground hover:bg-muted"
                                    >
                                        <RotateCcw className="size-4 mr-2" />
                                        RETRY QUIZ
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {isCompleted && result?.attempt.passed && <Celebration />}
        </div>
    );
}
