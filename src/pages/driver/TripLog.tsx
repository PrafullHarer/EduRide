import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Calendar, Clock, Users, CheckCircle, Loader2, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { driversAPI, tripLogsAPI } from '@/lib/api';

interface TripLogEntry {
    _id: string;
    date: string;
    shift: 'morning' | 'evening';
    completedAt: string;
    studentsCount: number;
    status: string;
    busId?: { busNumber: string };
    routeId?: { name: string };
}

const TripLog: React.FC = () => {
    const { user } = useAuth();
    const [trips, setTrips] = useState<TripLogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const driverData = await driversAPI.getByUserId(user.id);
                if (driverData?._id) {
                    const logsData = await tripLogsAPI.getByDriver(driverData._id, 50);
                    setTrips(logsData);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return (
            <DashboardLayout title="Trip Log" subtitle="Your completed trips">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    const totalTrips = trips.length;
    const morningTrips = trips.filter(t => t.shift === 'morning').length;
    const eveningTrips = trips.filter(t => t.shift === 'evening').length;
    const totalStudents = trips.reduce((sum, t) => sum + (t.studentsCount || 0), 0);

    // Group trips by date for display
    const tripsByDate = trips.reduce((acc, trip) => {
        const dateKey = new Date(trip.date).toDateString();
        if (!acc[dateKey]) {
            acc[dateKey] = { date: trip.date, morning: null, evening: null };
        }
        if (trip.shift === 'morning') {
            acc[dateKey].morning = trip;
        } else {
            acc[dateKey].evening = trip;
        }
        return acc;
    }, {} as Record<string, { date: string; morning: TripLogEntry | null; evening: TripLogEntry | null }>);

    const groupedTrips = Object.values(tripsByDate).sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <DashboardLayout title="Trip Log" subtitle="Your completed trips">
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <ClipboardList className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalTrips}</p>
                                <p className="text-sm text-muted-foreground">Total Trips</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                                <Sun className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{morningTrips}</p>
                                <p className="text-sm text-muted-foreground">Morning Pickups</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Moon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{eveningTrips}</p>
                                <p className="text-sm text-muted-foreground">Evening Drops</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                                <Users className="h-6 w-6 text-accent-foreground" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalStudents}</p>
                                <p className="text-sm text-muted-foreground">Students Transported</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Trip History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Trip History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {groupedTrips.map((day, idx) => (
                                <div key={idx} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <span className="font-semibold">
                                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <Badge variant="default" className="bg-green-600">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            {(day.morning ? 1 : 0) + (day.evening ? 1 : 0)} trip(s)
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {day.morning && (
                                            <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sun className="h-4 w-4 text-orange-500" />
                                                    <span className="text-sm font-medium">Morning Pickup</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Completed at {new Date(day.morning.completedAt).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-lg font-bold mt-1">{day.morning.studentsCount} students</p>
                                            </div>
                                        )}
                                        {day.evening && (
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Moon className="h-4 w-4 text-blue-500" />
                                                    <span className="text-sm font-medium">Evening Drop</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Completed at {new Date(day.evening.completedAt).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-lg font-bold mt-1">{day.evening.studentsCount} students</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {trips.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>No completed trips yet</p>
                                    <p className="text-sm">Complete your first trip from the dashboard</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default TripLog;
