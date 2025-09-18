'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { completedParkingRecords } from "@/lib/data";
import ParkingHistoryTable from "@/components/history/parking-history-table";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Completed Parking Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <ParkingHistoryTable records={completedParkingRecords} />
                </CardContent>
            </Card>
        </div>
    );
}
