'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, getDocs, doc, setDoc } from 'firebase/firestore';
import type { ParkingRecord } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import ActiveParkingTable from './active-parking-table';
import VehicleEntryModal from './vehicle-entry-modal';
import PaymentModal from './payment-modal';
import { useToast } from '@/hooks/use-toast';

interface ActiveParkingProps {
  branchId?: string; // Admin can pass a branchId to view its data
  readOnly?: boolean; // Admin view is read-only
}

export default function ActiveParking({ branchId, readOnly = false }: ActiveParkingProps) {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ParkingRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEntryModalOpen, setEntryModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null);
  const [paymentInitiatedAt, setPaymentInitiatedAt] = useState<Date | null>(null);


  const targetUserId = branchId || user?.uid;
  const hourlyCost = userData?.hourlyCost ?? 0;

  useEffect(() => {
    if (!targetUserId) return;

    setIsLoading(true);
    const parkingRecordsCollection = collection(db, 'users', targetUserId, 'parkingRecords');
    const q = query(parkingRecordsCollection, where('status', '==', 'parked'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedRecords = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          entryTime: doc.data().entryTime?.toDate().toISOString(),
        })) as ParkingRecord[];

        fetchedRecords.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
        
        setRecords(fetchedRecords);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching parking records:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron obtener los registros de estacionamiento.',
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [targetUserId, toast]);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = records.filter(record => 
      record.plate.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredRecords(filtered);
  }, [searchQuery, records]);

  const handleOpenPaymentModal = (record: ParkingRecord) => {
    if (readOnly) return;
    setPaymentInitiatedAt(new Date()); // Freeze time
    setSelectedRecord(record);
  };

  const handleClosePaymentModal = () => {
    setSelectedRecord(null);
    setPaymentInitiatedAt(null);
  };

  const handleAddRecord = async (plate: string) => {
    if (!targetUserId || readOnly) return;

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error de Autenticación',
        description: 'Debes iniciar sesión para agregar un registro.',
      });
      return;
    }

    try {
      // Check if plate exists and create it if it doesn't
      const plateRef = doc(db, 'plates', plate);
      const plateSnap = await getDocs(query(collection(db, 'plates'), where('plate', '==', plate)));

      if (plateSnap.empty) {
        await setDoc(plateRef, {
          plate: plate,
          puntos: 0,
          createdAt: serverTimestamp(),
        });
        toast({
          title: 'Nueva Placa Registrada',
          description: `La placa ${plate} ha sido agregada al sistema de lealtad.`,
        });
      }

      const parkingRecordsCollection = collection(db, 'users', targetUserId, 'parkingRecords');
      await addDoc(parkingRecordsCollection, {
        plate,
        entryTime: serverTimestamp(),
        status: 'parked',
      });
      toast({
        title: 'Éxito',
        description: `El vehículo con placa ${plate} ha sido registrado.`,
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo agregar el nuevo registro de estacionamiento.',
      });
    }
  };
  
  const handlePaymentSuccess = () => {
    handleClosePaymentModal();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Estacionamiento Activo</CardTitle>
            <div className="flex w-full sm:w-auto flex-col sm:flex-row sm:items-center gap-2">
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por placa..."
                        className="pl-8 sm:w-[200px] lg:w-[250px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {!readOnly && (
                  <Button size="sm" onClick={() => setEntryModalOpen(true)} className="w-full sm:w-auto">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Registrar Entrada
                  </Button>
                )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ActiveParkingTable 
            records={filteredRecords} 
            onProcessPayment={handleOpenPaymentModal} 
            isLoading={isLoading}
            hasSearchQuery={searchQuery.length > 0}
            readOnly={readOnly}
            paymentInitiatedAt={paymentInitiatedAt}
            selectedRecordId={selectedRecord?.id || null}
            />
        </CardContent>
      </Card>

      {!readOnly && (
        <>
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
              userId={targetUserId}
              hourlyCost={hourlyCost}
              paymentInitiatedAt={paymentInitiatedAt!}
            />
          )}
        </>
      )}
    </>
  );
}
