import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Loading fallback that persists the layout to prevent flashing/black screens
const PageLoader = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <DashboardLayout title="EduRide" subtitle="Loading...">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
};

// Lazy load all pages for faster initial load
// Common
const LoginPage = lazy(() => import("./pages/LoginPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const BusTracking = lazy(() => import("./pages/admin/BusTracking"));
const Students = lazy(() => import("./pages/admin/Students"));
const Buses = lazy(() => import("./pages/admin/Buses"));
const AdminRoutes = lazy(() => import("./pages/admin/Routes"));
const Drivers = lazy(() => import("./pages/admin/Drivers"));
const AdminSubscriptions = lazy(() => import("./pages/admin/Subscriptions"));
const AdminPayments = lazy(() => import("./pages/admin/Payments"));
const Pricing = lazy(() => import("./pages/admin/Pricing"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Messages = lazy(() => import("./pages/admin/Messages"));

// Student Pages
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const TrackBus = lazy(() => import("./pages/student/TrackBus"));
const MySubscription = lazy(() => import("./pages/student/MySubscription"));
const StudentPayments = lazy(() => import("./pages/student/Payments"));
const MyRoute = lazy(() => import("./pages/student/MyRoute"));
const Profile = lazy(() => import("./pages/student/Profile"));

// Driver Pages
const DriverDashboard = lazy(() => import("./pages/driver/DriverDashboard"));
const ManageRoute = lazy(() => import("./pages/driver/ManageRoute"));
const DutySchedule = lazy(() => import("./pages/driver/DutySchedule"));
const DriverRoute = lazy(() => import("./pages/driver/DriverRoute"));
const DriverStudents = lazy(() => import("./pages/driver/DriverStudents"));
const TripLog = lazy(() => import("./pages/driver/TripLog"));

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to={`/${user?.role}`} replace /> : <LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to={`/${user?.role}`} replace /> : <LoginPage />} />

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/track" element={<ProtectedRoute allowedRoles={['student']}><TrackBus /></ProtectedRoute>} />
        <Route path="/student/subscription" element={<ProtectedRoute allowedRoles={['student']}><MySubscription /></ProtectedRoute>} />
        <Route path="/student/payments" element={<ProtectedRoute allowedRoles={['student']}><StudentPayments /></ProtectedRoute>} />
        <Route path="/student/route" element={<ProtectedRoute allowedRoles={['student']}><MyRoute /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><Profile /></ProtectedRoute>} />
        <Route path="/student/settings" element={<ProtectedRoute allowedRoles={['student']}><Profile /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/tracking" element={<ProtectedRoute allowedRoles={['admin']}><BusTracking /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><Students /></ProtectedRoute>} />
        <Route path="/admin/buses" element={<ProtectedRoute allowedRoles={['admin']}><Buses /></ProtectedRoute>} />
        <Route path="/admin/routes" element={<ProtectedRoute allowedRoles={['admin']}><AdminRoutes /></ProtectedRoute>} />
        <Route path="/admin/drivers" element={<ProtectedRoute allowedRoles={['admin']}><Drivers /></ProtectedRoute>} />
        <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={['admin']}><AdminSubscriptions /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><AdminPayments /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={['admin']}><Messages /></ProtectedRoute>} />
        <Route path="/admin/pricing" element={<ProtectedRoute allowedRoles={['admin']}><Pricing /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />

        {/* Driver Routes */}
        <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
        <Route path="/driver/manage-route" element={<ProtectedRoute allowedRoles={['driver']}><ManageRoute /></ProtectedRoute>} />
        <Route path="/driver/schedule" element={<ProtectedRoute allowedRoles={['driver']}><DutySchedule /></ProtectedRoute>} />
        <Route path="/driver/route" element={<ProtectedRoute allowedRoles={['driver']}><DriverRoute /></ProtectedRoute>} />
        <Route path="/driver/students" element={<ProtectedRoute allowedRoles={['driver']}><DriverStudents /></ProtectedRoute>} />
        <Route path="/driver/trips" element={<ProtectedRoute allowedRoles={['driver']}><TripLog /></ProtectedRoute>} />
        <Route path="/driver/settings" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
