import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Calendar, Clock, Users, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { driversAPI } from '@/lib/api';

interface Schedule {
    _id: string;
    date: string;
    shift: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    morningPickup?: { status: string; studentsPresent: number; totalStudents: number };
    afternoonDrop?: { status: string; studentsPresent: number; totalStudents: number };
}

const TripLog: React.FC = () => {
    const { user } = useAuth();
    const [trips, setTrips] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const driverData = await driversAPI.getByUserId(user.id);
                if (driverData?._id) {
                    const schedulesData = await driversAPI.getSchedules(driverData._id);
                    // Only show completed trips
                    setTrips(schedulesData.filter((s: Schedule) => s.status === 'completed'));
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

    const totalTrips = trips.length * 2; // morning + afternoon
    const totalStudents = trips.reduce((sum, t) => {
        return sum + (t.morningPickup?.studentsPresent || 0) + (t.afternoonDrop?.studentsPresent || 0);
    }, 0);

    return (
        <DashboardLayout title="Trip Log" subtitle="Your completed trips">
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <ClipboardList className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{trips.length}</p>
                                <p className="text-sm text-muted-foreground">Days Completed</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-success" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalTrips}</p>
                                <p className="text-sm text-muted-foreground">Total Trips</p>
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
                            {trips.map((trip) => (
                                <div key={trip._id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <span className="font-semibold">
                                                {new Date(trip.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <Badge variant="default">Completed</Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {trip.morningPickup && (
                                            <div className="p-3 bg-muted rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Morning Pickup</span>
                                                </div>
                                                <p className="text-lg font-bold">
                                                    {trip.morningPickup.studentsPresent}/{trip.morningPickup.totalStudents}
                                                </p>
                                                <p className="text-xs text-muted-foreground">students</p>
                                            </div>
                                        )}
                                        {trip.afternoonDrop && (
                                            <div className="p-3 bg-muted rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Afternoon Drop</span>
                                                </div>
                                                <p className="text-lg font-bold">
                                                    {trip.afternoonDrop.studentsPresent}/{trip.afternoonDrop.totalStudents}
                                                </p>
                                                <p className="text-xs text-muted-foreground">students</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {trips.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No completed trips yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default TripLog;
