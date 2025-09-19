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

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [totalParked, setTotalParked] = useState(0);
    const [avgTime, setAvgTime] = useState("0h 0m");

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

            if (count > 0) {
                const now = new Date();
                const totalMinutes = snapshot.docs.reduce((acc, doc) => {
                    const entryTime = doc.data().entryTime?.toDate();
                    if (entryTime) {
                        return acc + differenceInMinutes(now, entryTime);
                    }
                    return acc;
                }, 0);
                const avgMinutes = totalMinutes / count;
                const hours = Math.floor(avgMinutes / 60);
                const minutes = Math.round(avgMinutes % 60);
                setAvgTime(`${hours}h ${minutes}m`);
            } else {
                setAvgTime("0h 0m");
            }
        });

        return () => unsubscribe();
    }, [user]);

    if (loading || !user) {
        return <div className="text-center">Loading...</div>;
    }

  return (
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
            <div className="text-2xl font-bold">{totalParked}</div>
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
            <div className="text-2xl font-bold">{avgTime}</div>
             <p className="text-xs text-muted-foreground">
              Based on currently parked vehicles
            </p>
          </CardContent>
        </Card>
      </div>
      
      <ActiveParking />

    </div>
  );
}
