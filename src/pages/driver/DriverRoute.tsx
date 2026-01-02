import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Bus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { driversAPI, routesAPI, busesAPI } from '@/lib/api';

const DriverRoute: React.FC = () => {
    const { user } = useAuth();
    const [route, setRoute] = useState<any>(null);
    const [bus, setBus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const driverData = await driversAPI.getByUserId(user.id);
                if (driverData?.busId) {
                    const busData = typeof driverData.busId === 'object' ? driverData.busId : await busesAPI.getById(driverData.busId);
                    setBus(busData);
                    if (busData?.routeId) {
                        const routeData = typeof busData.routeId === 'object' ? busData.routeId : await routesAPI.getById(busData.routeId);
                        setRoute(routeData);
                    }
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
            <DashboardLayout title="My Route" subtitle="View your assigned route">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (!route) {
        return (
            <DashboardLayout title="My Route" subtitle="View your assigned route">
                <Card className="p-8 text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-lg font-medium">No Route Assigned</p>
                    <p className="text-muted-foreground">Contact admin to get assigned to a route</p>
                </Card>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="My Route" subtitle="View your assigned route">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                {route.name}
                            </CardTitle>
                            {bus && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Bus className="h-4 w-4" />
                                    {bus.busNumber}
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="p-3 bg-success/10 rounded-lg">
                                <p className="text-sm text-muted-foreground">Start</p>
                                <p className="font-semibold">{route.startPoint}</p>
                            </div>
                            <div className="p-3 bg-destructive/10 rounded-lg">
                                <p className="text-sm text-muted-foreground">End</p>
                                <p className="font-semibold">{route.endPoint}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Distance</p>
                                <p className="font-semibold">{route.totalDistanceKm} km</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="font-semibold">{route.estimatedTime || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Stops ({route.stops?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {route.stops?.map((stop: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-success text-white' :
                                            i === route.stops.length - 1 ? 'bg-destructive text-white' :
                                                'bg-primary text-primary-foreground'
                                        }`}>
                                        {stop.order}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{stop.name}</p>
                                        <p className="text-sm text-muted-foreground">{stop.distanceFromStart} km from start</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        {stop.estimatedArrival || 'TBD'}
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

export default DriverRoute;
