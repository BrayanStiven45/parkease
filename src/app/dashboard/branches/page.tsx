'use client';

import { BarChart, Car, DollarSign, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { branches } from "@/lib/data";
import { useAuth } from '@/contexts/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BranchesPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, loading, router]);


    if (loading) {
        return <div className="text-center">Loading...</div>;
    }
    
    if (!isAdmin) {
        return null;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Branches Overview</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {branches.map(branch => (
                    <Card key={branch.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {branch.name}
                            </CardTitle>
                             <p className="text-sm text-muted-foreground flex items-center gap-2 pt-1">
                                <MapPin className="h-4 w-4" /> {branch.location}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Occupancy</p>
                                    <p className="text-2xl font-bold">{branch.occupiedSpots} / {branch.totalSpots}</p>
                                </div>
                                <Car className="h-8 w-8 text-primary" />
                            </div>
                             <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Today's Revenue</p>
                                    <p className="text-2xl font-bold">${branch.revenue.toFixed(2)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
