export type ParkingRecord = {
  id: string; // Changed to string to match Firestore document IDs
  plate: string;
  entryTime: string;
  exitTime?: string;
  status: 'parked' | 'completed';
  totalCost?: number;
};

export type LoyaltyAccount = {
  plate: string;
  points: number;
};

export type Tariff = {
  id: number;
  name: string;
  pricePerHour: number;
};

export type Branch = {
    id: string;
    name: string;
    location: string;
    totalSpots: number;
    occupiedSpots: number;
    revenue: number;
}
