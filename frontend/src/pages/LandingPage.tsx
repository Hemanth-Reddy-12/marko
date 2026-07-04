import { useSession } from "@/lib/auth-client";
import { Navigate } from "react-router-dom";
import { LandingNavbar } from "@/features/landing/components/Navbar";
import { HeroComposition } from "@/features/landing/components/HeroComposition";
import { FeatureGrid } from "@/features/landing/components/FeatureGrid";
import { WorkflowTimeline } from "@/features/landing/components/WorkflowTimeline";
import { ArchitectureDiagram } from "@/features/landing/components/ArchitectureDiagram";
import { AgentCards } from "@/features/landing/components/AgentCards";
import { TechGrid } from "@/features/landing/components/TechGrid";
import { StatsSection } from "@/features/landing/components/StatsSection";
import { DashboardPreview } from "@/features/landing/components/DashboardPreview";
import { WhySection } from "@/features/landing/components/WhySection";
import { CTA } from "@/features/landing/components/CTA";
import { Footer } from "@/features/landing/components/Footer";

export function LandingPage() {
    const { data: session } = useSession();

    if (session) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-black selection:text-white flex flex-col">
            <LandingNavbar />
            <main className="flex-grow w-full overflow-hidden">
                <HeroComposition />
                <FeatureGrid />
                <WorkflowTimeline />
                <ArchitectureDiagram />
                <AgentCards />
                <TechGrid />
                <StatsSection />
                <DashboardPreview />
                <WhySection />
                <CTA />
            </main>
            <Footer />
        </div>
    );
}
