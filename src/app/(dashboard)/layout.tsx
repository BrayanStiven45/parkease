import type { ReactNode } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppHeader from '@/components/layout/app-header';
import { AuthProvider } from '@/contexts/auth-context';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <AppHeader />
            <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
