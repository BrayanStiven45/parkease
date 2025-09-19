import type { ParkingRecord, LoyaltyAccount, Tariff, Branch } from './types';

export const activeTariff: Tariff = {
  id: 1,
  name: 'Standard Rate',
  pricePerHour: 2.5,
};

// This is now empty, data will be fetched from Firestore.
export const initialParkingRecords: ParkingRecord[] = [];

export const completedParkingRecords: ParkingRecord[] = [
    { id: '101', plate: 'OLD-001', entryTime: '2023-10-26T10:00:00Z', exitTime: '2023-10-26T12:30:00Z', status: 'completed', totalCost: 6.25 },
    { id: '102', plate: 'OLD-002', entryTime: '2023-10-26T11:00:00Z', exitTime: '2023-10-26T11:45:00Z', status: 'completed', totalCost: 1.88 },
];

export const loyaltyAccounts: LoyaltyAccount[] = [
  { plate: 'ABC-123', points: 150 },
  { plate: 'XYZ-789', points: 25 },
  { plate: 'GHI-101', points: 500 },
];

export const getLoyaltyPoints = (plate: string): number => {
  return loyaltyAccounts.find(acc => acc.plate === plate)?.points ?? 0;
};

export const branches: Branch[] = [
    { id: 'branch-1', name: 'Downtown Central', location: '123 Main St, Metropolis', totalSpots: 250, occupiedSpots: 180, revenue: 1250.75 },
    { id: 'branch-2', name: 'Airport Lot B', location: '456 Airport Rd, Skyville', totalSpots: 500, occupiedSpots: 450, revenue: 3800.50 },
    { id: 'branch-3', name: 'Uptown Plaza', location: '789 Oak Ave, Greenville', totalSpots: 150, occupiedSpots: 95, revenue: 850.00 },
];
