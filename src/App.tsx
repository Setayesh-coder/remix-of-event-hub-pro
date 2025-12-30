import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import Profile from "./pages/Profile";
import Gallery from "./pages/Gallery";
import Schedule from "./pages/Schedule";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// ادمین
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminIndex from "./admin/AdminIndex";
import AdminGallery from "./admin/AdminGallery";
import AdminCourses from "./admin/AdminCourses";
import AdminSchedule from "./admin/AdminSchedule";
import AdminProfile from "./admin/AdminProfile";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* روت‌های عمومی کاربران */}
            <Route path="/" element={<Index />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/workshop" element={<Courses />} />
            <Route path="/courses/webinar" element={<Courses />} />
            <Route path="/courses/training" element={<Courses />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />

            {/* صفحه لاگین ادمین - عمومی است */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* همه روت‌های ادمین - محافظت شده */}
            <Route element={<ProtectedAdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/index" element={<AdminIndex />} />
              <Route path="/admin/gallery" element={<AdminGallery />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/schedule" element={<AdminSchedule />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;