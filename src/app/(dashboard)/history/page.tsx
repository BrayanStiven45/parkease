import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { completedParkingRecords } from "@/lib/data";
import ParkingHistoryTable from "@/components/history/parking-history-table";

export default function HistoryPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Completed Parking Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <ParkingHistoryTable records={completedParkingRecords} />
                </CardContent>
            </Card>
        </div>
    );
}
