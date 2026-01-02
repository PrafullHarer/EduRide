import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bus, Users, MapPin, Clock, Phone, Navigation,
  Map as MapIcon, GraduationCap, CheckCircle2, Sun, Moon, Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { driversAPI, routesAPI, studentsAPI, tripLogsAPI } from '@/lib/api';
import { DriverDashboardSkeleton } from '@/components/skeleton/DriverDashboardSkeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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

interface Student {
  _id: string;
  name: string;
  class: string;
  section: string;
  phone: string;
  address: string;
  status: string;
}

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Trip state
  const [morningComplete, setMorningComplete] = useState(false);
  const [eveningComplete, setEveningComplete] = useState(false);
  const [morningTime, setMorningTime] = useState<string | null>(null);
  const [eveningTime, setEveningTime] = useState<string | null>(null);
  const [completingTrip, setCompletingTrip] = useState<'morning' | 'evening' | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const driverData = await driversAPI.getByUserId(user.id);
        setDriver(driverData);

        if (driverData?.busId?.routeId) {
          const routeData = await routesAPI.getById(driverData.busId.routeId);
          setRoute(routeData);

          const studentsData = await studentsAPI.getByRouteId(driverData.busId.routeId);
          setStudents(studentsData);
        }

        if (driverData?._id) {
          // Load today's trip status
          const todayStatus = await tripLogsAPI.getTodayStatus(driverData._id);
          if (todayStatus.morning) {
            setMorningComplete(true);
            setMorningTime(new Date(todayStatus.morning.completedAt).toLocaleTimeString());
          }
          if (todayStatus.evening) {
            setEveningComplete(true);
            setEveningTime(new Date(todayStatus.evening.completedAt).toLocaleTimeString());
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

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleCompleteTrip = async (shift: 'morning' | 'evening') => {
    if (!driver) return;
    setCompletingTrip(shift);

    try {
      const busId = typeof driver.busId === 'object' ? (driver.busId as any)._id : driver.busId;
      const routeId = driver.busId?.routeId;

      await tripLogsAPI.create({
        driverId: driver._id,
        busId,
        routeId,
        date: new Date().toISOString().split('T')[0],
        shift,
        studentsCount: students.length
      });

      const completionTime = new Date().toLocaleTimeString();

      if (shift === 'morning') {
        setMorningComplete(true);
        setMorningTime(completionTime);
        toast({
          title: 'Morning Trip Completed',
          description: `Morning pickup completed at ${completionTime}`,
        });
      } else {
        setEveningComplete(true);
        setEveningTime(completionTime);
        toast({
          title: 'Evening Trip Completed',
          description: `Evening drop completed at ${completionTime}`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete trip',
        variant: 'destructive'
      });
    } finally {
      setCompletingTrip(null);
    }
  };

  return (
    <DashboardLayout title="Driver Dashboard" subtitle={`Welcome, ${user?.name?.split(' ')[0] || 'Driver'}!`}>
      {loading ? (
        <DriverDashboardSkeleton />
      ) : (
        <div className="space-y-6">

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Assigned Bus"
              value={driver?.busId?.busNumber || 'N/A'}
              subtitle={driver?.busId?.model || 'No Bus Assigned'}
              icon={Bus}
              variant="primary"
            />
            <StatCard
              title="Assigned Route"
              value={route?.name || 'N/A'}
              subtitle={`${route?.stops?.length || 0} Stops Configured`}
              icon={MapIcon}
              variant="accent"
            />
            <StatCard
              title="Students"
              value={students.length}
              subtitle={`Capacity: ${driver?.busId?.capacity || 0}`}
              icon={Users}
            />
            <StatCard
              title="Today's Status"
              value={driver?.status === 'on-duty' ? 'On Duty' : 'Off Duty'}
              icon={Clock}
              variant={driver?.status === 'on-duty' ? 'success' : 'default'}
            />
          </div>

          {/* Trip Completion Section */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Today's Trips</CardTitle>
              <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Morning Trip */}
                <div className={`p-4 rounded-lg border-2 transition-all ${morningComplete
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
                  : 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800'
                  }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-orange-500" />
                      <span className="font-semibold">Morning Pickup</span>
                    </div>
                    <Badge variant={morningComplete ? 'default' : 'secondary'} className={morningComplete ? 'bg-green-600' : ''}>
                      {morningComplete ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                  {morningComplete ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm">Completed at {morningTime || 'today'}</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      onClick={() => handleCompleteTrip('morning')}
                      disabled={completingTrip !== null}
                    >
                      {completingTrip === 'morning' ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Completing...</>
                      ) : (
                        <><CheckCircle2 className="h-4 w-4 mr-2" /> Complete Morning Trip</>
                      )}
                    </Button>
                  )}
                </div>

                {/* Evening Trip */}
                <div className={`p-4 rounded-lg border-2 transition-all ${eveningComplete
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
                  : 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800'
                  }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Moon className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">Evening Drop</span>
                    </div>
                    <Badge variant={eveningComplete ? 'default' : 'secondary'} className={eveningComplete ? 'bg-green-600' : ''}>
                      {eveningComplete ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                  {eveningComplete ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm">Completed at {eveningTime || 'today'}</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleCompleteTrip('evening')}
                      disabled={completingTrip !== null}
                    >
                      {completingTrip === 'evening' ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Completing...</>
                      ) : (
                        <><CheckCircle2 className="h-4 w-4 mr-2" /> Complete Evening Trip</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Left Column: Students List (2/3 width) */}
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Students on this Route ({students.length})
                  </CardTitle>
                  <CardDescription>Quick overview of students assigned to your bus route.</CardDescription>
                </CardHeader>
                <CardContent>
                  {students.length > 0 ? (
                    <div className="space-y-4">
                      {students.slice(0, 5).map((student, idx) => (
                        <div key={student._id}>
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-sm md:text-base">{student.name}</p>
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                  <span>Class {student.class}-{student.section}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {student.address || 'No Address'}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleCall(student.phone)}>
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                          {idx < Math.min(students.length, 5) - 1 && <Separator />}
                        </div>
                      ))}
                      {students.length > 5 && (
                        <p className="text-center text-sm text-muted-foreground pt-2">
                          + {students.length - 5} more students. <a href="/driver/students" className="text-primary hover:underline">View All →</a>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No students found for this route.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Route Details (1/3 width) */}
            <div className="space-y-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary" />
                    Route Path
                  </CardTitle>
                  <CardDescription>
                    {route?.name ? `${route.name} (${route.totalDistanceKm} km)` : 'No Route Details'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {route?.stops ? (
                    <div className="relative border-l-2 border-muted ml-3 space-y-6 pb-2">
                      {route.stops.map((stop, i) => (
                        <div key={i} className="relative pl-6">
                          <span className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background ${i === 0 || i === route.stops.length - 1 ? 'bg-primary' : 'bg-muted-foreground'}`}></span>
                          <div>
                            <p className="font-medium text-sm">{stop.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {stop.distanceFromStart} km • ~{stop.estimatedArrival}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No stops configured for this route.</p>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      )
      }
    </DashboardLayout >
  );
};

export default DriverDashboard;
