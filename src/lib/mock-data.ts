// Mock Data for Student Bus Management System

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'driver';
  avatar?: string;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  address: string;
  distanceKm: number;
  busId: string;
  routeId: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface Bus {
  id: string;
  busNumber: string;
  registrationNumber: string;
  capacity: number;
  currentStudents: number;
  driverId: string;
  routeId: string;
  status: 'active' | 'maintenance' | 'inactive';
  model: string;
  year: number;
}

export interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  stops: RouteStop[];
  totalDistanceKm: number;
  estimatedTime: string;
  busId: string;
}

export interface RouteStop {
  id: string;
  name: string;
  order: number;
  distanceFromStart: number;
  estimatedArrival: string;
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  busId: string;
  status: 'on-duty' | 'off-duty' | 'on-leave';
  joinDate: string;
  experience: number;
}

export interface Subscription {
  id: string;
  studentId: string;
  month: string;
  year: number;
  distanceKm: number;
  pricePerKm: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  paidDate?: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: 'card' | 'upi' | 'netbanking' | 'cash';
  transactionId: string;
  date: string;
  status: 'success' | 'failed' | 'pending';
}

export interface PricingConfig {
  id: string;
  pricePerKm: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface DutySchedule {
  id: string;
  driverId: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'both';
  status: 'scheduled' | 'completed' | 'cancelled';
  morningPickup?: TripInfo;
  afternoonDrop?: TripInfo;
}

export interface TripInfo {
  startTime: string;
  endTime?: string;
  status: 'pending' | 'in-progress' | 'completed';
  studentsPresent: number;
  totalStudents: number;
}

// Current Pricing
export const currentPricing: PricingConfig = {
  id: 'price-1',
  pricePerKm: 150,
  effectiveFrom: '2025-01-01',
  isActive: true,
};

// Mock Users
export const mockUsers: User[] = [
  { id: 'user-1', name: 'Aarav Sharma', email: 'aarav@school.edu', role: 'student' },
  { id: 'user-2', name: 'Admin User', email: 'admin@school.edu', role: 'admin' },
  { id: 'user-3', name: 'Rajesh Kumar', email: 'rajesh@school.edu', role: 'driver' },
];

// Mock Students
export const mockStudents: Student[] = [
  {
    id: 'student-1',
    userId: 'user-1',
    name: 'Aarav Sharma',
    email: 'aarav@school.edu',
    phone: '+91 98765 43210',
    class: '10',
    section: 'A',
    address: '123 Green Park, New Delhi',
    distanceKm: 8.5,
    busId: 'bus-1',
    routeId: 'route-1',
    enrollmentDate: '2024-04-01',
    status: 'active',
  },
  {
    id: 'student-2',
    userId: 'user-4',
    name: 'Priya Patel',
    email: 'priya@school.edu',
    phone: '+91 98765 43211',
    class: '9',
    section: 'B',
    address: '45 Lajpat Nagar, New Delhi',
    distanceKm: 12.0,
    busId: 'bus-1',
    routeId: 'route-1',
    enrollmentDate: '2024-04-01',
    status: 'active',
  },
  {
    id: 'student-3',
    userId: 'user-5',
    name: 'Arjun Singh',
    email: 'arjun@school.edu',
    phone: '+91 98765 43212',
    class: '11',
    section: 'A',
    address: '78 Vasant Kunj, New Delhi',
    distanceKm: 15.2,
    busId: 'bus-2',
    routeId: 'route-2',
    enrollmentDate: '2024-04-01',
    status: 'active',
  },
  {
    id: 'student-4',
    userId: 'user-6',
    name: 'Ananya Gupta',
    email: 'ananya@school.edu',
    phone: '+91 98765 43213',
    class: '8',
    section: 'C',
    address: '22 Saket, New Delhi',
    distanceKm: 6.8,
    busId: 'bus-2',
    routeId: 'route-2',
    enrollmentDate: '2024-04-01',
    status: 'active',
  },
  {
    id: 'student-5',
    userId: 'user-7',
    name: 'Rohan Verma',
    email: 'rohan@school.edu',
    phone: '+91 98765 43214',
    class: '12',
    section: 'A',
    address: '56 Dwarka Sector 12, New Delhi',
    distanceKm: 18.5,
    busId: 'bus-3',
    routeId: 'route-3',
    enrollmentDate: '2024-04-01',
    status: 'pending',
  },
];

// Mock Buses
export const mockBuses: Bus[] = [
  {
    id: 'bus-1',
    busNumber: 'BUS-001',
    registrationNumber: 'DL 01 AB 1234',
    capacity: 40,
    currentStudents: 32,
    driverId: 'driver-1',
    routeId: 'route-1',
    status: 'active',
    model: 'Tata Starbus',
    year: 2022,
  },
  {
    id: 'bus-2',
    busNumber: 'BUS-002',
    registrationNumber: 'DL 01 CD 5678',
    capacity: 35,
    currentStudents: 28,
    driverId: 'driver-2',
    routeId: 'route-2',
    status: 'active',
    model: 'Ashok Leyland',
    year: 2023,
  },
  {
    id: 'bus-3',
    busNumber: 'BUS-003',
    registrationNumber: 'DL 01 EF 9012',
    capacity: 45,
    currentStudents: 38,
    driverId: 'driver-3',
    routeId: 'route-3',
    status: 'active',
    model: 'Eicher Skyline',
    year: 2021,
  },
  {
    id: 'bus-4',
    busNumber: 'BUS-004',
    registrationNumber: 'DL 01 GH 3456',
    capacity: 40,
    currentStudents: 0,
    driverId: '',
    routeId: '',
    status: 'maintenance',
    model: 'Force Traveller',
    year: 2020,
  },
];

// Mock Routes
export const mockRoutes: Route[] = [
  {
    id: 'route-1',
    name: 'South Delhi Route',
    startPoint: 'School Campus',
    endPoint: 'Green Park Metro',
    stops: [
      { id: 'stop-1', name: 'School Campus', order: 1, distanceFromStart: 0, estimatedArrival: '07:00' },
      { id: 'stop-2', name: 'Lajpat Nagar', order: 2, distanceFromStart: 5, estimatedArrival: '07:20' },
      { id: 'stop-3', name: 'Defence Colony', order: 3, distanceFromStart: 8, estimatedArrival: '07:35' },
      { id: 'stop-4', name: 'Green Park Metro', order: 4, distanceFromStart: 12, estimatedArrival: '07:50' },
    ],
    totalDistanceKm: 12,
    estimatedTime: '50 mins',
    busId: 'bus-1',
  },
  {
    id: 'route-2',
    name: 'West Delhi Route',
    startPoint: 'School Campus',
    endPoint: 'Dwarka Sector 21',
    stops: [
      { id: 'stop-5', name: 'School Campus', order: 1, distanceFromStart: 0, estimatedArrival: '07:00' },
      { id: 'stop-6', name: 'Vasant Kunj', order: 2, distanceFromStart: 6, estimatedArrival: '07:25' },
      { id: 'stop-7', name: 'Dwarka Sector 12', order: 3, distanceFromStart: 12, estimatedArrival: '07:45' },
      { id: 'stop-8', name: 'Dwarka Sector 21', order: 4, distanceFromStart: 18, estimatedArrival: '08:05' },
    ],
    totalDistanceKm: 18,
    estimatedTime: '65 mins',
    busId: 'bus-2',
  },
  {
    id: 'route-3',
    name: 'North Delhi Route',
    startPoint: 'School Campus',
    endPoint: 'Rohini Sector 18',
    stops: [
      { id: 'stop-9', name: 'School Campus', order: 1, distanceFromStart: 0, estimatedArrival: '07:00' },
      { id: 'stop-10', name: 'Pitampura', order: 2, distanceFromStart: 8, estimatedArrival: '07:30' },
      { id: 'stop-11', name: 'Rohini Sector 7', order: 3, distanceFromStart: 14, estimatedArrival: '07:50' },
      { id: 'stop-12', name: 'Rohini Sector 18', order: 4, distanceFromStart: 20, estimatedArrival: '08:10' },
    ],
    totalDistanceKm: 20,
    estimatedTime: '70 mins',
    busId: 'bus-3',
  },
];

// Mock Drivers
export const mockDrivers: Driver[] = [
  {
    id: 'driver-1',
    userId: 'user-3',
    name: 'Rajesh Kumar',
    email: 'rajesh@school.edu',
    phone: '+91 99887 76655',
    licenseNumber: 'DL-1234567890',
    busId: 'bus-1',
    status: 'on-duty',
    joinDate: '2020-06-15',
    experience: 8,
  },
  {
    id: 'driver-2',
    userId: 'user-8',
    name: 'Suresh Yadav',
    email: 'suresh@school.edu',
    phone: '+91 99887 76656',
    licenseNumber: 'DL-0987654321',
    busId: 'bus-2',
    status: 'on-duty',
    joinDate: '2021-03-10',
    experience: 5,
  },
  {
    id: 'driver-3',
    userId: 'user-9',
    name: 'Mahesh Chauhan',
    email: 'mahesh@school.edu',
    phone: '+91 99887 76657',
    licenseNumber: 'DL-1122334455',
    busId: 'bus-3',
    status: 'off-duty',
    joinDate: '2019-08-20',
    experience: 10,
  },
];

// Mock Subscriptions
export const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-1',
    studentId: 'student-1',
    month: 'January',
    year: 2026,
    distanceKm: 8.5,
    pricePerKm: 150,
    totalAmount: 1275,
    status: 'paid',
    dueDate: '2026-01-05',
    paidDate: '2026-01-03',
  },
  {
    id: 'sub-2',
    studentId: 'student-2',
    month: 'January',
    year: 2026,
    distanceKm: 12.0,
    pricePerKm: 150,
    totalAmount: 1800,
    status: 'paid',
    dueDate: '2026-01-05',
    paidDate: '2026-01-04',
  },
  {
    id: 'sub-3',
    studentId: 'student-3',
    month: 'January',
    year: 2026,
    distanceKm: 15.2,
    pricePerKm: 150,
    totalAmount: 2280,
    status: 'pending',
    dueDate: '2026-01-05',
  },
  {
    id: 'sub-4',
    studentId: 'student-4',
    month: 'January',
    year: 2026,
    distanceKm: 6.8,
    pricePerKm: 150,
    totalAmount: 1020,
    status: 'overdue',
    dueDate: '2026-01-05',
  },
];

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: 'pay-1',
    subscriptionId: 'sub-1',
    studentId: 'student-1',
    studentName: 'Aarav Sharma',
    amount: 1275,
    method: 'upi',
    transactionId: 'TXN123456789',
    date: '2026-01-03',
    status: 'success',
  },
  {
    id: 'pay-2',
    subscriptionId: 'sub-2',
    studentId: 'student-2',
    studentName: 'Priya Patel',
    amount: 1800,
    method: 'card',
    transactionId: 'TXN987654321',
    date: '2026-01-04',
    status: 'success',
  },
  {
    id: 'pay-3',
    subscriptionId: 'sub-prev-1',
    studentId: 'student-1',
    studentName: 'Aarav Sharma',
    amount: 1275,
    method: 'netbanking',
    transactionId: 'TXN111222333',
    date: '2025-12-03',
    status: 'success',
  },
];

