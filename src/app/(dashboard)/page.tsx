import { Car, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ActiveParking from '@/components/dashboard/active-parking';
import { initialParkingRecords } from '@/lib/data';

export default function DashboardPage() {
    const totalParked = initialParkingRecords.length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vehicles Currently Parked
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParked}</div>
            <p className="text-xs text-muted-foreground">
              Live count of vehicles in the parking lot
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Parking Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1h 45m</div>
             <p className="text-xs text-muted-foreground">
              Based on currently parked vehicles
            </p>
          </CardContent>
        </Card>
      </div>
      
      <ActiveParking />

    </div>
  );
}
