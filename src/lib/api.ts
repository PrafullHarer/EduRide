// Use environment variable or default to relative path for Vercel
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper to get auth token
const getToken = () => localStorage.getItem('token');

// Helper for authenticated requests
const authFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

// Auth API
export const authAPI = {
    login: async (email: string, password: string, role: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    register: async (userData: { name: string; email: string; password: string; role: string;[key: string]: any }) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    me: () => authFetch('/auth/me'),
};

// Students API
export const studentsAPI = {
    getAll: () => authFetch('/students'),
    getById: (id: string) => authFetch(`/students/${id}`),
    getByUserId: (userId: string) => authFetch(`/students/user/${userId}`),
    create: (data: any) => authFetch('/students', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => authFetch(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => authFetch(`/students/${id}`, { method: 'DELETE' }),
};

// Buses API
export const busesAPI = {
    getAll: () => authFetch('/buses'),
    getById: (id: string) => authFetch(`/buses/${id}`),
    create: (data: any) => authFetch('/buses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => authFetch(`/buses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => authFetch(`/buses/${id}`, { method: 'DELETE' }),
};

// Routes API
export const routesAPI = {
    getAll: () => authFetch('/routes'),
    getById: (id: string) => authFetch(`/routes/${id}`),
    create: (data: any) => authFetch('/routes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => authFetch(`/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => authFetch(`/routes/${id}`, { method: 'DELETE' }),
};

// Drivers API
export const driversAPI = {
    getAll: () => authFetch('/drivers'),
    getById: (id: string) => authFetch(`/drivers/${id}`),
    getByUserId: (userId: string) => authFetch(`/drivers/user/${userId}`),
    getSchedules: (id: string) => authFetch(`/drivers/${id}/schedules`),
    create: (data: any) => authFetch('/drivers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => authFetch(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => authFetch(`/drivers/${id}`, { method: 'DELETE' }),
};

// Subscriptions API
export const subscriptionsAPI = {
    getAll: () => authFetch('/subscriptions'),
    getByStudentId: (studentId: string) => authFetch(`/subscriptions/student/${studentId}`),
    getById: (id: string) => authFetch(`/subscriptions/${id}`),
    create: (data: any) => authFetch('/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => authFetch(`/subscriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => authFetch(`/subscriptions/${id}`, { method: 'DELETE' }),
};

// Payments API
export const paymentsAPI = {
    getAll: () => authFetch('/payments'),
    getByStudentId: (studentId: string) => authFetch(`/payments/student/${studentId}`),
    getById: (id: string) => authFetch(`/payments/${id}`),
    create: (data: any) => authFetch('/payments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => authFetch(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Schedules API
export const schedulesAPI = {
    getAll: () => authFetch('/schedules'),
    getTodayForDriver: (driverId: string) => authFetch(`/schedules/today/${driverId}`),
    create: (data: any) => authFetch('/schedules', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => authFetch(`/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Analytics API
export const analyticsAPI = {
    get: () => authFetch('/analytics'),
};

// Pricing constant
export const PRICE_PER_KM = 150;

export const calculateMonthlyFee = (distanceKm: number) => {
    return Math.round(distanceKm * PRICE_PER_KM);
};
