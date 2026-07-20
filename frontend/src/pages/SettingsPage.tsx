import * as React from "react";
import { User, Bell, Shield, Key, Moon, Sun, Monitor, LogOut, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useSession, signOut } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { AiProviderSettings } from "@/features/settings/components/AiProviderSettings";

const containerVariants = {
    animate: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as any } 
    },
};

export function SettingsPage() {
    const { data: session } = useSession();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState("profile");
    const { theme, setTheme } = useTheme();

    const [settings, setSettings] = React.useState({
        courseUpdates: true,
        weeklyReport: true,
        systemAlerts: true,
    });
    const [isLoadingSettings, setIsLoadingSettings] = React.useState(true);

    React.useEffect(() => {
        if (activeTab === "notifications") {
            const loadSettings = async () => {
                try {
                    setIsLoadingSettings(true);
                    const { fetchApi } = await import("@/lib/api");
                    const data = await fetchApi<typeof settings>("/api/notifications/settings");
                    setSettings(data);
                } catch (e) {
                    console.error("Failed to load settings", e);
                } finally {
                    setIsLoadingSettings(false);
                }
            };
            loadSettings();
        }
    }, [activeTab]);

    const handleToggleSetting = async (key: keyof typeof settings) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        try {
            const { fetchApi } = await import("@/lib/api");
            await fetchApi("/api/notifications/settings", {
                method: "PUT",
                body: JSON.stringify(newSettings),
            });
        } catch (e) {
            console.error("Failed to update settings", e);
            // Revert on failure
            setSettings(settings);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "ai-providers", label: "AI Providers", icon: Cpu },
        { id: "preferences", label: "Preferences", icon: Monitor },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Shield },
    ];

    return (
        <motion.div
            className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-12"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2 border-b bauhaus-border pb-6 mt-4 border-l-0 border-r-0 border-t-0">
                <div className="flex items-center gap-3 mb-1">
                    <div className="size-4 bg-bauhaus-blue bauhaus-square shrink-0" />
                    <h1 className="text-3xl font-heading font-black tracking-tight text-foreground uppercase">Settings</h1>
                </div>
                <p className="text-sm font-mono text-muted-foreground">Manage your account and configure AI providers.</p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start mt-2">
                {/* Sidebar Navigation — horizontal scroll on mobile, sidebar on md+ */}
                <motion.div variants={itemVariants} className="w-full md:w-56 shrink-0">
                    <nav className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                aria-current={activeTab === tab.id ? "page" : undefined}
                                className={cn(
                                    "flex items-center gap-2.5 px-3 py-2.5 md:px-4 md:py-3 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-150 whitespace-nowrap shrink-0",
                                    "md:border-l-4 border-b-2 md:border-b-0",
                                    activeTab === tab.id
                                        ? "border-bauhaus-blue bg-muted text-foreground"
                                        : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <tab.icon className={cn("size-4 shrink-0", activeTab === tab.id && "text-bauhaus-blue")} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="hidden md:block h-px bg-foreground my-4" />

                    <button
                        onClick={handleSignOut}
                        className="hidden md:flex items-center gap-2.5 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all duration-150 border-l-4 border-transparent text-destructive hover:bg-destructive/10 w-full"
                    >
                        <LogOut className="size-4 shrink-0" />
                        Sign out
                    </button>
                </motion.div>

                {/* Content Area */}
                <motion.div variants={itemVariants} className="flex-1 w-full min-w-0">
                    {activeTab === "profile" && (
                        <div className="flex flex-col gap-8">
                            <Card className="bauhaus-square bauhaus-border bauhaus-shadow bg-card">
                                <CardHeader className="border-b bauhaus-border bg-bauhaus-yellow pb-4 text-black">
                                    <CardTitle className="text-base font-bold uppercase tracking-wider">Public Profile</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8 flex flex-col gap-6">
                                    <div className="flex items-center gap-6 pb-6 border-b bauhaus-border border-l-0 border-r-0 border-t-0">
                                        <div className="size-20 bauhaus-border bg-muted flex items-center justify-center shrink-0">
                                            <span className="text-2xl font-heading text-muted-foreground font-bold">
                                                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Button variant="outline" className="bauhaus-square bauhaus-border h-9 text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background">Change Avatar</Button>
                                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">JPG, GIF or PNG. 1MB max.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                                            <Input id="name" defaultValue={session?.user?.name || ""} className="bauhaus-square bauhaus-border bg-background h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                                            <Input id="email" type="email" defaultValue={session?.user?.email || ""} className="bauhaus-square bauhaus-border bg-background h-10" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bio</Label>
                                        <textarea 
                                            id="bio" 
                                            className="flex min-h-[80px] w-full bauhaus-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bauhaus-square resize-none"
                                            placeholder="Tell us a little bit about yourself"
                                        />
                                    </div>

                                    <Button className="bauhaus-square bauhaus-border bg-foreground text-background hover:bg-bauhaus-red hover:text-white self-start mt-2 px-8 font-bold uppercase tracking-wider">Save Changes</Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === "ai-providers" && <AiProviderSettings />}

                    {activeTab === "preferences" && (
                        <div className="flex flex-col gap-8">
                            <Card className="bauhaus-square bauhaus-border bauhaus-shadow bg-card">
                                <CardHeader className="border-b bauhaus-border bg-bauhaus-blue pb-4 text-white">
                                    <CardTitle className="text-base font-bold uppercase tracking-wider">Appearance</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8 flex flex-col gap-6">
                                    <div className="space-y-4">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Theme</Label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <button 
                                                onClick={() => setTheme("light")}
                                                className={cn(
                                                    "flex flex-col items-center justify-center gap-3 p-4 bauhaus-border transition-colors bauhaus-square",
                                                    theme === "light" ? "bg-foreground text-background" : "hover:bg-muted"
                                                )}
                                            >
                                                <Sun className="size-6" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Light</span>
                                            </button>
                                            <button 
                                                onClick={() => setTheme("dark")}
                                                className={cn(
                                                    "flex flex-col items-center justify-center gap-3 p-4 bauhaus-border transition-colors bauhaus-square",
                                                    theme === "dark" ? "bg-foreground text-background" : "hover:bg-muted"
                                                )}
                                            >
                                                <Moon className="size-6" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Dark</span>
                                            </button>
                                            <button 
                                                onClick={() => setTheme("system")}
                                                className={cn(
                                                    "flex flex-col items-center justify-center gap-3 p-4 bauhaus-border transition-colors bauhaus-square",
                                                    theme === "system" ? "bg-foreground text-background" : "hover:bg-muted"
                                                )}
                                            >
                                                <Monitor className="size-6" />
                                                <span className="text-xs font-bold uppercase tracking-widest">System</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="h-px bg-foreground my-2" />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-semibold">High Contrast</Label>
                                            <p className="text-xs text-muted-foreground">Increase contrast for better readability.</p>
                                        </div>
                                        <Switch />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="flex flex-col gap-8">
                            <Card className="bauhaus-square bauhaus-border bauhaus-shadow bg-card">
                                <CardHeader className="border-b bauhaus-border bg-bauhaus-red pb-4 text-white">
                                    <CardTitle className="text-base font-bold uppercase tracking-wider">Notification Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 divide-y divide-border border-t-0">
                                    <div className="p-6 md:p-8 flex items-center justify-between hover:bg-muted/10 transition-colors border-b bauhaus-border border-t-0 border-l-0 border-r-0">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold uppercase tracking-wider">Course Updates</Label>
                                            <p className="text-xs text-muted-foreground font-mono">Get an email when your AI-generated course or lesson is ready.</p>
                                        </div>
                                        <Switch
                                            checked={settings.courseUpdates}
                                            onChange={() => handleToggleSetting("courseUpdates")}
                                            disabled={isLoadingSettings}
                                        />
                                    </div>
                                    <div className="p-6 md:p-8 flex items-center justify-between hover:bg-muted/10 transition-colors border-b bauhaus-border border-t-0 border-l-0 border-r-0">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold uppercase tracking-wider">Weekly Report</Label>
                                            <p className="text-xs text-muted-foreground font-mono">Weekly summary of lessons completed, quizzes passed, and time studied.</p>
                                        </div>
                                        <Switch
                                            checked={settings.weeklyReport}
                                            onChange={() => handleToggleSetting("weeklyReport")}
                                            disabled={isLoadingSettings}
                                        />
                                    </div>
                                    <div className="p-6 md:p-8 flex items-center justify-between hover:bg-muted/10 transition-colors">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold uppercase tracking-wider">System Alerts</Label>
                                            <p className="text-xs text-muted-foreground font-mono">Critical alerts about outages or scheduled maintenance windows.</p>
                                        </div>
                                        <Switch
                                            checked={settings.systemAlerts}
                                            onChange={() => handleToggleSetting("systemAlerts")}
                                            disabled={isLoadingSettings}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="flex flex-col gap-8">
                            <Card className="bauhaus-square bauhaus-border bauhaus-shadow bg-card">
                                <CardHeader className="border-b bauhaus-border bg-black pb-4 text-white">
                                    <CardTitle className="text-base font-bold uppercase tracking-wider">Security</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8 flex flex-col gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Key className="size-4 text-bauhaus-yellow" />
                                            <h3 className="text-sm font-bold uppercase tracking-wider">Change Password</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="current-pwd" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Password</Label>
                                            <Input id="current-pwd" type="password" className="bauhaus-square bauhaus-border bg-background h-10 max-w-md" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-pwd" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Password</Label>
                                            <Input id="new-pwd" type="password" className="bauhaus-square bauhaus-border bg-background h-10 max-w-md" />
                                        </div>
                                        <Button className="bauhaus-square bauhaus-border bg-foreground text-background hover:bg-bauhaus-blue hover:text-white mt-2 font-bold uppercase tracking-wider">Update Password</Button>
                                    </div>
                                    
                                    <div className="h-px bg-foreground" />
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="size-4 text-bauhaus-red" />
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-destructive">Danger Zone</h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-mono">Permanently deletes your account, all courses, and learning data. This cannot be undone.</p>
                                        <Button variant="outline" className="bauhaus-square bauhaus-border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground mt-2 font-black uppercase tracking-wider">
                                            Delete Account
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
