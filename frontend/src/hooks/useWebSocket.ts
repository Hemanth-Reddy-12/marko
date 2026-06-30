import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "../lib/api";
import { useSession } from "../lib/auth-client";

export function useWebSocket(sessionId: string | null) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { data: sessionData } = useSession();
    const user = sessionData?.user;
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!sessionId || !user) return;
        
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
            socketInstance.emit("join_session", { sessionId, userId: user.id });
        });
        
        socketInstance.on("disconnect", () => {
            setIsConnected(false);
        });
        
        return () => {
            socketInstance.disconnect();
            socketRef.current = null;
        };
    }, [sessionId, user?.id]);

    return { socket, isConnected };
}
