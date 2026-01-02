import React, { useEffect, useState, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Play, Square, Loader2, Save, RefreshCw } from 'lucide-react';
import BusMap from '@/components/maps/BusMap';
import RouteEditor from '@/components/maps/RouteEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { driversAPI, busesAPI, routesAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'http://localhost:5000/api';

interface DriverInfo {
    _id: string;
    busId: {
        _id: string;
        busNumber: string;
        routeId?: string;
        isTracking?: boolean;
        currentLocation?: {
            lat: number;
            lng: number;
        };
    };
}

const ManageRoute: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [driver, setDriver] = useState<DriverInfo | null>(null);
    const [route, setRoute] = useState<any>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const watchIdRef = useRef<number | null>(null);
    const hasAutoResumed = useRef(false);

    // Function to send location to server
    const sendLocationToServer = useCallback(async (busId: string, latitude: number, longitude: number, heading?: number, speed?: number) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/tracking/location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    busId,
                    lat: latitude,
                    lng: longitude,
                    heading: heading || 0,
                    speed: (speed || 0) * 3.6 // Convert m/s to km/h
                })
            });
        } catch (error) {
            console.error('Error sending location:', error);
        }
    }, []);

    // Start geolocation watcher
    const startGeolocationWatch = useCallback((busId: string) => {
        if (!navigator.geolocation) {
            toast({
                title: 'Error',
                description: 'Geolocation is not supported by your browser',
                variant: 'destructive'
            });
            return;
        }

        // Clear any existing watcher
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, heading, speed } = position.coords;
                setCurrentLocation({ lat: latitude, lng: longitude });
                sendLocationToServer(busId, latitude, longitude, heading || undefined, speed || undefined);
            },
            (error) => {
                console.error('Geolocation error:', error);
                toast({
                    title: 'Location Error',
                    description: error.message,
                    variant: 'destructive'
                });
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000
            }
        );

        watchIdRef.current = id;
        setIsTracking(true);
    }, [sendLocationToServer, toast]);

    // Fetch data and check if tracking should auto-resume
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

                // Check if tracking was previously enabled (persisted on server)
                if (driverData?.busId?._id) {
                    const busData = await busesAPI.getById(driverData.busId._id);

                    // Auto-resume tracking if it was previously enabled
                    if (busData.isTracking && !hasAutoResumed.current) {
                        hasAutoResumed.current = true;

                        // Set initial location from server if available
                        if (busData.currentLocation?.lat && busData.currentLocation?.lng) {
                            setCurrentLocation({
                                lat: busData.currentLocation.lat,
                                lng: busData.currentLocation.lng
                            });
                        }

                        // Start geolocation watcher
                        startGeolocationWatch(driverData.busId._id);

                        toast({
                            title: 'Tracking Resumed',
                            description: 'Location sharing has been automatically resumed'
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching driver data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Cleanup on unmount
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [user, startGeolocationWatch, toast]);

    const startTracking = useCallback(() => {
        if (!driver?.busId?._id) return;

        startGeolocationWatch(driver.busId._id);

        toast({
            title: 'Tracking Started',
            description: 'Your location is now being shared with students and admin'
        });
    }, [driver, startGeolocationWatch, toast]);

    const stopTracking = useCallback(async () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTracking(false);

        // Notify server to stop tracking
        if (driver?.busId?._id) {
            try {
                const token = localStorage.getItem('token');
                await fetch(`${API_URL}/tracking/stop`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ busId: driver.busId._id })
                });
            } catch (error) {
                console.error('Error stopping tracking:', error);
            }
        }

        toast({
            title: 'Tracking Stopped',
            description: 'Location sharing has been disabled'
        });
    }, [driver, toast]);

    const handleSaveRoute = async (stops: any[]) => {
        if (!driver?.busId) return;

        try {
            const routeData = {
                name: route?.name || 'My Route',
                startPoint: stops[0]?.name || 'Start',
                endPoint: stops[stops.length - 1]?.name || 'End',
                stops: stops.map(s => ({
                    name: s.name,
                    order: s.order,
                    distanceFromStart: 0,
                    estimatedArrival: s.estimatedArrival || ''
                })),
                totalDistanceKm: 0,
                estimatedTime: '',
                busId: driver.busId._id
            };

            if (route?._id) {
                await routesAPI.update(route._id, routeData);
            } else {
                const newRoute = await routesAPI.create(routeData);
                await busesAPI.update(driver.busId._id, { routeId: newRoute._id });
                setRoute(newRoute);
            }

            toast({
                title: 'Route Saved',
                description: `Route with ${stops.length} stops has been saved`
            });
        } catch (error) {
            console.error('Error saving route:', error);
            toast({
                title: 'Error',
                description: 'Failed to save route',
                variant: 'destructive'
            });
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Manage Route" subtitle="Share location & manage stops">
                <div className="flex items-center justify-center h-96">
                    <div className="loader" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Manage Route" subtitle="Share location & manage stops">
            <Tabs defaultValue="tracking" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="tracking">
                        <Navigation className="h-4 w-4 mr-2" />
                        Live Tracking
                    </TabsTrigger>
                    <TabsTrigger value="route">
                        <MapPin className="h-4 w-4 mr-2" />
                        Edit Route
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tracking">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Map */}
                        <div className="lg:col-span-2">
                            <Card className="h-[500px]">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Navigation className="h-5 w-5 text-primary" />
                                            Your Location
                                        </CardTitle>
                                        <Badge variant={isTracking ? 'default' : 'secondary'}>
                                            {isTracking ? (
                                                <>
                                                    <span className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></span>
                                                    Broadcasting
                                                </>
                                            ) : 'Stopped'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="h-[calc(100%-60px)]">
                                    {currentLocation ? (
                                        <BusMap
                                            buses={[{
                                                busId: driver?.busId?._id || '',
                                                busNumber: driver?.busId?.busNumber || 'My Bus',
                                                lat: currentLocation.lat,
                                                lng: currentLocation.lng
                                            }]}
                                            stops={route?.stops?.map((s: any, i: number) => ({ ...s, order: i + 1 })) || []}
                                            singleBus
                                        />
                                    ) : (
                                        <div className="h-full flex items-center justify-center bg-muted/50 rounded-lg">
                                            <div className="text-center text-muted-foreground">
                                                <Navigation className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                                <p className="font-medium">Location Not Available</p>
                                                <p className="text-sm">Start tracking to share your location</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Controls */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Location Sharing</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        When enabled, students assigned to your bus can track your location in real-time.
                                    </p>

                                    {/* Auto-resume indicator */}
                                    {isTracking && hasAutoResumed.current && (
                                        <div className="p-2 bg-success/10 rounded-lg text-sm text-success flex items-center gap-2">
                                            <RefreshCw className="h-4 w-4" />
                                            Tracking auto-resumed
                                        </div>
                                    )}

                                    {!isTracking ? (
                                        <Button className="w-full" size="lg" onClick={startTracking}>
                                            <Play className="h-5 w-5 mr-2" />
                                            Start Sharing Location
                                        </Button>
                                    ) : (
                                        <Button className="w-full" size="lg" variant="destructive" onClick={stopTracking}>
                                            <Square className="h-5 w-5 mr-2" />
                                            Stop Sharing
                                        </Button>
                                    )}

                                    {currentLocation && (
                                        <div className="p-3 bg-muted rounded-lg text-sm">
                                            <p className="font-medium">Current Position</p>
                                            <p className="text-muted-foreground">
                                                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                                            </p>
                                        </div>
                                    )}

                                    <p className="text-xs text-muted-foreground">
                                        ✓ Tracking persists across page refreshes
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Bus Info</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Bus Number</span>
                                            <span className="font-medium">{driver?.busId?.busNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Route</span>
                                            <span className="font-medium">{route?.name || 'Not set'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Stops</span>
                                            <span className="font-medium">{route?.stops?.length || 0}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="route">
                    <RouteEditor
                        initialStops={route?.stops?.map((s: any, i: number) => ({
                            id: s._id || `stop-${i}`,
                            name: s.name,
                            lat: s.lat || 28.6139 + (Math.random() * 0.05),
                            lng: s.lng || 77.2090 + (Math.random() * 0.05),
                            order: s.order || i + 1,
                            estimatedArrival: s.estimatedArrival || ''
                        })) || []}
                        onSave={handleSaveRoute}
                        routeName={route?.name}
                    />
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    );
};

export default ManageRoute;
