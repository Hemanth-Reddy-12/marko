import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatUI } from "../features/chat/components/ChatUI";
import { initInterview } from "../features/chat/api/chat.api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Maximize } from "lucide-react";

export function InterviewRoomPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (!courseId) return;

        const startInterview = async () => {
            try {
                const data = await initInterview({ courseId });
                setSessionId(data.sessionId);
            } catch (err: any) {
                setError(err.message || "Failed to initialize interview.");
            }
        };

        startInterview();
    }, [courseId]);

    const handleEnterFullscreen = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
            setIsFullscreen(true);
        } catch (err) {
            console.error("Error attempting to enable fullscreen:", err);
            setIsFullscreen(true);
        }
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Card className="p-8 text-center max-w-md">
                    <h2 className="text-xl text-red-500 mb-4 font-semibold">{error}</h2>
                    <Button onClick={() => navigate(-1)}>Go Back</Button>
                </Card>
            </div>
        );
    }

    if (!sessionId) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-lg text-muted-foreground animate-pulse">Preparing interview milestones...</p>
            </div>
        );
    }

    if (!isFullscreen) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Card className="p-10 text-center max-w-xl flex flex-col items-center shadow-lg border-2">
                    <h1 className="text-3xl font-bold tracking-tight mb-4">Capstone Examination</h1>
                    <p className="text-muted-foreground mb-8">
                        This is a live, real-time oral examination. The environment requires your full attention. 
                        Please enter fullscreen mode to begin your assessment.
                    </p>
                    <Button onClick={handleEnterFullscreen} size="lg" className="px-8 text-lg flex gap-2">
                        <Maximize className="size-5" />
                        Enter Interview Environment
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-screen bg-zinc-50 p-4 md:p-8 justify-center items-center">
            <div className="w-full max-w-4xl mb-4 text-center shrink-0">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Capstone Examination</h1>
                <p className="text-muted-foreground">
                    Your answers will be evaluated to determine your mastery of the course.
                </p>
            </div>
            <div className="w-full max-w-4xl flex-1 flex flex-col min-h-0">
                <ChatUI sessionId={sessionId} />
            </div>
        </div>
    );
}
