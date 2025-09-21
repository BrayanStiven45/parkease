'use client';
import RateSuggesterForm from "@/components/rate-suggester/rate-suggester-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RateSuggesterPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="w-full space-y-6">
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
