import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import LoginPage from "./pages/login";
import { ProtectedRoute } from "./components/auth/protected-route";
import { GuestRoute } from "./components/auth/protected-route";
import { AuthProvider } from "./context/AuthContext";

import DashboardPage from "./pages/dashboard";
import TasksPage from "./pages/tasks";
import ChatPage from "./pages/chat";
import TopicPage from "./pages/topic";
import QuizPage from "./pages/quiz";
import PreparationPage from "./pages/preparation";
import InterviewPage from "./pages/interview";
import TaskAnalysisPage from "./pages/task-analysis";
import AIAnalysisPage from "./pages/ai-analysis";
import SettingsPage from "./pages/settings";
import HelpPage from "./pages/help";
import SearchPage from "./pages/search";
import AccountPage from "./pages/account";
import BillingPage from "./pages/billing";
import NotificationsPage from "./pages/notifications";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <LoginPage />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<DashboardPage />} />
                        <Route path="tasks" element={<TasksPage />} />
                        <Route path="chat" element={<ChatPage />} />
                        <Route path="topic" element={<TopicPage />} />
                        <Route path="quiz" element={<QuizPage />} />
                        <Route path="preparation" element={<PreparationPage />} />
                        <Route path="interview" element={<InterviewPage />} />
                        <Route
                            path="task-analysis"
                            element={<TaskAnalysisPage />}
                        />
                        <Route path="ai-analysis" element={<AIAnalysisPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="help" element={<HelpPage />} />
                        <Route path="search" element={<SearchPage />} />
                        <Route path="account" element={<AccountPage />} />
                        <Route path="billing" element={<BillingPage />} />
                        <Route
                            path="notifications"
                            element={<NotificationsPage />}
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
