import RateSuggesterForm from "@/components/rate-suggester/rate-suggester-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RateSuggesterPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>AI-Powered Rate Suggester</CardTitle>
                    <CardDescription>
                        Use our AI tool to get optimal pricing suggestions based on entry time, duration, and historical patterns.
                    </CardDescription>
                </CardHeader>
            </Card>
            <RateSuggesterForm />
        </div>
    );
}
