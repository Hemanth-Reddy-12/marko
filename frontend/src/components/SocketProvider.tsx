import * as React from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface SocketContextValue {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = React.createContext<SocketContextValue>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => React.useContext(SocketContext);

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [socket, setSocket] = React.useState<Socket | null>(null);
    const [isConnected, setIsConnected] = React.useState(false);

    React.useEffect(() => {
        if (!session?.user?.id) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const socketInstance = io(SOCKET_URL, {
            withCredentials: true,
            reconnection: true,
        });

        socketInstance.on("connect", () => {
            setIsConnected(true);
            socketInstance.emit("join_user", { userId: session.user.id });
        });

        socketInstance.on("disconnect", () => {
            setIsConnected(false);
        });

        socketInstance.on("new_notification", (notification) => {
            toast(notification.title, {
                description: notification.message,
                duration: 5000,
                position: "bottom-right",
            });
            // We could also dispatch a custom event here to trigger re-fetches
            window.dispatchEvent(new CustomEvent("marko-notification-received"));
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [session?.user?.id]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}
