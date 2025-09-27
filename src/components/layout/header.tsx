'use client';

import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  ShoppingCart,
  Users,
  Building2,
  Scale,
  PanelLeft,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '../ui/sidebar';

export function AppHeader() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  
  const pageTitles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/dashboard/properties': 'Properties',
    '/dashboard/payments': 'Payments',
    '/dashboard/reports': 'Reports',
    '/dashboard/settings': 'Settings',
  };

  const currentPageTitle = pageTitles[pathname] || 'Loni Tax Manager';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs dark:bg-sidebar-background dark:text-sidebar-foreground">
           <nav className="flex flex-col gap-6 text-lg font-medium">
             <Link
              href="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              onClick={() => setOpenMobile(false)}
            >
              <Scale className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Loni Tax Manager</span>
            </Link>
             <Link
              href="/dashboard"
              className={`flex items-center gap-4 px-2.5 ${pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setOpenMobile(false)}
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
             <Link
              href="/dashboard/properties"
              className={`flex items-center gap-4 px-2.5 ${pathname.startsWith('/dashboard/properties') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setOpenMobile(false)}
            >
              <Building2 className="h-5 w-5" />
              Properties
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="relative ml-auto flex-1 md:grow-0">
        <h1 className="font-headline text-xl font-semibold hidden sm:block">{currentPageTitle}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar>
              <AvatarImage src="https://picsum.photos/seed/user1/100/100" alt="@shadcn" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
