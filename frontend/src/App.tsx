import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { HealthCheckPage } from "@/pages/HealthCheckPage";
import { CourseDetailsPage } from "@/pages/CourseDetailsPage";
import { CoursesPage } from "@/pages/CoursesPage";
import { LessonPage } from "@/pages/LessonPage";
import { QuizPage } from "@/pages/QuizPage";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/health" element={<HealthCheckPage />} />
                
                {/* Protected Routes */}
                <Route element={<AppShell />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
                    <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
                    <Route path="/courses/:courseId/lessons/:lessonId/quiz" element={<QuizPage />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;
