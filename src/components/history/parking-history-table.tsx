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
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import type { ParkingRecord } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface ParkingHistoryTableProps {
  records: ParkingRecord[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  hasActiveFilters: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function ParkingHistoryTable({ 
    records, 
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    hasActiveFilters,
}: ParkingHistoryTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const maxPage = Math.ceil(records.length / ITEMS_PER_PAGE);
    const paginatedRecords = records.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
     // Reset to page 1 when records change due to filtering
    useState(() => {
        setCurrentPage(1);
    });

    const getEmptyStateMessage = () => {
        if (hasActiveFilters) {
            return "No records match the current filters.";
        }
        return "No historical records found.";
    };

    if (isLoading) {
        return (
             <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

  return (
    <>
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
            <div className="relative w-full sm:w-auto flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by plate..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
             <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick an entry date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
             {hasActiveFilters && (
                <Button variant="ghost" onClick={() => { setSearchQuery(''); setSelectedDate(undefined); }}>
                    Clear Filters
                </Button>
            )}
        </div>
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
                    {getEmptyStateMessage()}
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
            disabled={currentPage === 1 || records.length === 0}
            >
            Previous
            </Button>
            <span className="text-sm">
                Page {currentPage} of {maxPage > 0 ? maxPage : 1}
            </span>
            <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(maxPage, p + 1))}
            disabled={currentPage === maxPage || records.length === 0}
            >
            Next
            </Button>
      </div>
    </>
  );
}
