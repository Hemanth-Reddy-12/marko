import * as React from "react";
import { Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

type Notification = {
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
};

export function NotificationMenu() {
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const fetchNotifications = React.useCallback(async () => {
        try {
            const data = await fetchApi<Notification[]>("/api/notifications");
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    // Fetch on initial mount and set up periodic sync
    React.useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => {
            fetchNotifications();
        }, 15000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Re-fetch automatically whenever dropdown menu is opened
    React.useEffect(() => {
        if (isOpen) {
            setRefreshing(true);
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    // Handle click outside to close dropdown
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleMarkAsRead = async (id: string) => {
        try {
            await fetchApi(`/api/notifications/${id}/read`, { method: "POST" });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await fetchApi("/api/notifications/read-all", { method: "POST" });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative rounded-none hover:bg-muted/50"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="Notifications"
            >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex size-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bauhaus-red opacity-75"></span>
                        <span className="relative inline-flex rounded-full size-2 bg-bauhaus-red"></span>
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 p-0 bauhaus-square bauhaus-border bauhaus-shadow bg-card z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between p-4 border-b bauhaus-border">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold uppercase tracking-wider text-sm">Notifications</h4>
                            {refreshing && <RefreshCw className="size-3 animate-spin text-muted-foreground" />}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground tracking-widest"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto flex flex-col">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground font-mono">
                                No new notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 border-b border-border/50 hover:bg-muted/30 transition-colors flex flex-col gap-1 cursor-pointer",
                                        !notification.read && "bg-muted/10"
                                    )}
                                    onClick={() => {
                                        if (!notification.read) handleMarkAsRead(notification.id);
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h5 className="text-sm font-semibold leading-tight">
                                            {notification.title}
                                        </h5>
                                        {!notification.read && (
                                            <div className="size-2 rounded-full bg-bauhaus-blue shrink-0 mt-1" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground/70 font-mono mt-1">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
