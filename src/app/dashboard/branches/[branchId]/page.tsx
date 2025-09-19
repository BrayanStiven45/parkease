'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { Car, Clock, ArrowLeft } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ActiveParking from '@/components/dashboard/active-parking';
import { Button } from '@/components/ui/button';

interface BranchData {
    email: string;
    // Agrega aquí más campos si los tienes en firestore
}

export default function BranchDetailPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const branchId = params.branchId as string;

    const [branchData, setBranchData] = useState<BranchData | null>(null);
    const [dashboardMetrics, setDashboardMetrics] = useState({
        totalParked: 0,
        avgTime: '0h 0m',
    });
    const [loading, setLoading] = useState(true);

    // Redirigir si no es admin
    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, authLoading, router]);

    // Obtener datos iniciales de la sucursal
    useEffect(() => {
        if (isAdmin && branchId) {
            const fetchBranchData = async () => {
                setLoading(true);
                const userDocRef = doc(db, 'users', branchId);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setBranchData(userDoc.data() as BranchData);
                } else {
                    // Manejar el caso de que la sucursal no exista
                    router.push('/dashboard/branches');
                }
                setLoading(false);
            };
            fetchBranchData();
        }
    }, [isAdmin, branchId, router]);

    // Simular actualización de datos en tiempo real
    useEffect(() => {
        if (!isAdmin) return;

        const interval = setInterval(() => {
            // En una app real, aquí harías una llamada para obtener datos frescos
            setDashboardMetrics({
                totalParked: Math.floor(Math.random() * 50),
                avgTime: `${Math.floor(Math.random() * 3)}h ${Math.floor(Math.random() * 60)}m`,
            });
        }, 2000); // Actualiza cada 2 segundos

        return () => clearInterval(interval);
    }, [isAdmin]);


    if (authLoading || loading) {
        return <div className="text-center">Loading Branch Dashboard...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={() => router.push('/dashboard/branches')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Sucursales
            </Button>
            <h1 className="text-3xl font-bold">Dashboard Sucursal: <span className="text-primary">{branchData?.email}</span></h1>

             <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Vehicles Currently Parked
                        </CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardMetrics.totalParked}</div>
                        <p className="text-xs text-muted-foreground">
                        Live count of vehicles in the parking lot
                        </p>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Average Parking Time
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardMetrics.avgTime}</div>
                        <p className="text-xs text-muted-foreground">
                        Based on currently parked vehicles
                        </p>
                    </CardContent>
                    </Card>
                </div>
                {/* Aquí podrías mostrar la tabla de parqueos activos de esa sucursal */}
                 <Card>
                    <CardHeader>
                        <CardTitle>Active Parking (Simulated for {branchData?.email})</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-center text-muted-foreground p-8">
                            Live parking data for this branch would be displayed here.
                       </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
