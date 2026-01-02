import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Bus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { studentsAPI, routesAPI } from '@/lib/api';

interface Stop {
    name: string;
    order: number;
    estimatedArrival: string;
    distanceFromStart: number;
}

const MyRoute: React.FC = () => {
    const { user } = useAuth();
    const [route, setRoute] = useState<any>(null);
    const [bus, setBus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const studentData = await studentsAPI.getByUserId(user.id);
                if (studentData?.routeId) {
                    const routeData = typeof studentData.routeId === 'object'
                        ? studentData.routeId
                        : await routesAPI.getById(studentData.routeId);
                    setRoute(routeData);
                }
                if (studentData?.busId) {
                    setBus(typeof studentData.busId === 'object' ? studentData.busId : null);
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
            <DashboardLayout title="My Route" subtitle="View your bus route details">
                <div className="flex items-center justify-center h-64">
                    <div className="loader" />
                </div>
            </DashboardLayout>
        );
    }

    if (!route) {
        return (
            <DashboardLayout title="My Route" subtitle="View your bus route details">
                <Card className="p-8 text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-lg font-medium">No Route Assigned</p>
                    <p className="text-muted-foreground">Contact admin to get assigned to a route</p>
                </Card>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="My Route" subtitle="View your bus route details">
            <div className="space-y-6">
                {/* Route Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            {route.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Start Point</p>
                                <p className="font-semibold">{route.startPoint}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">End Point</p>
                                <p className="font-semibold">{route.endPoint}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Distance</p>
                                <p className="font-semibold">{route.totalDistanceKm} km</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="font-semibold">{route.estimatedTime || 'N/A'}</p>
                            </div>
                        </div>

                        {bus && (
                            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                                <Bus className="h-5 w-5 text-primary" />
                                <span>Assigned Bus: <strong>{bus.busNumber}</strong></span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stops */}
                <Card>
                    <CardHeader>
                        <CardTitle>Route Stops ({route.stops?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            {route.stops?.map((stop: Stop, index: number) => (
                                <div key={index} className="flex gap-4 pb-6 last:pb-0">
                                    {/* Timeline */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-success text-white' :
                                            index === route.stops.length - 1 ? 'bg-destructive text-white' :
                                                'bg-primary text-primary-foreground'
                                            }`}>
                                            {stop.order}
                                        </div>
                                        {index < route.stops.length - 1 && (
                                            <div className="w-0.5 flex-1 bg-border mt-2"></div>
                                        )}
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 pb-4">
                                        <p className="font-semibold">{stop.name}</p>
                                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {stop.estimatedArrival || 'TBD'}
                                            </span>
                                            <span>{stop.distanceFromStart} km from start</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default MyRoute;
