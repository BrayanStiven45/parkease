'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import type { ParkingRecord } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import ActiveParkingTable from './active-parking-table';
import VehicleEntryModal from './vehicle-entry-modal';
import PaymentModal from './payment-modal';
import { useToast } from '@/hooks/use-toast';

export default function ActiveParking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEntryModalOpen, setEntryModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const parkingRecordsCollection = collection(db, 'users', user.uid, 'parkingRecords');
    const q = query(parkingRecordsCollection, where('status', '==', 'parked'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedRecords = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          entryTime: doc.data().entryTime?.toDate().toISOString(), // Convert Firestore Timestamp to ISO string
        })) as ParkingRecord[];

        // Sort records here instead of in the query
        fetchedRecords.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
        
        setRecords(fetchedRecords);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching parking records:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch parking records.',
        });
        setIsLoading(false);
      }
    );

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [user, toast]);

  const handleOpenPaymentModal = (record: ParkingRecord) => {
    setSelectedRecord(record);
  };

  const handleClosePaymentModal = () => {
    setSelectedRecord(null);
  };

  const handleAddRecord = async (plate: string) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to add a record.',
      });
      return;
    }

    try {
      const parkingRecordsCollection = collection(db, 'users', user.uid, 'parkingRecords');
      await addDoc(parkingRecordsCollection, {
        plate,
        entryTime: serverTimestamp(),
        status: 'parked',
      });
      toast({
        title: 'Success',
        description: `Vehicle with plate ${plate} has been registered.`,
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add new parking record.',
      });
    }
  };
  
  const handlePaymentSuccess = (recordId: string) => {
    // This will be implemented later.
    // For now, we just close the modal.
    handleClosePaymentModal();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Parking</CardTitle>
          <Button size="sm" onClick={() => setEntryModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Record Entry
          </Button>
        </CardHeader>
        <CardContent>
          <ActiveParkingTable records={records} onProcessPayment={handleOpenPaymentModal} isLoading={isLoading} />
        </CardContent>
      </Card>

      <VehicleEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setEntryModalOpen(false)}
        onAddRecord={handleAddRecord}
      />

      {selectedRecord && (
        <PaymentModal
          record={selectedRecord}
          onClose={handleClosePaymentModal}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
