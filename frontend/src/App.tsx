import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { HealthCheckPage } from "@/pages/HealthCheckPage";
import { CourseDetailsPage } from "@/pages/CourseDetailsPage";
import { CoursesPage } from "@/pages/CoursesPage";
import { LessonPage } from "@/pages/LessonPage";
import { QuizPage } from "@/pages/QuizPage";
import { InterviewRoomPage } from "@/pages/InterviewRoomPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { LandingPage } from "@/pages/LandingPage";
import { AIActivityPage } from "@/pages/AIActivityPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { LessonsPage } from "@/pages/LessonsPage";
import { QuizzesPage } from "@/pages/QuizzesPage";
import { InterviewsPage } from "@/pages/InterviewsPage";
import { UsagePage } from "@/pages/UsagePage";
import { CourseUsageAnalyticsPage } from "@/pages/CourseUsageAnalyticsPage";

import { ThemeProvider } from "@/components/ThemeProvider";
import { SocketProvider } from "@/components/SocketProvider";
import { Toaster } from "sonner";

const App = () => {
    return (
        <ThemeProvider defaultTheme="system" storageKey="marko-theme">
            <SocketProvider>
                <BrowserRouter>
                    <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/health" element={<HealthCheckPage />} />
                    
                    {/* Protected Routes */}
                    <Route element={<AppShell />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/lessons" element={<LessonsPage />} />
                        <Route path="/quizzes" element={<QuizzesPage />} />
                        <Route path="/interviews" element={<InterviewsPage />} />
                        <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
                        <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
                        <Route path="/courses/:courseId/lessons/:lessonId/quiz" element={<QuizPage />} />
                        <Route path="/courses/:courseId/interview" element={<InterviewRoomPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/usage" element={<UsagePage />} />
                        <Route path="/usage/courses/:courseId" element={<CourseUsageAnalyticsPage />} />
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
                <Toaster />
                </BrowserRouter>
            </SocketProvider>
        </ThemeProvider>
    );
};

export default App;
