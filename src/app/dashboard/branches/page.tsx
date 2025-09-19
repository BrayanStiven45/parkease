'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { completedParkingRecords, loyaltyAccounts } from "@/lib/data";
import { useAuth } from '@/contexts/auth-context';

// Mapeamos los usuarios registrados como sucursales para la demo
const registeredUsersAsBranches = loyaltyAccounts.map((account, index) => ({
    id: `user-${index + 1}`,
    email: `${account.plate.toLowerCase()}@example.com`, // Email simulado
    location: "Ubicación Desconocida",
    totalSpots: 100, // Dato de ejemplo
    occupiedSpots: completedParkingRecords.filter(r => r.plate === account.plate).length, // Dato de ejemplo
    revenue: completedParkingRecords
        .filter(r => r.plate === account.plate)
        .reduce((sum, r) => sum + (r.totalCost || 0), 0), // Dato de ejemplo
}));


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
        return null; // O un mensaje de "Acceso denegado"
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Gestión de Sucursales (Usuarios Registrados)</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {registeredUsersAsBranches.map(branch => (
                    <Card key={branch.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {branch.email}
                            </CardTitle>
                             <p className="text-sm text-muted-foreground flex items-center gap-2 pt-1">
                                <MapPin className="h-4 w-4" /> {branch.location}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total de Ingresos Registrados</p>
                                    <p className="text-2xl font-bold">${branch.revenue.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
