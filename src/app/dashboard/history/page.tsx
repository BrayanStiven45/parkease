'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ParkingHistoryTable from "@/components/history/parking-history-table";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import type { ParkingRecord } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";

export default function HistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [historyRecords, setHistoryRecords] = useState<ParkingRecord[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;

        setIsLoadingData(true);
        const parkingRecordsCollection = collection(db, 'users', user.uid, 'parkingRecords');
        // Se elimina orderBy para evitar el requerimiento de un índice compuesto.
        // La ordenación se hará en el cliente.
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

            // Ordenar los registros por fecha de salida descendente en el cliente.
            fetchedRecords.sort((a, b) => 
                new Date(b.exitTime ?? 0).getTime() - new Date(a.exitTime ?? 0).getTime()
            );

            setHistoryRecords(fetchedRecords);
            setIsLoadingData(false);
        }, (error) => {
            console.error("Error fetching history records: ", error);
            setIsLoadingData(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (authLoading || !user) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Completed Parking Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <ParkingHistoryTable records={historyRecords} isLoading={isLoadingData} />
                </CardContent>
            </Card>
        </div>
    );
}
