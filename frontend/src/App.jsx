import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CoursesPage from "./pages/Courses";
import FacultyPage from "./pages/Faculty";
import RoomPage from "./pages/Rooms";
import TimetablePage from "./pages/Timetable";
import NotificationsPage from "./pages/Notifications";
import UserManagementPage from "./pages/UserManagement";

// Redirect to role-specific home
function RoleHome() {
  const { user } = useAuth();
  console.log("RoleHome - Current user role:", user?.role);
  if (user?.role === "student") {
    console.log("Redirecting student to /student");
    return <Navigate to="/student" replace />;
  }
  if (user?.role === "teacher") {
    console.log("Redirecting teacher to /teacher");
    return <Navigate to="/teacher" replace />;
  }
  console.log("Rendering admin dashboard");
  return <Dashboard />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      {/* Root — redirects based on role */}
      <Route path="/" element={<ProtectedRoute><RoleHome /></ProtectedRoute>} />

      {/* Student dashboard */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentDashboard />
        </ProtectedRoute>
      } />

      {/* Teacher dashboard */}
      <Route path="/teacher" element={
        <ProtectedRoute allowedRoles={["teacher"]}>
          <TeacherDashboard />
        </ProtectedRoute>
      } />

      {/* Shared pages — all roles */}
      <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
      <Route path="/faculty" element={<ProtectedRoute><FacultyPage /></ProtectedRoute>} />
      <Route path="/rooms" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
      <Route path="/timetables" element={<ProtectedRoute><TimetablePage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

      {/* Super admin only */}
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={["super_admin"]}>
          <UserManagementPage />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
