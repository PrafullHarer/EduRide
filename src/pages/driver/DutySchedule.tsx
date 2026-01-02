import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { driversAPI, schedulesAPI } from '@/lib/api';

interface Schedule {
    _id: string;
    date: string;
    shift: 'morning' | 'afternoon' | 'both';
    status: 'scheduled' | 'completed' | 'cancelled';
    morningPickup?: { startTime: string; status: string };
    afternoonDrop?: { startTime: string; status: string };
}

const DutySchedule: React.FC = () => {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const driverData = await driversAPI.getByUserId(user.id);
                if (driverData?._id) {
                    const schedulesData = await driversAPI.getSchedules(driverData._id);
                    setSchedules(schedulesData);
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
            <DashboardLayout title="Duty Schedule" subtitle="View your scheduled trips">
                <div className="flex items-center justify-center h-64">
                    <div className="loader" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Duty Schedule" subtitle="View your scheduled trips">
            <div className="space-y-6">
                {/* Calendar Header */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <div className="flex gap-2">
                                <Badge variant="outline">
                                    <CheckCircle className="h-3 w-3 mr-1 text-success" />
                                    {schedules.filter(s => s.status === 'completed').length} Completed
                                </Badge>
                                <Badge variant="outline">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {schedules.filter(s => s.status === 'scheduled').length} Scheduled
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Schedules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {schedules.map((schedule) => (
                                <div key={schedule._id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${schedule.status === 'completed' ? 'bg-success/10' :
                                                schedule.status === 'cancelled' ? 'bg-destructive/10' : 'bg-primary/10'
                                                }`}>
                                                {schedule.status === 'completed' ? <CheckCircle className="h-5 w-5 text-success" /> :
                                                    schedule.status === 'cancelled' ? <XCircle className="h-5 w-5 text-destructive" /> :
                                                        <Clock className="h-5 w-5 text-primary" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                                <p className="text-sm text-muted-foreground capitalize">{schedule.shift} Shift</p>
                                            </div>
                                        </div>
                                        <Badge variant={
                                            schedule.status === 'completed' ? 'default' :
                                                schedule.status === 'cancelled' ? 'destructive' : 'secondary'
                                        }>
                                            {schedule.status}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {schedule.morningPickup && (
                                            <div className="p-3 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Morning Pickup</p>
                                                <p className="font-medium">{schedule.morningPickup.startTime}</p>
                                            </div>
                                        )}
                                        {schedule.afternoonDrop && (
                                            <div className="p-3 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Afternoon Drop</p>
                                                <p className="font-medium">{schedule.afternoonDrop.startTime}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {schedules.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No schedules found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default DutySchedule;
