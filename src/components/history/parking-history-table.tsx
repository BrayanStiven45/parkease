'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { ParkingRecord } from '@/lib/types';
import { format } from 'date-fns';

interface ParkingHistoryTableProps {
  records: ParkingRecord[];
}

const ITEMS_PER_PAGE = 10;

export default function ParkingHistoryTable({ records }: ParkingHistoryTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const maxPage = Math.ceil(records.length / ITEMS_PER_PAGE);
    const paginatedRecords = records.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

  return (
    <>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Plate</TableHead>
            <TableHead>Entry Time</TableHead>
            <TableHead>Exit Time</TableHead>
            <TableHead className="text-right">Total Cost</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {paginatedRecords.length > 0 ? (
            paginatedRecords.map((record) => (
                <TableRow key={record.id}>
                <TableCell className="font-medium font-code">{record.plate}</TableCell>
                <TableCell>{format(new Date(record.entryTime), 'Pp')}</TableCell>
                <TableCell>{record.exitTime ? format(new Date(record.exitTime), 'Pp') : '-'}</TableCell>
                <TableCell className="text-right">${record.totalCost?.toFixed(2) ?? 'N/A'}</TableCell>
                </TableRow>
            ))
            ) : (
            <TableRow>
                <TableCell colSpan={4} className="text-center">
                No historical records found.
                </TableCell>
            </TableRow>
            )}
        </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            >
            Previous
            </Button>
            <span className="text-sm">
                Page {currentPage} of {maxPage}
            </span>
            <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(maxPage, p + 1))}
            disabled={currentPage === maxPage}
            >
            Next
            </Button>
      </div>
    </>
  );
}
