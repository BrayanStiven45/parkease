'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Car, Clock, ArrowLeft } from 'lucide-react';
import { differenceInMinutes, isSameDay } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ActiveParking from '@/components/dashboard/active-parking';
import { Button } from '@/components/ui/button';
import type { ParkingRecord } from '@/lib/types';
import ParkingHistoryTable from '@/components/history/parking-history-table';

interface BranchData {
    email: string;
}

export default function BranchDetailPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const branchId = params.branchId as string;

    const [branchData, setBranchData] = useState<BranchData | null>(null);
    const [totalParked, setTotalParked] = useState(0);
    const [avgTime, setAvgTime] = useState("0h 0m");
    const [entryTimes, setEntryTimes] = useState<Date[]>([]);
    const [loading, setLoading] = useState(true);

    const [historyRecords, setHistoryRecords] = useState<ParkingRecord[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, authLoading, router]);

    useEffect(() => {
        if (isAdmin && branchId) {
            const fetchBranchData = async () => {
                setLoading(true);
                const userDocRef = doc(db, 'users', branchId);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setBranchData(userDoc.data() as BranchData);
                } else {
                    router.push('/dashboard/branches');
                }
                setLoading(false);
            };
            fetchBranchData();
        }
    }, [isAdmin, branchId, router]);

    useEffect(() => {
        if (!isAdmin || !branchId) return;

        // Fetch active parking records
        const parkingRecordsCollection = collection(db, 'users', branchId, 'parkingRecords');
        const activeQuery = query(parkingRecordsCollection, where('status', '==', 'parked'));

        const unsubscribeActive = onSnapshot(activeQuery, (snapshot) => {
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

        // Fetch completed history records
        setIsLoadingHistory(true);
        const historyQuery = query(parkingRecordsCollection, where('status', '==', 'completed'));
        const unsubscribeHistory = onSnapshot(historyQuery, (snapshot) => {
             const fetchedRecords = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                entryTime: (doc.data().entryTime as Timestamp)?.toDate().toISOString(),
                exitTime: (doc.data().exitTime as Timestamp)?.toDate().toISOString(),
            })) as ParkingRecord[];

            fetchedRecords.sort((a, b) => 
                new Date(b.exitTime ?? 0).getTime() - new Date(a.exitTime ?? 0).getTime()
            );

            setHistoryRecords(fetchedRecords);
            setIsLoadingHistory(false);
        });


        return () => {
            unsubscribeActive();
            unsubscribeHistory();
        };
    }, [isAdmin, branchId]);

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

        calculateAvgTime();
        const intervalId = setInterval(calculateAvgTime, 1000);
        return () => clearInterval(intervalId);
    }, [entryTimes]);

     const filteredRecords = useMemo(() => {
        return historyRecords.filter(record => {
            const plateMatch = record.plate.toLowerCase().includes(searchQuery.toLowerCase());
            const dateMatch = selectedDate ? isSameDay(new Date(record.entryTime), selectedDate) : true;
            return plateMatch && dateMatch;
        });
    }, [historyRecords, searchQuery, selectedDate]);


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
                {branchId && <ActiveParking branchId={branchId} readOnly={true} />}

                 <Card>
                    <CardHeader>
                        <CardTitle>Completed Parking Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ParkingHistoryTable 
                            records={filteredRecords} 
                            isLoading={isLoadingHistory}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            hasActiveFilters={searchQuery.length > 0 || !!selectedDate}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
