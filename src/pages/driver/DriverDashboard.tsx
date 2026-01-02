import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bus, Users, MapPin, Clock, Play, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { driversAPI, busesAPI, routesAPI, schedulesAPI } from '@/lib/api';

interface Driver {
  _id: string;
  name: string;
  status: 'on-duty' | 'off-duty' | 'on-leave';
  busId: {
    busNumber: string;
    model: string;
    capacity: number;
    currentStudents: number;
    routeId: string;
  } | null;
}

interface Route {
  _id: string;
  name: string;
  totalDistanceKm: number;
  estimatedTime: string;
  stops: Array<{ name: string; order: number; distanceFromStart: number; estimatedArrival: string }>;
}

interface Schedule {
  _id: string;
  date: string;
  shift: string;
  status: string;
  morningPickup?: { startTime: string; status: string; studentsPresent: number; totalStudents: number };
  afternoonDrop?: { startTime: string; status: string; studentsPresent: number; totalStudents: number };
}

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const driverData = await driversAPI.getByUserId(user.id);
        setDriver(driverData);

        if (driverData?.busId?.routeId) {
          const routeData = await routesAPI.getById(driverData.busId.routeId);
          setRoute(routeData);
        }

        if (driverData?._id) {
          const schedule = await schedulesAPI.getTodayForDriver(driverData._id);
          setTodaySchedule(schedule);
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
      <DashboardLayout title="Driver Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Driver Dashboard" subtitle={`Welcome, ${user?.name?.split(' ')[0] || 'Driver'}!`}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Assigned Bus" value={driver?.busId?.busNumber || 'N/A'} subtitle={driver?.busId?.model} icon={Bus} variant="primary" />
          <StatCard title="Students on Route" value={driver?.busId?.currentStudents || 0} subtitle={`of ${driver?.busId?.capacity || 0} capacity`} icon={Users} />
          <StatCard title="Route Distance" value={`${route?.totalDistanceKm || 0} km`} subtitle={route?.estimatedTime} icon={MapPin} variant="accent" />
          <StatCard title="Today's Status" value={driver?.status === 'on-duty' ? 'On Duty' : 'Off Duty'} icon={Clock} variant={driver?.status === 'on-duty' ? 'success' : 'default'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="font-display">Today's Schedule</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {todaySchedule ? (
                <>
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">Morning Pickup</p>
                        <p className="text-sm text-muted-foreground">Start: {todaySchedule.morningPickup?.startTime || 'N/A'}</p>
                      </div>
                      <Badge variant={todaySchedule.morningPickup?.status === 'completed' ? 'default' : 'secondary'}>
                        {todaySchedule.morningPickup?.status || 'scheduled'}
                      </Badge>
                    </div>
                    {todaySchedule.morningPickup?.status === 'pending' && (
                      <Button variant="hero" size="sm" className="w-full"><Play className="h-4 w-4 mr-2" />Start Trip</Button>
                    )}
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">Afternoon Drop</p>
                        <p className="text-sm text-muted-foreground">Start: {todaySchedule.afternoonDrop?.startTime || 'N/A'}</p>
                      </div>
                      <Badge variant="secondary">{todaySchedule.afternoonDrop?.status || 'scheduled'}</Badge>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">No schedule for today</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display">Route: {route?.name || 'N/A'}</CardTitle></CardHeader>
            <CardContent>
              {route?.stops ? (
                <div className="space-y-3">
                  {route.stops.map((stop, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {stop.order}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{stop.name}</p>
                        <p className="text-xs text-muted-foreground">{stop.distanceFromStart} km • {stop.estimatedArrival}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No route assigned</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;
