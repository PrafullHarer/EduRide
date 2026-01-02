import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Bus, Route, IndianRupee, UserCog, AlertCircle, Loader2 } from 'lucide-react';
import { analyticsAPI, subscriptionsAPI } from '@/lib/api';

interface Analytics {
  totalStudents: number;
  activeStudents: number;
  totalBuses: number;
  activeBuses: number;
  totalDrivers: number;
  activeDrivers: number;
  totalRoutes: number;
  monthlyRevenue: number;
  pendingPayments: number;
  overduePayments: number;
}

interface Subscription {
  _id: string;
  studentId: { name: string } | string;
  month: string;
  year: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue';
}

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, subsData] = await Promise.all([
          analyticsAPI.get(),
          subscriptionsAPI.getAll()
        ]);
        setAnalytics(analyticsData);
        setSubscriptions(subsData.slice(0, 4));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard" subtitle="Manage your school's transportation">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Manage your school's transportation">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={analytics?.totalStudents || 0} subtitle={`${analytics?.activeStudents || 0} active`} icon={GraduationCap} variant="primary" trend={{ value: 12, isPositive: true }} />
          <StatCard title="Active Buses" value={analytics?.activeBuses || 0} subtitle={`of ${analytics?.totalBuses || 0} total`} icon={Bus} />
          <StatCard title="Monthly Revenue" value={`₹${(analytics?.monthlyRevenue || 0).toLocaleString()}`} icon={IndianRupee} variant="accent" trend={{ value: 8, isPositive: true }} />
          <StatCard title="Pending Payments" value={(analytics?.pendingPayments || 0) + (analytics?.overduePayments || 0)} icon={AlertCircle} variant="warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="font-display">Recent Subscriptions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscriptions.map(sub => (
                  <div key={sub._id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{typeof sub.studentId === 'object' ? sub.studentId.name : 'Student'}</p>
                      <p className="text-sm text-muted-foreground">{sub.month} {sub.year}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{sub.totalAmount}</p>
                      <span className={`text-xs px-2 py-1 rounded ${sub.status === 'paid' ? 'bg-success/20 text-success' : sub.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'}`}>{sub.status}</span>
                    </div>
                  </div>
                ))}
                {subscriptions.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No subscriptions yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display">Quick Stats</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg text-center">
                <Route className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{analytics?.totalRoutes || 0}</p>
                <p className="text-sm text-muted-foreground">Active Routes</p>
              </div>
              <div className="p-4 bg-success/5 rounded-lg text-center">
                <UserCog className="h-8 w-8 mx-auto mb-2 text-success" />
                <p className="text-2xl font-bold">{analytics?.activeDrivers || 0}</p>
                <p className="text-sm text-muted-foreground">On-Duty Drivers</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
