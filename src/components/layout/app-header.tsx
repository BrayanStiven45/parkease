'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Car, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export default function AppHeader() {
  const { user, userData, loading, logout } = useAuth();
  
  const welcomeMessage = () => {
    if (!user) return null;
    if (userData?.username) return `Welcome, ${userData.username}`;
    return `Welcome, ${user.email}`;
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-2">
         <Car className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold font-headline">ParkEase</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {user && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
                {welcomeMessage()}
            </span>
        )}
        <Button variant="outline" size="sm" onClick={logout} disabled={loading}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
