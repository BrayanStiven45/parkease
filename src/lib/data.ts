import type { ParkingRecord, LoyaltyAccount, Tariff } from './types';

export const activeTariff: Tariff = {
  id: 1,
  name: 'Standard Rate',
  pricePerHour: 2.5,
};

export const initialParkingRecords: ParkingRecord[] = [
  { id: 1, plate: 'ABC-123', entryTime: new Date(Date.now() - 3600 * 1000 * 2.5).toISOString(), status: 'parked' },
  { id: 2, plate: 'XYZ-789', entryTime: new Date(Date.now() - 3600 * 1000 * 1).toISOString(), status: 'parked' },
  { id: 3, plate: 'DEF-456', entryTime: new Date(Date.now() - 3600 * 1000 * 0.5).toISOString(), status: 'parked' },
  { id: 4, plate: 'GHI-101', entryTime: new Date(Date.now() - 3600 * 1000 * 5).toISOString(), status: 'parked' },
];

export const completedParkingRecords: ParkingRecord[] = [
    { id: 101, plate: 'OLD-001', entryTime: '2023-10-26T10:00:00Z', exitTime: '2023-10-26T12:30:00Z', status: 'completed', totalCost: 6.25 },
    { id: 102, plate: 'OLD-002', entryTime: '2023-10-26T11:00:00Z', exitTime: '2023-10-26T11:45:00Z', status: 'completed', totalCost: 1.88 },
];

export const loyaltyAccounts: LoyaltyAccount[] = [
  { plate: 'ABC-123', points: 150 },
  { plate: 'XYZ-789', points: 25 },
  { plate: 'GHI-101', points: 500 },
];

export const getLoyaltyPoints = (plate: string): number => {
  return loyaltyAccounts.find(acc => acc.plate === plate)?.points ?? 0;
};
