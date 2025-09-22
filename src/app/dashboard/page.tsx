"use client";

import { Car, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ActiveParking from '@/components/dashboard/active-parking';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { differenceInMinutes } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

export default function DashboardPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [totalParked, setTotalParked] = useState(0);
    const [avgTime, setAvgTime] = useState("0h 0m");
    const [entryTimes, setEntryTimes] = useState<Date[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;

        const parkingRecordsCollection = collection(db, 'users', user.uid, 'parkingRecords');
        const q = query(parkingRecordsCollection, where('status', '==', 'parked'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const count = snapshot.size;
            setTotalParked(count);

            const times = snapshot.docs
                .map(doc => {
                    const entryTime = (doc.data().entryTime as Timestamp)?.toDate();
                    return entryTime instanceof Date && !isNaN(entryTime.getTime()) ? entryTime : null;
                })
                .filter((time): time is Date => time !== null);
            
            setEntryTimes(times);
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        const calculateAvgTime = () => {
            if (entryTimes.length > 0) {
                const now = new Date();
                const totalMinutes = entryTimes.reduce((acc, entryTime) => {
                    return acc + differenceInMinutes(now, entryTime);
                }, 0);

                const avgMinutes = totalMinutes / entryTimes.length;
                const hours = Math.floor(avgMinutes / 60);
                const minutes = Math.round(avgMinutes % 60);
                setAvgTime(`${hours}h ${minutes}m`);
            } else {
                setAvgTime("0h 0m");
            }
        };

        calculateAvgTime(); // Calculate once initially

        const intervalId = setInterval(calculateAvgTime, 1000); // Recalculate every second

        return () => clearInterval(intervalId);
    }, [entryTimes]);

    if (loading || !user) {
        return <div className="text-center">Cargando...</div>;
    }

  return (
    <div className="space-y-6">
       {userData?.parkingLotName && (
            <h1 className="text-2xl font-bold text-foreground">
                {userData.parkingLotName}
            </h1>
        )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vehículos Estacionados Actualmente
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParked}</div>
            <p className="text-xs text-muted-foreground">
              Conteo en vivo de vehículos en el estacionamiento
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Promedio de Estacionamiento
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTime}</div>
             <p className="text-xs text-muted-foreground">
              Basado en los vehículos estacionados actualmente
            </p>
          </CardContent>
        </Card>
      </div>
      
      <ActiveParking />

    </div>
  );
}
