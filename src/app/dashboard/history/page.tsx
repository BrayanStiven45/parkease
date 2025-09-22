'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, getDocs, collectionGroup } from 'firebase/firestore';
import { isSameDay } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ParkingHistoryTable from "@/components/history/parking-history-table";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import type { ParkingRecord } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";

export default function HistoryPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [historyRecords, setHistoryRecords] = useState<ParkingRecord[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    const fetchAdminHistory = useCallback(async () => {
        if (!isAdmin) return;
        setIsLoadingData(true);

        // 1. Get all branch users to map UID to parking lot name
        const usersQuery = query(collection(db, 'users'), where('email', '!=', 'admin@parkease.com'));
        const usersSnapshot = await getDocs(usersQuery);
        const branchesMap = new Map<string, string>();
        usersSnapshot.forEach(doc => {
            branchesMap.set(doc.id, doc.data().parkingLotName || doc.data().email);
        });

        // 2. Use a collectionGroup query to get all completed records from all branches
        const recordsQuery = query(collectionGroup(db, 'parkingRecords'), where('status', '==', 'completed'));
        
        const unsubscribe = onSnapshot(recordsQuery, (snapshot) => {
            const fetchedRecords = snapshot.docs.map(doc => {
                const data = doc.data();
                const userId = doc.ref.parent.parent?.id; // Get the user ID from the path
                return {
                    id: doc.id,
                    ...data,
                    entryTime: (data.entryTime as Timestamp)?.toDate().toISOString(),
                    exitTime: (data.exitTime as Timestamp)?.toDate().toISOString(),
                    parkingLotName: userId ? branchesMap.get(userId) : 'Sucursal Desconocida',
                } as ParkingRecord;
            });

            fetchedRecords.sort((a, b) => 
                new Date(b.exitTime ?? 0).getTime() - new Date(a.exitTime ?? 0).getTime()
            );

            setHistoryRecords(fetchedRecords);
            setIsLoadingData(false);
        }, (error) => {
            console.error("Error fetching admin history records: ", error);
            setIsLoadingData(false);
        });

        return unsubscribe;

    }, [isAdmin]);

    const fetchUserHistory = useCallback(() => {
        if (!user || isAdmin) return;

        setIsLoadingData(true);
        const parkingRecordsCollection = collection(db, 'users', user.uid, 'parkingRecords');
        const q = query(
            parkingRecordsCollection, 
            where('status', '==', 'completed')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
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
            setIsLoadingData(false);
        }, (error) => {
            console.error("Error fetching user history records: ", error);
            setIsLoadingData(false);
        });

        return unsubscribe;
    }, [user, isAdmin]);


    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        if (authLoading || !user) return;

        if (isAdmin) {
            fetchAdminHistory().then(unsub => {
                if (unsub) unsubscribe = unsub;
            });
        } else {
            unsubscribe = fetchUserHistory();
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user, isAdmin, authLoading, fetchAdminHistory, fetchUserHistory]);

    const filteredRecords = useMemo(() => {
        return historyRecords.filter(record => {
            const plateMatch = record.plate.toLowerCase().includes(searchQuery.toLowerCase());
            const dateMatch = selectedDate ? isSameDay(new Date(record.entryTime), selectedDate) : true;
            return plateMatch && dateMatch;
        });
    }, [historyRecords, searchQuery, selectedDate]);

    if (authLoading || !user) {
        return <div className="text-center">Cargando...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Registros de Estacionamiento Completados</CardTitle>
                </CardHeader>
                <CardContent>
                    <ParkingHistoryTable 
                        records={filteredRecords} 
                        isLoading={isLoadingData}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        hasActiveFilters={searchQuery.length > 0 || !!selectedDate}
                        isAdmin={isAdmin}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
