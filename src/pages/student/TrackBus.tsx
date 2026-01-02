import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus, MapPin, Clock } from 'lucide-react';
import BusMap from '@/components/maps/BusMap';
import { socketService } from '@/lib/socket';
import { useAuth } from '@/contexts/AuthContext';
import { studentsAPI, busesAPI, routesAPI } from '@/lib/api';
import { TrackBusSkeleton } from '@/components/skeleton/TrackBusSkeleton';

interface BusInfo {
    busId: string;
    busNumber: string;
    lat: number;
    lng: number;
    speed?: number;
    isTracking: boolean;
}

interface Stop {
    name: string;
    lat?: number;
    lng?: number;
    order: number;
    estimatedArrival: string;
}

const TrackBus: React.FC = () => {
    const { user } = useAuth();
    const [bus, setBus] = useState<BusInfo | null>(null);
    const [stops, setStops] = useState<Stop[]>([]);
    const [routeName, setRouteName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                // Get student's assigned bus
                const student = await studentsAPI.getByUserId(user.id);
                let resolvedBus: any = null;

                if (student?.busId) {
                    // Direct assignment
                    resolvedBus = typeof student.busId === 'object' ? student.busId : await busesAPI.getById(student.busId);
                } else if (student?.routeId) {
                    // Fallback: Find bus by route
                    const routeId = typeof student.routeId === 'object' ? student.routeId._id : student.routeId;
                    try {
                        const allBuses = await busesAPI.getAll();
                        resolvedBus = allBuses.find((b: any) => {
                            const bRouteId = typeof b.routeId === 'object' ? b.routeId?._id : b.routeId;
                            return bRouteId === routeId;
                        });
                    } catch (err) {
                        console.error('Error finding bus for route:', err);
                    }
                }

                if (resolvedBus) {
                    setBus({
                        busId: resolvedBus._id,
                        busNumber: resolvedBus.busNumber,
                        lat: resolvedBus.currentLocation?.lat || 0,
                        lng: resolvedBus.currentLocation?.lng || 0,
                        speed: resolvedBus.currentLocation?.speed,
                        isTracking: resolvedBus.isTracking || false
                    });
                }

                // Get route info
                if (student.routeId) {
                    const routeData = typeof student.routeId === 'object' ? student.routeId : await routesAPI.getById(student.routeId);
                    setRouteName(routeData.name);
                    setStops(routeData.stops || []);
                }

                // Setup Socket Subscription
                if (resolvedBus?._id) {
                    socketService.connect();
                    socketService.subscribeToBus(resolvedBus._id);

                    socketService.onBusLocationUpdate((data) => {
                        if (data.busId === resolvedBus._id) {
                            setBus(prev => prev ? {
                                ...prev,
                                lat: data.location.lat,
                                lng: data.location.lng,
                                speed: data.location.speed,
                                isTracking: true
                            } : {
                                busId: resolvedBus._id,
                                busNumber: resolvedBus.busNumber,
                                lat: data.location.lat,
                                lng: data.location.lng,
                                speed: data.location.speed,
                                isTracking: true
                            });
                        }
                    });

                    socketService.onBusTrackingStopped((data) => {
                        if (data.busId === resolvedBus._id) {
                            setBus(prev => prev ? { ...prev, isTracking: false } : null);
                        }
                    });
                }

            } catch (error) {
                console.error('Error fetching bus data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => {
            socketService.disconnect();
        };
    }, [user]);

    // Show skeleton loader immediately for better perceived performance
    if (loading) {
        return (
            <DashboardLayout title="Track My Bus" subtitle="Loading bus location...">
                <TrackBusSkeleton />
            </DashboardLayout>
        );
    }

    // No bus assigned state
    if (!bus) {
        return (
            <DashboardLayout title="Track My Bus" subtitle="See where your bus is">
                <Card className="h-96 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <Bus className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No Bus Found</p>
                        <p className="text-sm">No bus is currently assigned to your route.</p>
                    </div>
                </Card>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Track My Bus" subtitle="See where your bus is">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2">
                    <Card className="h-[500px]">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    {bus.busNumber} Location
                                </CardTitle>
                                <Badge variant={bus.isTracking ? 'default' : 'secondary'}>
                                    {bus.isTracking ? (
                                        <>
                                            <span className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></span>
                                            Live
                                        </>
                                    ) : 'Offline'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[calc(100%-60px)]">
                            {bus.isTracking && bus.lat ? (
                                <BusMap
                                    buses={[bus]}
                                    stops={stops}
                                    singleBus
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center bg-muted/50 rounded-lg">
                                    <div className="text-center text-muted-foreground">
                                        <Bus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p className="font-medium">Bus Not Sharing Location</p>
                                        <p className="text-sm">The driver hasn't started tracking yet</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Route info */}
                <div className="lg:col-span-1">
                    <Card className="h-[500px] flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Route: {routeName || 'N/A'}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto">
                            {stops.length > 0 ? (
                                <div className="space-y-3">
                                    {stops.map((stop, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-success text-white' :
                                                i === stops.length - 1 ? 'bg-destructive text-white' :
                                                    'bg-primary text-primary-foreground'
                                                }`}>
                                                {stop.order}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{stop.name}</p>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {stop.estimatedArrival || 'TBD'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No stops defined</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TrackBus;
