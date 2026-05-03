import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar, BookOpen, Users, Home, Bell, LayoutDashboard,
  Moon, Sun, UserCog, LogOut,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

const baseNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
  { id: "faculty", label: "Faculty", icon: Users, path: "/faculty" },
  { id: "rooms", label: "Rooms", icon: Home, path: "/rooms" },
  { id: "timetables", label: "Timetables", icon: Calendar, path: "/timetables" },
  { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
];

// Teacher see full nav
const teacherNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/teacher" },
  { id: "timetables", label: "My Timetables", icon: Calendar, path: "/timetables" },
  { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
  { id: "faculty", label: "Faculty", icon: Users, path: "/faculty" },
  { id: "rooms", label: "Rooms", icon: Home, path: "/rooms" },
  { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
];

// Student see only dashboard and timetables
const studentNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/student" },
  { id: "timetables", label: "My Timetables", icon: Calendar, path: "/timetables" },
];

const roleBadgeStyle = {
  super_admin: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  admin: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
  teacher: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
  student: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
};

export function Layout({ children, pendingTasks = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, roleTheme } = useTheme();
  const { user, logout, isSuperAdmin, isTeacher, isStudent } = useAuth();

  const navItems = isSuperAdmin()
    ? [...baseNavItems, { id: "users", label: "Users", icon: UserCog, path: "/users" }]
    : isStudent()
    ? studentNavItems
    : isTeacher()
    ? teacherNavItems
    : baseNavItems;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(135deg, #0f172a, #1c1917, #0f172a)"
              : `linear-gradient(135deg, ${roleTheme.primaryLight}, ${roleTheme.primaryMid}, ${roleTheme.primaryBorder})`,
        }}
      />

      {/* Sidebar */}
      <aside
        className={`w-64 shrink-0 min-h-screen bg-white dark:bg-slate-900 border-r ${roleTheme.sidebar} dark:border-slate-700/60 shadow-sm flex flex-col`}
      >
        <div className="p-5 flex-1">
          {/* Brand + Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                ChronoCampus
              </h2>
              <p className={`text-xs mt-0.5 ${roleTheme.accent} dark:text-slate-400`}>
                Smart Management
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg dark:bg-slate-800 dark:border-slate-600 hover:opacity-80 transition-colors border"
              style={{
                backgroundColor: theme === "dark" ? undefined : roleTheme.primaryMid,
                borderColor: theme === "dark" ? undefined : roleTheme.primaryBorder,
              }}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" style={{ color: roleTheme.primary }} />
              )}
            </button>
          </div>

          {/* User info */}
          {user && (
            <div
              className="mb-5 p-3 rounded-lg border dark:bg-slate-800 dark:border-slate-700"
              style={{
                backgroundColor: theme === "dark" ? undefined : roleTheme.primaryLight,
                borderColor: theme === "dark" ? undefined : roleTheme.primaryBorder,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className={`text-xs px-2 py-0.5 ${roleBadgeStyle[user.role]}`}>
                  {user.role.replace("_", " ")}
                </Badge>
                {user.department && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {user.department}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.id} to={item.path}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? `${roleTheme.navActive} text-white shadow-md`
                        : `text-slate-600 dark:text-slate-300 ${roleTheme.navHover} dark:hover:bg-slate-800 dark:hover:text-white`
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-white" : "text-slate-400 dark:text-slate-500"
                      }`}
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.id === "notifications" && pendingTasks > 0 && (
                      <span
                        className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {pendingTasks}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
