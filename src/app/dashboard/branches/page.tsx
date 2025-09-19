
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { User as LucideUser, MapPin, DollarSign, ParkingCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import type { User } from 'firebase/auth';

// Extendemos el tipo User de Firebase para incluir cualquier dato adicional que almacenemos
interface AppUser extends User {
    location?: string;
    totalSpots?: number;
    occupiedSpots?: number;
    revenue?: number;
}

export default function BranchesPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [branches, setBranches] = useState<AppUser[]>([]);
    const [isLoadingBranches, setIsLoadingBranches] = useState(true);

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, loading, router]);

    useEffect(() => {
        if (isAdmin && user) {
            const fetchBranches = async () => {
                setIsLoadingBranches(true);
                try {
                    const usersCollection = collection(db, 'users');
                    // Excluimos al admin de la lista de sucursales
                    const q = query(usersCollection, where("email", "!=", user.email));
                    const usersSnapshot = await getDocs(q);

                    const usersList = usersSnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            ...data,
                            uid: doc.id,
                            // Datos de ejemplo para la demo, en una app real vendrían de Firestore o se calcularían
                            location: "Ubicación Desconocida",
                            revenue: Math.random() * 2000,
                            occupiedSpots: Math.floor(Math.random() * 100),
                            totalSpots: 100,
                        } as AppUser;
                    });
                    setBranches(usersList);
                } catch (error) {
                    console.error("Error fetching branches:", error);
                } finally {
                    setIsLoadingBranches(false);
                }
            };
            fetchBranches();
        }
    }, [isAdmin, user]);

    if (loading || isLoadingBranches) {
        return <div className="text-center">Loading...</div>;
    }

    if (!isAdmin) {
        return null; // O un mensaje de "Acceso denegado"
    }

    const handleBranchClick = (branchId: string) => {
        router.push(`/dashboard/branches/${branchId}`);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Gestión de Sucursales</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {branches.length > 0 ? (
                    branches.map(branch => (
                        <Card key={branch.uid} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleBranchClick(branch.uid)}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LucideUser className="h-5 w-5" />
                                    {branch.email}
                                </CardTitle>
                                 <p className="text-sm text-muted-foreground flex items-center gap-2 pt-1">
                                    <MapPin className="h-4 w-4" /> {branch.location}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign className="h-4 w-4" /> Ingresos Totales</p>
                                        <p className="text-xl font-bold">${branch.revenue?.toFixed(2) ?? '0.00'}</p>
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
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardContent className="pt-6">
                            <p className="text-center text-muted-foreground">No se han encontrado otras sucursales registradas.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
