import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bus,
  Users,
  Route,
  CreditCard,
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  FileText,
  Calendar,
  MapPin,
  ClipboardList,
  IndianRupee,
  UserCog,
  GraduationCap,
  Truck,
  Navigation,
  Radar,
  MessageSquare,
} from 'lucide-react';

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const studentLinks: SidebarLink[] = [
  { label: 'Dashboard', href: '/student', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Track My Bus', href: '/student/track', icon: <Radar className="h-5 w-5" /> },
  { label: 'My Subscription', href: '/student/subscription', icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Payments', href: '/student/payments', icon: <IndianRupee className="h-5 w-5" /> },
  { label: 'My Route', href: '/student/route', icon: <MapPin className="h-5 w-5" /> },
  { label: 'Profile', href: '/student/profile', icon: <User className="h-5 w-5" /> },
];

const adminLinks: SidebarLink[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Bus Tracking', href: '/admin/tracking', icon: <Radar className="h-5 w-5" /> },
  { label: 'Students', href: '/admin/students', icon: <GraduationCap className="h-5 w-5" /> },
  { label: 'Buses', href: '/admin/buses', icon: <Bus className="h-5 w-5" /> },
  { label: 'Routes', href: '/admin/routes', icon: <Route className="h-5 w-5" /> },
  { label: 'Drivers', href: '/admin/drivers', icon: <UserCog className="h-5 w-5" /> },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Payments', href: '/admin/payments', icon: <IndianRupee className="h-5 w-5" /> },
  { label: 'Messages', href: '/admin/messages', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Pricing', href: '/admin/pricing', icon: <FileText className="h-5 w-5" /> },
];

const driverLinks: SidebarLink[] = [
  { label: 'Dashboard', href: '/driver', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Manage Route', href: '/driver/manage-route', icon: <Navigation className="h-5 w-5" /> },
  { label: 'Duty Schedule', href: '/driver/schedule', icon: <Calendar className="h-5 w-5" /> },
  { label: 'My Route', href: '/driver/route', icon: <MapPin className="h-5 w-5" /> },
  { label: 'Students', href: '/driver/students', icon: <Users className="h-5 w-5" /> },
  { label: 'Trip Log', href: '/driver/trips', icon: <ClipboardList className="h-5 w-5" /> },
];

export const DashboardSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = React.useMemo(() => {
    switch (user?.role) {
      case 'student':
        return studentLinks;
      case 'admin':
        return adminLinks;
      case 'driver':
        return driverLinks;
      default:
        return [];
    }
  }, [user?.role]);

  const roleLabel = React.useMemo(() => {
    switch (user?.role) {
      case 'student':
        return 'Student Portal';
      case 'admin':
        return 'Admin Panel';
      case 'driver':
        return 'Driver Portal';
      default:
        return 'Dashboard';
    }
  }, [user?.role]);

  const roleIcon = React.useMemo(() => {
    switch (user?.role) {
      case 'student':
        return <GraduationCap className="h-6 w-6" />;
      case 'admin':
        return <Settings className="h-6 w-6" />;
      case 'driver':
        return <Truck className="h-6 w-6" />;
      default:
        return <Bus className="h-6 w-6" />;
    }
  }, [user?.role]);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">

      {/* User Info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
          <div className="h-10 w-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
            {roleIcon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Button
              key={link.href}
              variant={isActive ? 'sidebar-active' : 'sidebar'}
              size="default"
              asChild
              className="w-full"
            >
              <Link to={link.href}>
                {link.icon}
                <span className="flex-1 text-left">{link.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button variant="sidebar" size="default" className="w-full" asChild>
          <Link to={`/${user?.role}/settings`}>
            <Settings className="h-5 w-5" />
            <span className="flex-1 text-left">Settings</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="default"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          <span className="flex-1 text-left">Logout</span>
        </Button>
      </div>
    </aside>
  );
};