// Mock Duty Schedules
export const mockDutySchedules: DutySchedule[] = [
  {
    id: 'duty-1',
    driverId: 'driver-1',
    date: '2026-01-01',
    shift: 'both',
    status: 'scheduled',
    morningPickup: {
      startTime: '06:30',
      status: 'pending',
      studentsPresent: 0,
      totalStudents: 32,
    },
    afternoonDrop: {
      startTime: '14:30',
      status: 'pending',
      studentsPresent: 0,
      totalStudents: 32,
    },
  },
  {
    id: 'duty-2',
    driverId: 'driver-1',
    date: '2025-12-31',
    shift: 'both',
    status: 'completed',
    morningPickup: {
      startTime: '06:30',
      endTime: '07:50',
      status: 'completed',
      studentsPresent: 30,
      totalStudents: 32,
    },
    afternoonDrop: {
      startTime: '14:30',
      endTime: '15:45',
      status: 'completed',
      studentsPresent: 31,
      totalStudents: 32,
    },
  },
];

// Helper Functions
export const calculateMonthlyFee = (distanceKm: number, pricePerKm: number = currentPricing.pricePerKm): number => {
  return Math.round(distanceKm * pricePerKm);
};

export const getStudentById = (id: string): Student | undefined => {
  return mockStudents.find(s => s.id === id);
};

