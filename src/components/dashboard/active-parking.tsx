'use client';

import { useState } from 'react';
import type { ParkingRecord } from '@/lib/types';
import { initialParkingRecords } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import ActiveParkingTable from './active-parking-table';
import VehicleEntryModal from './vehicle-entry-modal';
import PaymentModal from './payment-modal';

export default function ActiveParking() {
  const [records, setRecords] = useState<ParkingRecord[]>(initialParkingRecords);
  const [isEntryModalOpen, setEntryModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null);

  const handleOpenPaymentModal = (record: ParkingRecord) => {
    setSelectedRecord(record);
  };

  const handleClosePaymentModal = () => {
    setSelectedRecord(null);
  };

  const handleAddRecord = (plate: string) => {
    const newRecord: ParkingRecord = {
      id: Math.max(0, ...records.map(r => r.id)) + 1,
      plate,
      entryTime: new Date().toISOString(),
      status: 'parked',
    };
    setRecords(prev => [newRecord, ...prev]);
  };
  
  const handlePaymentSuccess = (recordId: number) => {
    setRecords(prev => prev.filter(r => r.id !== recordId));
    // In a real app, this would also add to history
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
          <ActiveParkingTable records={records} onProcessPayment={handleOpenPaymentModal} />
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
