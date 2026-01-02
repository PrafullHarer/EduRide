import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, GripVertical, Plus } from 'lucide-react';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Stop {
    id: string;
    name: string;
    lat: number;
    lng: number;
    order: number;
    estimatedArrival: string;
}

interface RouteEditorProps {
    initialStops?: Stop[];
    onSave: (stops: Stop[]) => void;
    routeName?: string;
}

// Map click handler component
const MapClickHandler: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const RouteEditor: React.FC<RouteEditorProps> = ({ initialStops = [], onSave, routeName }) => {
    const [stops, setStops] = useState<Stop[]>(initialStops);
    const [newStopName, setNewStopName] = useState('');
    const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);

    const handleMapClick = useCallback((lat: number, lng: number) => {
        setPendingLocation({ lat, lng });
    }, []);

    const addStop = () => {
        if (!pendingLocation || !newStopName.trim()) return;

        const newStop: Stop = {
            id: `stop-${Date.now()}`,
            name: newStopName.trim(),
            lat: pendingLocation.lat,
            lng: pendingLocation.lng,
            order: stops.length + 1,
            estimatedArrival: ''
        };

        setStops([...stops, newStop]);
        setNewStopName('');
        setPendingLocation(null);
    };

    const removeStop = (id: string) => {
        const updated = stops
            .filter(s => s.id !== id)
            .map((s, i) => ({ ...s, order: i + 1 }));
        setStops(updated);
    };

    const updateStopName = (id: string, name: string) => {
        setStops(stops.map(s => s.id === id ? { ...s, name } : s));
    };

    const updateStopTime = (id: string, time: string) => {
        setStops(stops.map(s => s.id === id ? { ...s, estimatedArrival: time } : s));
    };

    const routeLine = stops.map(s => [s.lat, s.lng] as [number, number]);

    // Calculate center from stops or default to Delhi
    const center: [number, number] = stops.length > 0
        ? [stops[0].lat, stops[0].lng]
        : [28.6139, 77.2090];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Map */}
            <div className="lg:col-span-2 h-full">
                <Card className="h-full">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Click on map to add stops</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-60px)]">
                        <MapContainer
                            center={center}
                            zoom={13}
                            style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapClickHandler onMapClick={handleMapClick} />

                            {/* Route line */}
                            {routeLine.length > 1 && (
                                <Polyline positions={routeLine} color="#628141" weight={4} />
                            )}

                            {/* Existing stops */}
                            {stops.map((stop) => (
                                <Marker
                                    key={stop.id}
                                    position={[stop.lat, stop.lng]}
                                    icon={new L.DivIcon({
                                        className: 'stop-marker',
                                        html: `<div style="
                      background: #628141;
                      border: 2px solid white;
                      border-radius: 50%;
                      width: 28px;
                      height: 28px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-weight: bold;
                      font-size: 12px;
                      color: white;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    ">${stop.order}</div>`,
                                        iconSize: [28, 28],
                                        iconAnchor: [14, 14],
                                    })}
                                />
                            ))}

                            {/* Pending location marker */}
                            {pendingLocation && (
                                <Marker
                                    position={[pendingLocation.lat, pendingLocation.lng]}
                                    icon={new L.DivIcon({
                                        className: 'pending-marker',
                                        html: `<div style="
                      background: #EBD5AB;
                      border: 3px dashed #628141;
                      border-radius: 50%;
                      width: 32px;
                      height: 32px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    ">
                      <span style="font-size: 16px;">+</span>
                    </div>`,
                                        iconSize: [32, 32],
                                        iconAnchor: [16, 16],
                                    })}
                                />
                            )}
                        </MapContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Stop list */}
            <div className="h-full overflow-hidden">
                <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Route Stops</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto space-y-4">
                        {/* Add stop form */}
                        {pendingLocation && (
                            <div className="p-3 bg-accent/20 rounded-lg space-y-2 border-2 border-dashed border-primary">
                                <p className="text-sm font-medium">New Stop Location Selected</p>
                                <Input
                                    placeholder="Stop name (e.g., Green Park Metro)"
                                    value={newStopName}
                                    onChange={(e) => setNewStopName(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={addStop} size="sm" className="flex-1">
                                        <Plus className="h-4 w-4 mr-1" /> Add Stop
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setPendingLocation(null)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Existing stops */}
                        <div className="space-y-2">
                            {stops.map((stop) => (
                                <div key={stop.id} className="p-3 bg-muted rounded-lg space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                            {stop.order}
                                        </div>
                                        <Input
                                            value={stop.name}
                                            onChange={(e) => updateStopName(stop.id, e.target.value)}
                                            className="flex-1 h-8"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={() => removeStop(stop.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Input
                                        type="time"
                                        value={stop.estimatedArrival}
                                        onChange={(e) => updateStopTime(stop.id, e.target.value)}
                                        className="h-8 w-32"
                                        placeholder="Arrival time"
                                    />
                                </div>
                            ))}
                        </div>

                        {stops.length === 0 && !pendingLocation && (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Click on the map to add stops</p>
                            </div>
                        )}

                        {/* Save button */}
                        {stops.length > 0 && (
                            <Button className="w-full" onClick={() => onSave(stops)}>
                                Save Route ({stops.length} stops)
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RouteEditor;
