
'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, updateDoc, serverTimestamp, getDoc, increment } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ParkingRecord } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { differenceInSeconds } from 'date-fns';
import { db } from '@/lib/firebase';

interface PaymentModalProps {
  record: ParkingRecord;
  onClose: () => void;
  onPaymentSuccess: () => void;
  userId?: string; // The ID of the user whose record is being processed
  hourlyCost: number;
  paymentInitiatedAt: Date;
}

export default function PaymentModal({ 
  record, 
  onClose, 
  onPaymentSuccess, 
  userId, 
  hourlyCost,
  paymentInitiatedAt
}: PaymentModalProps) {
  const { toast } = useToast();
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPoints = async () => {
      const plateRef = doc(db, 'plates', record.plate);
      const plateSnap = await getDoc(plateRef);
      if (plateSnap.exists()) {
        setAvailablePoints(plateSnap.data().puntos || 0);
      }
    };
    fetchPoints();
  }, [record.plate]);

  const costDetails = useMemo(() => {
    const secondsParked = differenceInSeconds(paymentInitiatedAt, new Date(record.entryTime));
    const minutesParked = secondsParked / 60;
    const hoursParked = secondsParked / 3600;
    const initialCost = hoursParked * hourlyCost;

    const pointsDiscount = pointsToRedeem * 40; // Assuming 1 point = $0.01
    const finalAmount = Math.max(0, initialCost - pointsDiscount);

    return {
      hoursParked: hoursParked.toFixed(2),
      initialCost: initialCost.toFixed(2),
      pointsDiscount: pointsDiscount.toFixed(2),
      finalAmount: parseFloat(finalAmount.toFixed(2)),
      pointsEarned: Math.floor(hoursParked * 10), // 1 point per minute
    };
  }, [record.entryTime, pointsToRedeem, hourlyCost, paymentInitiatedAt]);

  const handleRedeemPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
        setPointsToRedeem(0);
    } else if (value >= 0 && value <= availablePoints) {
        setPointsToRedeem(value);
    }
  };

  const handlePayment = async () => {
    if (!userId) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se puede procesar el pago sin un contexto de usuario.",
        });
        return;
    }
    
    setIsLoading(true);

    try {
        const recordRef = doc(db, 'users', userId, 'parkingRecords', record.id);
        const plateRef = doc(db, 'plates', record.plate);

        // Update parking record
        await updateDoc(recordRef, {
            status: 'completed',
            exitTime: serverTimestamp(),
            totalCost: costDetails.finalAmount,
        });

        // Update loyalty points
        const pointsChange = costDetails.pointsEarned - pointsToRedeem;
        await updateDoc(plateRef, {
            puntos: increment(pointsChange)
        });

        onPaymentSuccess();
        toast({
            title: "Pago Exitoso",
            description: `Pago para ${record.plate} procesado. Total: $${costDetails.finalAmount.toFixed(2)}. Puntos ganados: ${costDetails.pointsEarned}.`,
        });

    } catch (error) {
        console.error("Error processing payment: ", error);
        toast({
            variant: "destructive",
            title: "Pago Fallido",
            description: "No se pudo actualizar el registro de estacionamiento o los puntos de lealtad.",
        });
    } finally {
        setIsLoading(false);
        onClose(); // Close modal on success or failure
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Procesar Pago</DialogTitle>
          <DialogDescription>
            Para vehículo con placa <span className="font-semibold font-code">{record.plate}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between"><span>Duración del Estacionamiento:</span> <span>{costDetails.hoursParked} horas</span></div>
              <div className="flex justify-between"><span>Costo Calculado:</span> <span className="font-semibold">${costDetails.initialCost}</span></div>
               <div className="flex justify-between text-sm text-muted-foreground"><span>Puntos a Ganar:</span> <span>{costDetails.pointsEarned}</span></div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 space-y-4">
               <div className="flex justify-between items-center">
                   <Label>Puntos de Lealtad Disponibles:</Label>
                   <span className="font-bold text-lg text-primary">{availablePoints}</span>
               </div>
               <div className="space-y-2">
                   <Label htmlFor="points">Puntos a Canjear</Label>
                   <Input 
                        id="points"
                        type="number"
                        value={pointsToRedeem}
                        onChange={handleRedeemPointsChange}
                        max={availablePoints}
                        min={0}
                   />
               </div>
            </CardContent>
          </Card>

          <Separator />
           
          <div className="space-y-2 text-lg">
            <div className="flex justify-between"><span>Descuento por Puntos:</span> <span className="text-green-600">-${costDetails.pointsDiscount}</span></div>
            <div className="flex justify-between font-bold"><span>Total a Pagar:</span> <span>${costDetails.finalAmount.toFixed(2)}</span></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handlePayment} disabled={isLoading}>
            {isLoading ? 'Procesando...' : 'Confirmar Pago'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
