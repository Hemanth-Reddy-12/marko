import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { TextReveal } from "@/components/animated/TextReveal";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchLesson, pollLesson } from "../api/lesson.api";
import type { LessonResponse } from "../types";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LessonViewerProps {
    courseId: string;
    lessonId: string;
    nextLessonId?: string;
    nextLessonTitle?: string;
    onNext?: (nextId: string) => void;
}

export function LessonViewer({ courseId, lessonId, nextLessonId, nextLessonTitle, onNext }: LessonViewerProps) {
    const [lesson, setLesson] = React.useState<LessonResponse | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [statusText, setStatusText] = React.useState("Loading lesson...");
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                // Initial fetch
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/courses/${courseId}/lessons/${lessonId}`, {
                    credentials: "include"
                });

                if (res.status === 202) {
                    setStatusText("Generating your personalized lesson. This may take a moment...");
                    const polled = await pollLesson(courseId, lessonId, (s) => setStatusText("Still generating... please wait"));
                    if (mounted) {
                        setLesson(polled);
                    }
                } else if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || "Failed to load lesson");
                } else {
                    const data = await res.json();
                    if (mounted) {
                        setLesson(data);
                    }
                }
            } catch (err: any) {
                if (mounted) {
                    setError(err.message || "An unknown error occurred");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [courseId, lessonId]);

    if (loading) {
        return (
            <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full p-6">
                <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4 animate-pulse">
                    <div className="size-4 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin" />
                    {statusText}
                </div>
                <Skeleton className="h-10 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md mt-4" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
                <Skeleton className="h-4 w-4/6 rounded-md" />
                <Skeleton className="h-32 w-full rounded-md mt-6" />
                <Skeleton className="h-4 w-full rounded-md mt-6" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
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
                    <h3 className="text-lg font-bold text-zinc-900">Failed to load lesson</h3>
                    <p className="text-sm text-zinc-500 mt-1">{error}</p>
                </div>
            </div>
        );
    }

    if (!lesson?.content) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center">
                <div className="size-12 rounded-full bg-zinc-50 flex items-center justify-center">
                    <AlertCircle className="size-6 text-zinc-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-zinc-900">No content available</h3>
                    <p className="text-sm text-zinc-500 mt-1">This lesson has not been generated properly.</p>
                </div>
            </div>
        );
    }

    return (
        <TextReveal className="max-w-3xl mx-auto w-full p-6 pb-24">
            <div className="prose prose-zinc prose-sm sm:prose-base max-w-none 
                prose-headings:font-bold prose-h1:text-3xl prose-h1:tracking-tight prose-h2:text-2xl prose-h2:tracking-tight 
                prose-h3:text-xl prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-pre:bg-zinc-900 prose-pre:text-zinc-50 prose-pre:border prose-pre:border-zinc-800 prose-pre:shadow-sm
                prose-code:text-rose-500 prose-code:bg-rose-50/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                prose-img:rounded-xl prose-img:border prose-img:border-zinc-200/50
                prose-blockquote:border-l-4 prose-blockquote:border-zinc-300 prose-blockquote:bg-zinc-50 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:pl-5 prose-blockquote:not-italic prose-blockquote:text-zinc-700
            ">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                    components={{
                        code(props) {
                            const { children, className, node, ref, ...rest } = props;
                            const match = /language-(\w+)/.exec(className || '');
                            return match ? (
                                <SyntaxHighlighter
                                    {...rest}
                                    PreTag="div"
                                    children={String(children).replace(/\n$/, '')}
                                    language={match[1]}
                                    style={vscDarkPlus}
                                />
                            ) : (
                                <code {...rest} ref={ref} className={className}>
                                    {children}
                                </code>
                            );
                        }
                    }}
                >
                    {lesson.content}
                </ReactMarkdown>
            </div>

            {nextLessonId && onNext && (
                <div className="mt-16 pt-8 border-t border-zinc-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Next Topic</span>
                        <span className="text-sm font-semibold text-zinc-900 truncate">{nextLessonTitle || "Continue to next lesson"}</span>
                    </div>
                    <Button
                        onClick={() => onNext(nextLessonId)}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm flex items-center gap-2 shrink-0"
                    >
                        <span>Continue</span>
                        <ArrowRight className="size-4" />
                    </Button>
                </div>
            )}
        </TextReveal>
    );
}
