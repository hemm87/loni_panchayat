'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, Scale } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      className="border-r bg-muted/40 hidden sm:block dark:bg-sidebar-background"
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarContent>
        <SidebarHeader className="h-14 flex items-center justify-center">
           <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Scale className="h-6 w-6 text-primary" />
              <span className={cn(
                "font-headline text-lg",
                "group-data-[collapsible=icon]:hidden",
              )}>Loni Tax Manager</span>
           </Link>
        </SidebarHeader>
        <SidebarMenu className="flex-1 p-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/dashboard'}
              tooltip={{ children: 'Dashboard' }}
            >
              <Link href="/dashboard">
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/dashboard/properties')}
              tooltip={{ children: 'Properties' }}
            >
              <Link href="/dashboard/properties">
                <Building2 />
                <span>Properties</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
