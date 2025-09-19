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

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/history', label: 'Parking History', icon: History },
  { href: '/dashboard/rate-suggester', label: 'AI Rate Suggester', icon: Bot },
];

const adminMenuItems = [
    { href: '/dashboard/branches', label: 'Branches', icon: Building },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const allMenuItems = isAdmin ? [...menuItems, ...adminMenuItems] : menuItems;

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
          {allMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
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
