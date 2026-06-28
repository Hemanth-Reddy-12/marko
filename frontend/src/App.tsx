import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { HealthCheckPage } from "@/pages/HealthCheckPage";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/health" element={<HealthCheckPage />} />
                
                {/* Protected Routes */}
                <Route element={<AppShell />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/courses" element={<DashboardPage />} /> {/* Placeholder */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;
