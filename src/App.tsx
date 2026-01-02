import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Common
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import BusTracking from "./pages/admin/BusTracking";
import Students from "./pages/admin/Students";
import Buses from "./pages/admin/Buses";
import AdminRoutes from "./pages/admin/Routes";
import Drivers from "./pages/admin/Drivers";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import AdminPayments from "./pages/admin/Payments";
import Pricing from "./pages/admin/Pricing";
import Settings from "./pages/admin/Settings";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import TrackBus from "./pages/student/TrackBus";
import MySubscription from "./pages/student/MySubscription";
import StudentPayments from "./pages/student/Payments";
import MyRoute from "./pages/student/MyRoute";
import Profile from "./pages/student/Profile";

// Driver Pages
import DriverDashboard from "./pages/driver/DriverDashboard";
import ManageRoute from "./pages/driver/ManageRoute";
import DutySchedule from "./pages/driver/DutySchedule";
import DriverRoute from "./pages/driver/DriverRoute";
import DriverStudents from "./pages/driver/DriverStudents";
import TripLog from "./pages/driver/TripLog";

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
