import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus, MapPin, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BusMap from '@/components/maps/BusMap';
import { socketService } from '@/lib/socket';
import { busesAPI } from '@/lib/api';

interface BusLocation {
    busId: string;
    busNumber: string;
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    routeName?: string;
    isTracking: boolean;
}

const BusTracking: React.FC = () => {
    const [buses, setBuses] = useState<BusLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBus, setSelectedBus] = useState<string | null>(null);

    useEffect(() => {
        // Connect to socket
        socketService.connect();
        socketService.subscribeToAllBuses();

        // Fetch initial bus data
        const fetchBuses = async () => {
            try {
                const allBuses = await busesAPI.getAll();
                const busLocations: BusLocation[] = allBuses
                    .filter((bus: any) => bus.currentLocation?.lat)
                    .map((bus: any) => ({
                        busId: bus._id,
                        busNumber: bus.busNumber,
                        lat: bus.currentLocation?.lat,
                        lng: bus.currentLocation?.lng,
                        heading: bus.currentLocation?.heading,
                        speed: bus.currentLocation?.speed,
                        routeName: bus.routeId?.name,
                        isTracking: bus.isTracking
                    }));
                setBuses(busLocations);
            } catch (error) {
                console.error('Error fetching buses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBuses();

        // Listen for real-time updates
        const unsubscribe = socketService.onBusLocationUpdate((data) => {
            setBuses(prev => {
                const existing = prev.findIndex(b => b.busId === data.busId);
                if (existing >= 0) {
                    const updated = [...prev];
                    updated[existing] = {
                        ...updated[existing],
                        lat: data.location.lat,
                        lng: data.location.lng,
                        heading: data.location.heading,
                        speed: data.location.speed,
                        isTracking: true
                    };
                    return updated;
                } else {
                    return [...prev, {
                        busId: data.busId,
                        busNumber: data.busNumber,
                        lat: data.location.lat,
                        lng: data.location.lng,
                        heading: data.location.heading,
                        speed: data.location.speed,
                        isTracking: true
                    }];
                }
            });
        });

        const unsubStop = socketService.onBusTrackingStopped((data) => {
            setBuses(prev => prev.map(b =>
                b.busId === data.busId ? { ...b, isTracking: false } : b
            ));
        });

        return () => {
            unsubscribe();
            unsubStop();
        };
    }, []);

    const trackingBuses = buses.filter(b => b.isTracking && b.lat && b.lng);

    if (loading) {
        return (
            <DashboardLayout title="Bus Tracking" subtitle="Real-time GPS tracking">
                <div className="flex items-center justify-center h-96">
                    <div className="loader" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Bus Tracking" subtitle="Real-time GPS tracking">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Map - takes 3 columns */}
                <div className="lg:col-span-3">
                    <Card className="h-[600px]">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Live Map
                                </CardTitle>
                                <Badge variant="outline" className="animate-pulse">
                                    <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
                                    {trackingBuses.length} Active
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[calc(100%-60px)]">
                            {trackingBuses.length > 0 ? (
                                <BusMap
                                    buses={trackingBuses}
                                    onBusClick={(busId) => setSelectedBus(busId)}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center bg-muted/50 rounded-lg">
                                    <div className="text-center text-muted-foreground">
                                        <Bus className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium">No Active Buses</p>
                                        <p className="text-sm">Buses will appear when drivers start sharing their location</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Bus list - takes 1 column */}
                <div className="lg:col-span-1">
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Bus className="h-5 w-5" />
                                All Buses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto space-y-2">
                            {buses.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No buses found</p>
                            ) : (
                                buses.map((bus) => (
                                    <div
                                        key={bus.busId}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedBus === bus.busId ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                                            }`}
                                        onClick={() => setSelectedBus(bus.busId)}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold">{bus.busNumber}</span>
                                            <Badge variant={bus.isTracking ? 'default' : 'secondary'}>
                                                {bus.isTracking ? 'Live' : 'Offline'}
                                            </Badge>
                                        </div>
                                        {bus.routeName && (
                                            <p className="text-sm text-muted-foreground">{bus.routeName}</p>
                                        )}
                                        {bus.isTracking && bus.speed !== undefined && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Speed: {Math.round(bus.speed)} km/h
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BusTracking;
