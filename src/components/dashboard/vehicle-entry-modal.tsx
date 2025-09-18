'use client';

import { useState } from 'react';
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

interface VehicleEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (plate: string) => void;
}

export default function VehicleEntryModal({ isOpen, onClose, onAddRecord }: VehicleEntryModalProps) {
  const [plate, setPlate] = useState('');

  const handleSubmit = () => {
    if (plate.trim()) {
      onAddRecord(plate.trim().toUpperCase());
      setPlate('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Vehicle Entry</DialogTitle>
          <DialogDescription>
            Enter the vehicle&apos;s license plate to start a new parking session.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plate" className="text-right">
              Plate
            </Label>
            <Input
              id="plate"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="col-span-3"
              placeholder="e.g., ABC-123"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Confirm Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
