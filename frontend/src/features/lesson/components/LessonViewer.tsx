import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { codeToHtml } from "shiki";
import { TextReveal } from "@/components/animated/TextReveal";
import { Skeleton } from "@/components/ui/skeleton";
import { pollLesson, regenerateLesson } from "../api/lesson.api";
import type { LessonResponse } from "../types";
import { AlertCircle, ArrowRight, RefreshCw, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LessonViewerProps {
    courseId: string;
    lessonId: string;
    onNext?: (id: string) => void;
}

const CodeHighlight = ({ className, children, node, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    const [html, setHtml] = React.useState<string | null>(null);

    React.useEffect(() => {
        let mounted = true;
        if (match) {
            codeToHtml(String(children).replace(/\n$/, ''), {
                lang: language,
                theme: 'github-dark'
            }).then(res => {
                if (mounted) setHtml(res);
            }).catch(() => {
                if (mounted) setHtml(null);
            });
        }
        return () => { mounted = false; };
    }, [children, language, match]);

    if (!match) {
        return <code className={className} {...props}>{children}</code>;
    }

    if (html) {
        return <div dangerouslySetInnerHTML={{ __html: html }} className="shiki-container" />;
    }

    return (
        <div className="animate-pulse bg-primary rounded-none p-4 mb-4 border border-border">
            <div className="h-4 bg-muted/20 rounded-none w-1/4 mb-2"></div>
            <div className="h-4 bg-muted/20 rounded-none w-1/2 mb-2"></div>
            <div className="h-4 bg-muted/20 rounded-none w-3/4"></div>
        </div>
    );
};

export function LessonViewer({ courseId, lessonId, onNext }: LessonViewerProps) {
    const navigate = useNavigate();
    const [lesson, setLesson] = React.useState<LessonResponse | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [statusText, setStatusText] = React.useState("Loading lesson...");
    const [error, setError] = React.useState<string | null>(null);
    const [regenerating, setRegenerating] = React.useState(false);

    const handleRegenerate = async () => {
        if (regenerating) return;
        setRegenerating(true);
        setLoading(true);
        setError(null);
        setStatusText("Regenerating lesson content...");
        setLesson(null);
        try {
            await regenerateLesson(courseId, lessonId);
            const polled = await pollLesson(courseId, lessonId, () =>
                setStatusText("Still regenerating...")
            );
            setLesson(polled);
            toast.success("Lesson regenerated successfully");
        } catch (err: any) {
            setError(err.message || "Failed to regenerate lesson");
            toast.error(err.message || "Failed to regenerate lesson");
        } finally {
            setRegenerating(false);
            setLoading(false);
        }
    };

    React.useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:5000" : "")}/api/courses/${courseId}/lessons/${lessonId}`, {
                    credentials: "include"
                });

                if (res.status === 202) {
                    setStatusText("Generating curriculum content. This may take a moment...");
                    const polled = await pollLesson(courseId, lessonId, () => setStatusText("Still processing..."));
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
            <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full p-12">
                <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-8">
                    <div className="size-3 bg-bauhaus-blue rounded-none animate-pulse" />
                    {statusText}
                </div>
                <Skeleton className="h-12 w-3/4 rounded-none" />
                <div className="flex flex-col gap-4 mt-8">
                    <Skeleton className="h-4 w-full rounded-none" />
                    <Skeleton className="h-4 w-full rounded-none" />
                    <Skeleton className="h-4 w-5/6 rounded-none" />
                </div>
                <Skeleton className="h-48 w-full rounded-none mt-12" />
            </div>
        );
    }

    const isApiKeyError = error && (/api key/i.test(error) || /unauthorized|401|invalid/i.test(error));

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 py-24 px-6 text-center max-w-lg mx-auto">
                <div className="size-16 border-2 border-destructive bg-destructive/10 flex items-center justify-center bauhaus-square">
                    <AlertCircle className="size-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-heading font-black text-foreground uppercase tracking-tight">
                        {isApiKeyError ? "AI Provider API Key Error" : "Failed to Load Lesson"}
                    </h3>
                    <p className="text-sm font-mono text-muted-foreground leading-relaxed mt-2">{error}</p>
                </div>
                {isApiKeyError ? (
                    <Button
                        onClick={() => navigate("/settings")}
                        className="bauhaus-square bg-bauhaus-red text-white hover:bg-bauhaus-red/90 font-bold uppercase tracking-widest text-xs h-11 px-6 bauhaus-border shadow-[3px_3px_0px_0px_var(--foreground)] hover:shadow-none transition-all"
                    >
                        <Key className="size-4 mr-2" />
                        Configure API Key in Settings
                    </Button>
                ) : (
                    <Button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="bauhaus-square bg-foreground text-background font-bold uppercase tracking-widest text-xs h-11 px-6"
                    >
                        <RefreshCw className={cn("size-4 mr-2", regenerating && "animate-spin")} />
                        Retry Lesson Generation
                    </Button>
                )}
            </div>
        );
    }

    if (!lesson?.content || lesson?.generationStatus === "FAILED") {
        return (
            <div className="flex flex-col items-center justify-center gap-6 py-24 px-6 text-center max-w-lg mx-auto">
                <div className="size-16 border-2 border-destructive bg-destructive/10 flex items-center justify-center bauhaus-square">
                    <AlertCircle className="size-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-heading font-black text-foreground uppercase tracking-tight">Lesson Generation Failed</h3>
                    <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                        The AI engine could not generate this lesson content. Please check your AI Provider API key configuration.
                    </p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center mt-2">
                    <Button
                        onClick={() => navigate("/settings")}
                        className="bauhaus-square bg-bauhaus-red text-white hover:bg-bauhaus-red/90 font-bold uppercase tracking-widest text-xs h-11 px-6 bauhaus-border shadow-[3px_3px_0px_0px_var(--foreground)] hover:shadow-none transition-all"
                    >
                        <Key className="size-4 mr-2" />
                        Settings → AI Providers
                    </Button>
                    <Button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        variant="outline"
                        className="bauhaus-square bauhaus-border font-bold uppercase tracking-widest text-xs h-11 px-6"
                    >
                        <RefreshCw className={cn("size-4 mr-2", regenerating && "animate-spin")} />
                        Retry Generation
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <TextReveal className="max-w-4xl mx-auto w-full p-8 md:p-16 pb-32">
            <div className="flex justify-end mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="rounded-none text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted gap-2 h-8"
                >
                    <RefreshCw className={regenerating ? "size-3.5 animate-spin" : "size-3.5"} />
                    {regenerating ? "Regenerating" : "Regenerate"}
                </Button>
            </div>
            <div className="prose dark:prose-invert prose-zinc prose-base max-w-none 
                prose-headings:font-heading prose-headings:font-semibold prose-headings:text-foreground prose-h1:text-4xl prose-h1:tracking-tight prose-h2:text-2xl prose-h2:tracking-tight 
                prose-h3:text-xl prose-p:leading-relaxed prose-p:text-foreground/95 prose-strong:text-foreground prose-li:text-foreground prose-ol:text-foreground prose-ul:text-foreground prose-a:text-bauhaus-blue prose-a:no-underline hover:prose-a:underline
                prose-pre:border prose-pre:border-border prose-pre:rounded-none
                prose-code:text-bauhaus-red prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-none prose-code:before:content-none prose-code:after:content-none prose-code:bg-muted/50
                prose-img:rounded-none prose-img:border prose-img:border-border
                prose-blockquote:border-l-2 prose-blockquote:border-foreground prose-blockquote:bg-muted/30 prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:pl-6 prose-blockquote:not-italic prose-blockquote:text-foreground
            ">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                    components={{ code: CodeHighlight }}
                >
                    {lesson.content}
                </ReactMarkdown>
            </div>

            {onNext && (
                <div className="mt-24 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex flex-col gap-2 min-w-0">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Knowledge Check</span>
                        <span className="text-base font-semibold text-foreground truncate">Ready to test your understanding?</span>
                    </div>
                    <Button
                        onClick={() => onNext(lessonId)}
                        className="rounded-none bg-foreground text-background hover:bg-foreground/90 h-12 px-8 font-medium shrink-0"
                    >
                        <span>Take Lesson Quiz</span>
                        <ArrowRight className="size-4 ml-2" />
                    </Button>
                </div>
            )}
        </TextReveal>
    );
}
