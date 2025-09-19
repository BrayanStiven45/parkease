'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { User as LucideUser, DollarSign, ParkingCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { Terminal } from 'lucide-react';

interface BranchInfo {
    uid: string;
    email: string | null;
    occupiedSpots: number;
    totalSpots: number; // For now, this is a static value
    revenue: number;
}

export default function BranchesPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [branches, setBranches] = useState<BranchInfo[]>([]);
    const [isLoadingBranches, setIsLoadingBranches] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, loading, router]);

    useEffect(() => {
        if (isAdmin && user) {
            setIsLoadingBranches(true);
            setError(null);
            
            const usersCollection = collection(db, 'users');
            const q = query(usersCollection, where('email', '!=', user.email));

            const unsubscribe = onSnapshot(q, (usersSnapshot) => {
                const promises = usersSnapshot.docs.map(async (doc) => {
                    const userData = doc.data();
                    const userId = doc.id;
                    
                    const parkingRecordsRef = collection(db, 'users', userId, 'parkingRecords');

                    // Get occupied spots
                    const parkedQuery = query(parkingRecordsRef, where('status', '==', 'parked'));
                    const parkedSnapshot = await getDocs(parkedQuery);
                    const occupiedSpots = parkedSnapshot.size;

                    // Get total revenue
                    const completedQuery = query(parkingRecordsRef, where('status', '==', 'completed'));
                    const completedSnapshot = await getDocs(completedQuery);
                    const revenue = completedSnapshot.docs.reduce((acc, doc) => acc + (doc.data().totalCost || 0), 0);

                    return {
                        uid: userId,
                        email: userData.email,
                        occupiedSpots,
                        totalSpots: 100, // Static value for now
                        revenue,
                    };
                });

                Promise.all(promises).then(usersList => {
                    setBranches(usersList);
                    setIsLoadingBranches(false);
                }).catch(e => {
                     console.error("Error fetching branch details:", e);
                     setError("Failed to load branch details.");
                     setIsLoadingBranches(false);
                });

            }, (e) => {
                console.error("Error fetching branches:", e);
                setError("Failed to load branches. Please check the console for more details.");
                setIsLoadingBranches(false);
            });

            return () => unsubscribe();
        }
    }, [isAdmin, user]);

    if (loading || isLoadingBranches) {
        return <div className="text-center">Loading...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    const handleBranchClick = (branchId: string) => {
        router.push(`/dashboard/branches/${branchId}`);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Gestión de Sucursales</h1>
             {error && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {branches.length > 0 ? (
                    branches.map(branch => (
                        <Card key={branch.uid} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleBranchClick(branch.uid)}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LucideUser className="h-5 w-5" />
                                    {branch.email}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign className="h-4 w-4" /> Ingresos Totales</p>
                                        <p className="text-xl font-bold">${branch.revenue.toFixed(2)}</p>
                                    </div>
                                </div>
                                 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1"><ParkingCircle className="h-4 w-4" /> Ocupación</p>
                                        <p className="text-xl font-bold">{branch.occupiedSpots} / {branch.totalSpots}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                     !error && (
                        <Card className="md:col-span-2 lg:col-span-3">
                            <CardContent className="pt-6">
                                <p className="text-center text-muted-foreground">No se han encontrado otras sucursales registradas.</p>
                            </CardContent>
                        </Card>
                    )
                )}
            </div>
        </div>
    );
}
