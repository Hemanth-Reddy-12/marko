import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCards } from "@/components/dashboard/section-cards";
import { useState, useEffect } from "react";

import data from "@/app/dashboard/data.json";

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <SectionCards loading={loading} />
                    <div className="px-4 lg:px-6">
                        <ChartAreaInteractive loading={loading} />
                    </div>
                    <DataTable data={data} loading={loading} />
                </div>
            </div>
        </div>
    );
}
