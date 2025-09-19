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
import { activeTariff } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { differenceInSeconds } from 'date-fns';
import { db } from '@/lib/firebase';

interface PaymentModalProps {
  record: ParkingRecord;
  onClose: () => void;
  onPaymentSuccess: () => void;
  userId?: string; // The ID of the user whose record is being processed
}

export default function PaymentModal({ record, onClose, onPaymentSuccess, userId }: PaymentModalProps) {
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
    const secondsParked = differenceInSeconds(new Date(), new Date(record.entryTime));
    const hoursParked = secondsParked / 3600;
    const initialCost = hoursParked * activeTariff.pricePerHour;

    const pointsDiscount = pointsToRedeem * 0.01; // Assuming 1 point = $0.01
    const finalAmount = Math.max(0, initialCost - pointsDiscount);

    return {
      hoursParked: hoursParked.toFixed(2),
      initialCost: initialCost.toFixed(2),
      pointsDiscount: pointsDiscount.toFixed(2),
      finalAmount: parseFloat(finalAmount.toFixed(2)),
      pointsEarned: Math.floor(hoursParked * 10),
    };
  }, [record.entryTime, pointsToRedeem]);

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
            description: "Cannot process payment without a user context.",
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
            title: "Payment Successful",
            description: `Payment for ${record.plate} processed. Total: $${costDetails.finalAmount.toFixed(2)}. Points earned: ${costDetails.pointsEarned}.`,
        });

    } catch (error) {
        console.error("Error processing payment: ", error);
        toast({
            variant: "destructive",
            title: "Payment Failed",
            description: "Could not update the parking record or loyalty points.",
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
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>
            For vehicle with plate <span className="font-semibold font-code">{record.plate}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between"><span>Parking Duration:</span> <span>{costDetails.hoursParked} hours</span></div>
              <div className="flex justify-between"><span>Calculated Cost:</span> <span className="font-semibold">${costDetails.initialCost}</span></div>
               <div className="flex justify-between text-sm text-muted-foreground"><span>Points to be Earned:</span> <span>{costDetails.pointsEarned}</span></div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 space-y-4">
               <div className="flex justify-between items-center">
                   <Label>Available Loyalty Points:</Label>
                   <span className="font-bold text-lg text-primary">{availablePoints}</span>
               </div>
               <div className="space-y-2">
                   <Label htmlFor="points">Points to Redeem</Label>
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
            <div className="flex justify-between"><span>Points Discount:</span> <span className="text-green-600">-${costDetails.pointsDiscount}</span></div>
            <div className="flex justify-between font-bold"><span>Total Due:</span> <span>${costDetails.finalAmount.toFixed(2)}</span></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handlePayment} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
