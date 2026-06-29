import * as React from "react";
import { useSession } from "@/lib/auth-client";
import { BookOpen, GraduationCap, Trophy, Sparkles, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CourseList } from "@/features/course/components/CourseList";
import { PlannerForm } from "@/features/course/components/PlannerForm";
import { fetchApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
    const { data: session } = useSession();
    const navigate = useNavigate();
    const [courses, setCourses] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isPlannerOpen, setIsPlannerOpen] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const loadCourses = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const data = await fetchApi<any[]>("/api/courses");
            setCourses(data);
            setError(null);
        } catch (err: any) {
            console.error("Failed to load courses:", err);
            setError("Failed to load courses. Please refresh.");
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    React.useEffect(() => {
        loadCourses();
    }, []);

    // Polling logic when any course is in GENERATING state
    React.useEffect(() => {
        const hasGenerating = courses.some(c => c.status === "GENERATING");
        if (!hasGenerating) return;

        const interval = setInterval(() => {
            loadCourses(false); // Silent reload in background
        }, 3000);

        return () => clearInterval(interval);
    }, [courses]);

    const handleCourseCreated = (newCourse: any) => {
        // Optimistically add to state, or trigger fresh load
        setCourses(prev => [newCourse, ...prev]);
        loadCourses(false);
    };

    const handleViewCourse = (courseId: string) => {
        navigate(`/courses/${courseId}`);
    };

    // Calculate metrics
    const activeCoursesCount = courses.filter(c => c.status === "ACTIVE" || c.status === "GENERATING").length;
    
    const finishedLessonsCount = courses.reduce((acc, course) => {
        const completed = course.lessons?.filter((l: any) => l.status === "COMPLETED").length || 0;
        return acc + completed;
    }, 0);

    const passedAssessmentsCount = finishedLessonsCount; // Since completing a lesson requires passing its assessment

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
            {/* Header / Actions */}
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-xl font-bold text-zinc-900">Workspace Dashboard</h2>
                    <p className="text-xs text-zinc-500 font-normal">Track your goals and continue learning.</p>
                </div>
                {courses.length > 0 && (
                    <Button 
                        onClick={() => setIsPlannerOpen(true)}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-3 py-1.5 h-8 rounded-md shadow-sm flex items-center gap-1"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Course</span>
                    </Button>
                )}
            </div>

            {/* Hero Welcome banner */}
            <Card className="bg-zinc-900 text-zinc-50 p-6 relative overflow-hidden border-none shadow-sm rounded-lg">
                <div className="relative z-10 flex flex-col gap-3 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm text-zinc-200">
                        <Sparkles className="h-3 w-3 text-zinc-300" />
                        <span>Welcome Back</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Hi, {session?.user?.name || "Student"}
                    </h1>
                    <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                        What would you like to master today? Start by creating a course outline custom-generated for your learning goals.
                    </p>
                </div>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Stat Card 1 */}
                <Card className="bg-white border border-zinc-200/80 shadow-none rounded-lg">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200/50">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Courses</p>
                            <h3 className="text-xl font-bold text-zinc-900">{loading ? "-" : activeCoursesCount}</h3>
                        </div>
                    </CardContent>
                </Card>

                {/* Stat Card 2 */}
                <Card className="bg-white border border-zinc-200/80 shadow-none rounded-lg">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200/50">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Lessons Finished</p>
                            <h3 className="text-xl font-bold text-zinc-900">{loading ? "-" : finishedLessonsCount}</h3>
                        </div>
                    </CardContent>
                </Card>

                {/* Stat Card 3 */}
                <Card className="bg-white border border-zinc-200/80 shadow-none rounded-lg">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200/50">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Assessments Passed</p>
                            <h3 className="text-xl font-bold text-zinc-900">{loading ? "-" : passedAssessmentsCount}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {error && (
                <div className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            {/* Course List or Empty State */}
            {!loading && courses.length === 0 ? (
                <Card className="bg-zinc-50/50 border-dashed border-zinc-200 border-2 shadow-none rounded-lg">
                    <CardContent className="p-8 text-center flex flex-col items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200/50">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col gap-1.5 max-w-md mx-auto">
                            <h2 className="text-lg font-bold text-zinc-900">No active courses yet</h2>
                            <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                                Create a course outline with a prompt. Let AI build your structured curriculum instantly.
                            </p>
                        </div>
                        <Button 
                            onClick={() => setIsPlannerOpen(true)}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-4 py-2 h-9 rounded-md shadow-sm"
                        >
                            Create My First Course
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <CourseList 
                    courses={courses} 
                    loading={loading} 
                    onViewCourse={handleViewCourse} 
                />
            )}

            {/* Dialog Form */}
            <PlannerForm 
                isOpen={isPlannerOpen}
                onClose={() => setIsPlannerOpen(false)}
                onCourseCreated={handleCourseCreated}
            />
        </div>
    );
}



