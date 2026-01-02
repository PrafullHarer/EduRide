import { io, Socket } from 'socket.io-client';

// Socket.IO is not supported on Vercel serverless functions
// Use environment variable or fallback to polling API
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<(data: any) => void>> = new Map();

    connect() {
        if (this.socket?.connected) return;
        
        // Skip socket connection if no URL is provided (Vercel deployment)
        if (!SOCKET_URL) {
            console.warn('Socket.IO URL not configured. Real-time features will be limited.');
            return;
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        // Re-register listeners
        this.listeners.forEach((callbacks, event) => {
            callbacks.forEach(callback => {
                this.socket?.on(event, callback);
            });
        });
    }

    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }

    subscribeToBus(busId: string) {
        this.socket?.emit('subscribe-bus', busId);
    }

    subscribeToAllBuses() {
        this.socket?.emit('subscribe-all-buses');
    }

    onBusLocationUpdate(callback: (data: any) => void) {
        const event = 'bus-location-update';
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback);
        this.socket?.on(event, callback);

        return () => {
            this.listeners.get(event)?.delete(callback);
            this.socket?.off(event, callback);
        };
    }

    onBusTrackingStopped(callback: (data: any) => void) {
        const event = 'bus-tracking-stopped';
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback);
        this.socket?.on(event, callback);

        return () => {
            this.listeners.get(event)?.delete(callback);
            this.socket?.off(event, callback);
        };
    }
}

export const socketService = new SocketService();
