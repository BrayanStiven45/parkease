export type ParkingRecord = {
  id: number;
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
