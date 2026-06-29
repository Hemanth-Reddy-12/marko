import { CourseCard } from "./CourseCard";
import type { Course } from "./CourseCard";
import { BookOpen } from "lucide-react";
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
                    <Card key={i} className="bg-white border border-zinc-200/80 shadow-none rounded-xl overflow-hidden h-[180px]">
                        <CardContent className="p-5 flex flex-col justify-between h-full gap-4 animate-pulse">
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <div className="h-3 w-12 bg-zinc-100 rounded" />
                                    <div className="h-4.5 w-16 bg-zinc-100 rounded-full" />
                                </div>
                                <div className="h-5 w-3/4 bg-zinc-100 rounded" />
                                <div className="flex flex-col gap-1">
                                    <div className="h-3.5 w-full bg-zinc-100 rounded" />
                                    <div className="h-3.5 w-5/6 bg-zinc-100 rounded" />
                                </div>
                            </div>
                            <div className="h-3 w-full bg-zinc-100 rounded" />
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