export const getBusById = (id: string): Bus | undefined => {
  return mockBuses.find(b => b.id === id);
};

export const getRouteById = (id: string): Route | undefined => {
  return mockRoutes.find(r => r.id === id);
};

export const getDriverById = (id: string): Driver | undefined => {
  return mockDrivers.find(d => d.id === id);
};

export const getSubscriptionsByStudentId = (studentId: string): Subscription[] => {
  return mockSubscriptions.filter(s => s.studentId === studentId);
};

export const getPaymentsByStudentId = (studentId: string): Payment[] => {
  return mockPayments.filter(p => p.studentId === studentId);
};

// Analytics Data
export const analyticsData = {
  totalStudents: mockStudents.length,
  activeStudents: mockStudents.filter(s => s.status === 'active').length,
  totalBuses: mockBuses.length,
  activeBuses: mockBuses.filter(b => b.status === 'active').length,
  totalDrivers: mockDrivers.length,
  activeDrivers: mockDrivers.filter(d => d.status === 'on-duty').length,
  totalRoutes: mockRoutes.length,
  monthlyRevenue: mockPayments
    .filter(p => p.date.startsWith('2026-01') && p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0),
  pendingPayments: mockSubscriptions.filter(s => s.status === 'pending').length,
  overduePayments: mockSubscriptions.filter(s => s.status === 'overdue').length,
};
