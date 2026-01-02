import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bus, MapPin, CreditCard, IndianRupee, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { studentsAPI, subscriptionsAPI, busesAPI, routesAPI, calculateMonthlyFee, PRICE_PER_KM } from '@/lib/api';

interface Student {
  _id: string;
  name: string;
  distanceKm: number;
  busId: { busNumber: string; model: string } | null;
  routeId: { name: string; stops: Array<{ name: string; estimatedArrival: string }> } | null;
}

interface Subscription {
  _id: string;
  month: string;
  year: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const studentData = await studentsAPI.getByUserId(user.id);
        setStudent(studentData);

        if (studentData?._id) {
          const subs = await subscriptionsAPI.getByStudentId(studentData._id);
          if (subs.length > 0) {
            setSubscription(subs[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const monthlyFee = student ? calculateMonthlyFee(student.distanceKm) : 0;

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'Student'}!`}>
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Distance from School" value={`${student?.distanceKm || 0} km`} icon={MapPin} variant="primary" />
          <StatCard title="Monthly Fee" value={`₹${monthlyFee}`} subtitle={`@ ₹${PRICE_PER_KM}/km`} icon={IndianRupee} variant="accent" />
          <StatCard title="Bus Number" value={student?.busId?.busNumber || 'N/A'} subtitle={student?.routeId?.name} icon={Bus} />
          <StatCard title="Payment Status" value={subscription?.status === 'paid' ? 'Paid' : 'Due'} icon={CreditCard} variant={subscription?.status === 'paid' ? 'success' : 'warning'} />
        </div>

        {/* Quick Actions & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="font-display">Current Subscription</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <>
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-semibold">{subscription.month} {subscription.year}</p>
                      <p className="text-sm text-muted-foreground">Due: {new Date(subscription.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₹{subscription.totalAmount}</p>
                      <Badge variant={subscription.status === 'paid' ? 'default' : 'destructive'}>{subscription.status}</Badge>
                    </div>
                  </div>
                  {subscription.status !== 'paid' && <Button variant="hero" className="w-full"><CreditCard className="h-4 w-4 mr-2" />Pay Now</Button>}
                  {subscription.status === 'paid' && <Button variant="outline" className="w-full"><FileText className="h-4 w-4 mr-2" />Download Receipt</Button>}
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">No active subscription</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display">Route Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {student?.routeId?.stops ? (
                <div className="space-y-3">
                  {student.routeId.stops.slice(0, 4).map((stop, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${i === 0 ? 'bg-success' : i === student.routeId!.stops.length - 1 ? 'bg-destructive' : 'bg-primary'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{stop.name}</p>
                        <p className="text-xs text-muted-foreground">{stop.estimatedArrival}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No route assigned</p>
              )}
              <Button variant="outline" className="w-full"><MapPin className="h-4 w-4 mr-2" />View Full Route</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
