'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Car } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-2">
         <Car className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold font-headline">ParkEase</h1>
      </div>
    </header>
  );
}
