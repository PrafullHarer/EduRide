import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSidebar } from './DashboardSidebar';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Mobile Menu */}
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <DashboardSidebar />
                </SheetContent>
              </Sheet>

              <div>
                <h1 className="font-display text-xl font-bold text-foreground">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center gap-4">
              {/* Search - Desktop only */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 w-64 bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>

              <ThemeToggle />

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
