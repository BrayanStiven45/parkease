'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Bot, Building, Car, History, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const allMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { href: '/dashboard/history', label: 'Historial de Estacionamiento', icon: History, adminOnly: false },
  { href: '/dashboard/branches', label: 'Sucursales', icon: Building, adminOnly: true },
  { href: '/dashboard/rate-suggester', label: 'Sugeridor IA de Tarifas', icon: Bot, adminOnly: false },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const getFilteredMenuItems = () => {
    if (isAdmin) {
      // Admin sees Branches and AI Suggester
      return allMenuItems.filter(item => item.adminOnly || item.href === '/dashboard/rate-suggester' || item.href === '/dashboard/history' || item.href === '/dashboard');
    }
    // Regular users see everything except admin-only items
    return allMenuItems.filter(item => !item.adminOnly);
  };

  const menuItems = getFilteredMenuItems();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Car className="h-8 w-8 text-primary-foreground" />
          <span className="text-lg font-semibold text-primary-foreground font-headline">ParkEase</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
