import { CourseCard } from "./CourseCard";
import type { Course } from "./CourseCard";
import { Card, CardContent } from "@/components/ui/card";

interface CourseListProps {
    courses: Course[];
    loading: boolean;
    onViewCourse: (courseId: string) => void;
    onDeleteCourse?: (courseId: string) => void;
}

export function CourseList({ courses, loading, onViewCourse, onDeleteCourse }: CourseListProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="bg-card border border-border shadow-none rounded-none overflow-hidden h-[180px]">
                        <CardContent className="p-5 flex flex-col justify-between h-full gap-4 animate-pulse">
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <div className="h-3 w-12 bg-muted rounded-none" />
                                    <div className="h-4 w-16 bg-muted rounded-none" />
                                </div>
                                <div className="h-5 w-3/4 bg-muted rounded-none" />
                                <div className="flex flex-col gap-2">
                                    <div className="h-3 w-full bg-muted rounded-none" />
                                    <div className="h-3 w-5/6 bg-muted rounded-none" />
                                </div>
                            </div>
                            <div className="h-1 w-full bg-muted rounded-none" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return null; // Empty state handled by parent DashboardPage
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
                <CourseCard 
                    key={course.id} 
                    course={course} 
                    onViewCourse={onViewCourse} 
                    onDeleteCourse={onDeleteCourse}
                />
            ))}
        </div>
    );
}
