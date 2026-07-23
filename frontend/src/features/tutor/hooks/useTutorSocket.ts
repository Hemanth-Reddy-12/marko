import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "../../../lib/api";
import { useSession } from "../../../lib/auth-client";
import type { TutorMessage } from "../api/tutor.api";

export function useTutorSocket(courseId: string | undefined, lessonId?: string) {
    const { data: sessionData } = useSession();
    const userId = sessionData?.user?.id;

    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<TutorMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!courseId || !userId) return;

        const socketInstance = io(API_BASE_URL, {
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        socketRef.current = socketInstance;
        setSocket(socketInstance);

        socketInstance.on("connect", () => {
            setIsConnected(true);
            socketInstance.emit("join_tutor_session", { courseId, userId });
        });

        socketInstance.on("tutor_session_joined", (data: { sessionId: string; messages: TutorMessage[] }) => {
            setSessionId(data.sessionId);
            setMessages(data.messages || []);
        });

        socketInstance.on("tutor_typing", () => {
            setIsStreaming(true);
            setStreamingContent("");
        });

        socketInstance.on("tutor_chunk", (data: { delta: string }) => {
            setIsStreaming(true);
            setStreamingContent((prev) => prev + data.delta);
        });

        socketInstance.on("tutor_complete", (data: { messageId: string; content: string }) => {
            setIsStreaming(false);
            setMessages((prev) => [
                ...prev,
                { id: data.messageId, role: "assistant", content: data.content },
            ]);
            setStreamingContent("");
        });

        socketInstance.on("disconnect", () => {
            setIsConnected(false);
        });

        return () => {
            socketInstance.disconnect();
            socketRef.current = null;
        };
    }, [courseId, userId]);

    const sendMessage = useCallback(
        (content: string) => {
            if (!socketRef.current || !sessionId || !userId || !courseId) return;

            const userMsg: TutorMessage = { role: "user", content };
            setMessages((prev) => [...prev, userMsg]);
            setIsStreaming(true);
            setStreamingContent("");

            socketRef.current.emit("send_tutor_message", {
                sessionId,
                content,
                userId,
                courseId,
                lessonId,
            });
        },
        [sessionId, userId, courseId, lessonId]
    );

    const resetMessages = useCallback(() => {
        setMessages([]);
        setStreamingContent("");
    }, []);

    return {
        socket,
        isConnected,
        sessionId,
        messages,
        isStreaming,
        streamingContent,
        sendMessage,
        resetMessages,
    };
}
