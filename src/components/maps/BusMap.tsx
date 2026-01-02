import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface BusLocation {
    busId: string;
    busNumber: string;
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    routeName?: string;
}

interface Stop {
    name: string;
    lat?: number;
    lng?: number;
    order: number;
}

interface BusMapProps {
    buses: BusLocation[];
    stops?: Stop[];
    center?: [number, number];
    zoom?: number;
    singleBus?: boolean;
    onBusClick?: (busId: string) => void;
    showLocateButton?: boolean;
}

const BusMap: React.FC<BusMapProps> = ({
    buses,
    stops = [],
    center = [28.6139, 77.2090],
    zoom = 13,
    singleBus = false,
    onBusClick,
    showLocateButton = true
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<Map<string, L.Marker>>(new Map());
    const userMarkerRef = useRef<L.Marker | null>(null);
    const userCircleRef = useRef<L.Circle | null>(null);
    const [locating, setLocating] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        mapRef.current = L.map(containerRef.current).setView(center, zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapRef.current);

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    // Locate user function
    const locateMe = useCallback(() => {
        if (!mapRef.current || !navigator.geolocation) return;

        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                const map = mapRef.current!;

                // Remove existing user marker
                if (userMarkerRef.current) {
                    userMarkerRef.current.remove();
                }
                if (userCircleRef.current) {
                    userCircleRef.current.remove();
                }

                // Create user location marker (blue pulsing dot)
                const userIcon = L.divIcon({
                    className: 'user-location-marker',
                    html: `<div style="
            position: relative;
            width: 20px;
            height: 20px;
          ">
            <div style="
              position: absolute;
              width: 20px;
              height: 20px;
              background: #4285F4;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(66,133,244,0.5);
            "></div>
            <div style="
              position: absolute;
              width: 40px;
              height: 40px;
              left: -10px;
              top: -10px;
              background: rgba(66,133,244,0.2);
              border-radius: 50%;
              animation: pulse 2s infinite;
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(0.5); opacity: 1; }
              100% { transform: scale(1.5); opacity: 0; }
            }
          </style>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                });

                userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
                    .addTo(map)
                    .bindPopup('<strong>Your Location</strong>');

                // Add accuracy circle
                userCircleRef.current = L.circle([latitude, longitude], {
                    radius: accuracy,
                    color: '#4285F4',
                    fillColor: '#4285F4',
                    fillOpacity: 0.1,
                    weight: 1
                }).addTo(map);

                // Pan to user location
                map.setView([latitude, longitude], 15);
                setLocating(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                setLocating(false);
                alert('Could not get your location. Please enable location services.');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, []);

    // Update bus markers
    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;

        // Update or create bus markers
        buses.forEach((bus) => {
            if (!bus.lat || !bus.lng) return;

            const existing = markersRef.current.get(bus.busId);

            if (existing) {
                existing.setLatLng([bus.lat, bus.lng]);
            } else {
                const icon = L.divIcon({
                    className: 'bus-marker',
                    html: `<div style="
            background: linear-gradient(135deg, #628141 0%, #8BAE66 100%);
            border: 3px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
          </div>`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                });

                const marker = L.marker([bus.lat, bus.lng], { icon })
                    .addTo(map)
                    .bindPopup(`<div class="text-center"><strong>${bus.busNumber}</strong>${bus.routeName ? `<br/>${bus.routeName}` : ''}</div>`);

                if (onBusClick) {
                    marker.on('click', () => onBusClick(bus.busId));
                }

                markersRef.current.set(bus.busId, marker);
            }
        });

        // Center on first bus if available
        if (buses.length > 0 && buses[0].lat && buses[0].lng) {
            map.setView([buses[0].lat, buses[0].lng], map.getZoom());
        }
    }, [buses, onBusClick]);

    // Draw stops and route line
    useEffect(() => {
        if (!mapRef.current || stops.length === 0) return;

        const map = mapRef.current;
        const validStops = stops.filter(s => s.lat && s.lng);

        // Draw stop markers
        validStops.forEach((stop) => {
            const icon = L.divIcon({
                className: 'stop-marker',
                html: `<div style="
          background: #EBD5AB;
          border: 2px solid #1B211A;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
          color: #1B211A;
        ">${stop.order}</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });

            L.marker([stop.lat!, stop.lng!], { icon })
                .addTo(map)
                .bindPopup(`<strong>Stop ${stop.order}</strong><br/>${stop.name}`);
        });

        // Draw route line
        if (validStops.length > 1) {
            const latlngs = validStops
                .sort((a, b) => a.order - b.order)
                .map(s => [s.lat!, s.lng!] as [number, number]);

            L.polyline(latlngs, {
                color: '#628141',
                weight: 4,
                opacity: 0.7,
                dashArray: '10, 10'
            }).addTo(map);
        }
    }, [stops]);

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <div
                ref={containerRef}
                style={{ height: '100%', width: '100%', borderRadius: '12px' }}
            />

            {/* Locate Me Button */}
            {showLocateButton && (
                <button
                    onClick={locateMe}
                    disabled={locating}
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 1000,
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        border: '2px solid #e5e7eb',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        cursor: locating ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                    }}
                    title="Locate me"
                >
                    {locating ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" />
                            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" fill="#4285F4" />
                            <circle cx="12" cy="12" r="8" />
                            <line x1="12" y1="2" x2="12" y2="4" />
                            <line x1="12" y1="20" x2="12" y2="22" />
                            <line x1="2" y1="12" x2="4" y2="12" />
                            <line x1="20" y1="12" x2="22" y2="12" />
                        </svg>
                    )}
                </button>
            )}
        </div>
    );
};

export default BusMap;
