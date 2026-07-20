import * as React from "react";
import { BookOpen, Plus, Search, Filter, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CourseList } from "@/features/course/components/CourseList";
import { PlannerForm } from "@/features/course/components/PlannerForm";
import { fetchApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

export function CoursesPage() {
    const navigate = useNavigate();
    const [courses, setCourses] = React.useState<any[]>([]);
    const [recentCourses, setRecentCourses] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isPlannerOpen, setIsPlannerOpen] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");

    const loadCourses = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const [allData, recentData] = await Promise.all([
                fetchApi<any[]>("/api/courses"),
                fetchApi<any[]>("/api/dashboard/courses/recent").catch(() => []) // Optional feature, ignore failure
            ]);
            
            setCourses(prev => {
                if (!showLoading) {
                    allData.forEach(newCourse => {
                        const oldCourse = prev.find(c => c.id === newCourse.id);
                        if (oldCourse && oldCourse.status === "GENERATING") {
                            if (newCourse.status === "ACTIVE") {
                                toast.success(`Course "${newCourse.title}" created successfully!`);
                            } else if (newCourse.status === "FAILED") {
                                toast.error(newCourse.description || "Course generation failed");
                            }
                        }
                    });
                }
                return allData;
            });
            setRecentCourses(recentData);
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
            loadCourses(false);
        }, 3000);

        return () => clearInterval(interval);
    }, [courses]);

    const handleCourseCreated = (newCourse: any) => {
        setCourses(prev => [newCourse, ...prev]);
        loadCourses(false);
    };

    const handleViewCourse = (courseId: string) => {
        navigate(`/courses/${courseId}`);
    };

    const handleDeleteCourse = async (courseId: string) => {
        try {
            await fetchApi(`/api/courses/${courseId}`, { method: "DELETE" });
            setCourses(prev => prev.filter(c => c.id !== courseId));
            setRecentCourses(prev => prev.filter(c => c.id !== courseId));
        } catch (err: any) {
            console.error("Failed to delete course:", err);
            setError("Failed to delete course. Please try again.");
        }
    };

    const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <motion.div 
            className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            {/* Header / Actions */}
            <motion.div variants={itemVariants} className="flex flex-col gap-6 border-b-2 border-foreground pb-6 mt-4">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-4 bg-bauhaus-yellow bauhaus-triangle-up border-b-bauhaus-yellow border-x-[0.3rem] border-b-[0.6rem]"></div>
                            <h1 className="text-3xl font-heading font-semibold tracking-tight text-foreground uppercase">Courses</h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Manage and track your active learning paths.</p>
                    </div>
                    <Button 
                        onClick={() => setIsPlannerOpen(true)}
                        className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-6 h-10 text-sm font-bold uppercase tracking-widest bauhaus-shadow bauhaus-border hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    >
                        <Plus className="size-4 mr-2" />
                        New Course
                    </Button>
                </div>
                
                {/* Search & Filter Bar */}
                <div className="flex gap-4 items-center w-full max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search courses..." 
                            className="rounded-none pl-9 border-border bg-card shadow-none h-10 font-medium" 
                        />
                    </div>
                    <Button variant="outline" className="rounded-none border-border shadow-none h-10 px-4 font-bold uppercase tracking-widest text-xs">
                        <Filter className="size-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </motion.div>

            {error && (
                <motion.div variants={itemVariants} className="text-xs font-semibold text-destructive bg-destructive/10 p-3 rounded-none border border-destructive/20 flex items-center justify-between gap-4">
                    <span>{error}</span>
                    <button onClick={() => loadCourses()} className="underline text-xs font-bold uppercase tracking-wider hover:no-underline shrink-0">Retry</button>
                </motion.div>
            )}

            {/* Recently Visited Section */}
            {!loading && recentCourses.length > 0 && searchQuery === "" && (
                <motion.div variants={itemVariants} className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center gap-2 text-bauhaus-blue">
                        <Clock className="size-5" />
                        <h2 className="text-xl font-heading font-bold uppercase tracking-tight">Recently Visited</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recentCourses.map(course => (
                            <div 
                                key={`recent-${course.id}`}
                                onClick={() => handleViewCourse(course.id)}
                                className="group cursor-pointer bg-bauhaus-blue text-white bauhaus-border p-5 flex flex-col gap-3 hover:bauhaus-shadow hover:-translate-y-1 hover:translate-x-1 transition-all"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-widest text-bauhaus-blue bg-white w-fit px-2 py-1">
                                    Last viewed {new Date(course.lastVisitedAt).toLocaleDateString()}
                                </span>
                                <h3 className="text-lg font-heading font-bold uppercase tracking-tight line-clamp-2">
                                    {course.title}
                                </h3>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Course List or Empty State */}
            <motion.div variants={itemVariants}>
                <h2 className="text-xl font-heading font-bold uppercase tracking-tight mb-4">All Courses</h2>
                {!loading && courses.length === 0 ? (
                    <Card className="bauhaus-border bg-card shadow-none rounded-none">
                        <CardContent className="p-12 text-center flex flex-col items-center gap-4">
                            <div className="size-12 bauhaus-border bg-bauhaus-yellow/20 flex items-center justify-center mb-2">
                                <BookOpen className="size-5 text-bauhaus-red" />
                            </div>
                            <div className="flex flex-col gap-1.5 max-w-md mx-auto">
                                <h2 className="text-xl font-heading font-bold uppercase tracking-tight text-foreground">No courses yet</h2>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                    Describe what you want to learn. Marko will generate a full structured curriculum with lessons and quizzes.
                                </p>
                            </div>
                            <Button
                                onClick={() => setIsPlannerOpen(true)}
                                className="rounded-none bg-bauhaus-blue text-white hover:bg-bauhaus-blue/90 text-xs font-bold uppercase tracking-widest px-8 h-10 mt-4 bauhaus-border hover:bauhaus-shadow hover:-translate-y-0.5 hover:translate-x-0.5 transition-all"
                            >
                                Create My First Course
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <CourseList
                        courses={filteredCourses}
                        loading={loading}
                        onViewCourse={handleViewCourse}
                        onDeleteCourse={handleDeleteCourse}
                    />
                )}
            </motion.div>

            {/* Dialog Form */}
            <PlannerForm
                isOpen={isPlannerOpen}
                onClose={() => setIsPlannerOpen(false)}
                onCourseCreated={handleCourseCreated}
            />
        </motion.div>
    );
}
