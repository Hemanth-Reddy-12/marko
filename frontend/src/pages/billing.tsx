import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BillingPage() {
    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Billing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Manage your billing and subscriptions.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
