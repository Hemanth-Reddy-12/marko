import * as React from "react";
import { fetchQuiz, pollQuiz, submitQuizAttempt } from "../api/quiz.api";
import type { Quiz, QuizAttemptResult } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface QuizInterfaceProps {
    courseId: string;
    lessonId: string;
    onContinue?: () => void;
    onProgressChange?: (answeredCount: number, totalCount: number) => void;
}

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
                setStatusText("Generating your personalized quiz...");
                const polled = await pollQuiz(courseId, lessonId, () => setStatusText("Still generating... please wait"));
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

    React.useEffect(() => {
        loadQuiz();
    }, [loadQuiz]);

    React.useEffect(() => {
        if (onProgressChange) {
            if (quiz) {
                onProgressChange(Object.keys(answers).length, quiz.questions.length);
            } else {
                onProgressChange(0, 0);
            }
        }
    }, [answers, quiz, onProgressChange]);

    const handleSelect = (questionId: string, index: number) => {
        if (result) return; // disable changing answers after submission
        setAnswers(prev => ({ ...prev, [questionId]: index }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;
        
        // Ensure all questions are answered
        if (Object.keys(answers).length !== quiz.questions.length) {
            alert("Please answer all questions before submitting.");
            return;
        }

        const answerArray = quiz.questions.map(q => answers[q.id]);
        
        setSubmitting(true);
        try {
            const res = await submitQuizAttempt(courseId, lessonId, { answers: answerArray });
            setResult(res);
        } catch (err: any) {
            alert(err.message || "Failed to submit quiz attempt");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full p-6">
                <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4 animate-pulse">
                    <div className="size-4 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin" />
                    {statusText}
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="mb-8">
                        <Skeleton className="h-6 w-full rounded-md mb-4" />
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-full rounded-md" />
                            <Skeleton className="h-10 w-full rounded-md" />
                            <Skeleton className="h-10 w-full rounded-md" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center">
                <div className="size-12 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="size-6 text-red-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-zinc-900">Failed to load quiz</h3>
                    <p className="text-sm text-zinc-500 mt-1">{error}</p>
                </div>
                <Button onClick={loadQuiz} variant="outline" className="mt-4">Try Again</Button>
            </div>
        );
    }

    if (!quiz || !quiz.questions.length) {
        return <div className="p-6 text-center text-zinc-500">No questions available.</div>;
    }

    // Use full questions with rationale from result if available, else original quiz
    const questionsToDisplay = result?.quiz.questions || quiz.questions;
    const isCompleted = !!result;

    return (
        <div className="max-w-3xl mx-auto w-full p-6 pb-24">
            <h2 className="text-2xl font-bold text-zinc-900 mb-8">Lesson Knowledge Check</h2>
            
            <div className="space-y-12">
                {questionsToDisplay.map((q, qIndex) => {
                    const selectedIdx = answers[q.id];
                    const correctIdx = q.correctAnswerIndex;
                    const isCorrect = selectedIdx === correctIdx;

                    return (
                        <div key={q.id} className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-zinc-900 mb-4">{qIndex + 1}. {q.text}</h3>
                            
                            <RadioGroup 
                                value={selectedIdx !== undefined ? selectedIdx.toString() : ""} 
                                onValueChange={(val) => handleSelect(q.id, parseInt(val))}
                                className="space-y-3"
                                disabled={isCompleted}
                            >
                                {q.options.map((opt, optIdx) => {
                                    let itemStateClass = "";
                                    let icon = null;

                                    if (isCompleted) {
                                        if (optIdx === correctIdx) {
                                            itemStateClass = "bg-green-50 border-green-200";
                                            icon = <CheckCircle2 className="size-5 text-green-600 shrink-0" />;
                                        } else if (optIdx === selectedIdx && optIdx !== correctIdx) {
                                            itemStateClass = "bg-red-50 border-red-200";
                                            icon = <XCircle className="size-5 text-red-600 shrink-0" />;
                                        } else {
                                            itemStateClass = "opacity-50";
                                        }
                                    }

                                    return (
                                        <Label 
                                            key={optIdx} 
                                            className={cn(
                                                "group flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-all duration-200 select-none",
                                                !isCompleted && "hover:bg-zinc-50/80 border-zinc-200/80 hover:border-zinc-300 hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0",
                                                selectedIdx === optIdx && !isCompleted && "border-zinc-900 bg-zinc-50/30 ring-1 ring-zinc-900 shadow-sm",
                                                itemStateClass
                                            )}
                                        >
                                            <RadioGroupItem value={optIdx.toString()} id={`${q.id}-${optIdx}`} className="sr-only" />
                                            
                                            {/* Custom Radio Circle indicator */}
                                            {!isCompleted && (
                                                <div className={cn(
                                                    "size-4 rounded-full border border-zinc-300 flex items-center justify-center shrink-0 transition-all duration-200",
                                                    selectedIdx === optIdx ? "border-zinc-900 bg-zinc-900" : "group-hover:border-zinc-400"
                                                )}>
                                                    {selectedIdx === optIdx && (
                                                        <div className="size-1.5 rounded-full bg-white" />
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex-1 text-sm font-medium leading-relaxed">{opt}</div>
                                            {icon}
                                        </Label>
                                    );
                                })}
                            </RadioGroup>

                            {isCompleted && q.rationale && (
                                <div className={cn("mt-4 p-4 rounded-lg text-sm border", isCorrect ? "bg-green-50/50 border-green-100" : "bg-red-50/50 border-red-100")}>
                                    <span className="font-semibold">{isCorrect ? "Correct: " : "Incorrect: "}</span>
                                    {q.rationale}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 flex flex-col items-center">
                {!isCompleted ? (
                    <Button 
                        onClick={handleSubmit} 
                        disabled={submitting || Object.keys(answers).length !== quiz.questions.length}
                        className="w-full sm:w-auto min-w-[200px]"
                        size="lg"
                    >
                        {submitting ? "Submitting..." : "Submit Answers"}
                    </Button>
                ) : (
                    <div className="w-full text-center">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold mb-2">
                                Score: {Math.round(result.attempt.score * 100)}%
                            </h3>
                            <p className={cn("text-lg font-medium", result.attempt.passed ? "text-green-600" : "text-red-600")}>
                                {result.attempt.passed ? "You passed! Excellent work." : "You didn't pass this time. Please review and try again."}
                            </p>
                        </div>
                        
                        {result.attempt.passed ? (
                            <Button onClick={onContinue} className="w-full sm:w-auto min-w-[200px]" size="lg">
                                Continue to Next Topic <ArrowRight className="ml-2 size-4" />
                            </Button>
                        ) : (
                            <Button onClick={loadQuiz} className="w-full sm:w-auto min-w-[200px]" size="lg" variant="outline">
                                Retry Quiz
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
