import { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar, AlertTriangle, Plus, Sparkles, Users, BookOpen,
  Home, CheckCircle, Bell, LayoutDashboard, MessageSquare,
  Moon, Sun, TrendingUp, ChevronRight, LogOut, UserCog,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Chatbot } from "@/components/Chatbot";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
  { id: "faculty", label: "Faculty", icon: Users, path: "/faculty" },
  { id: "rooms", label: "Rooms", icon: Home, path: "/rooms" },
  { id: "timetables", label: "Timetables", icon: Calendar, path: "/timetables" },
  { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
];

function BarChart({ data, color }) {
  if (!data.length) return <p className="text-xs text-slate-400 text-center py-2">No data</p>;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-0.5 min-w-0">
          <span className="text-xs font-bold leading-none" style={{ color }}>{d.value}</span>
          <div className="w-full rounded-t-sm" style={{
            height: `${Math.max((d.value / max) * 40, 3)}px`,
            backgroundColor: color,
            opacity: 0.85,
          }} />
          <span className="text-xs text-slate-400 w-full text-center overflow-hidden" style={{
            fontSize: "9px", whiteSpace: "nowrap", textOverflow: "ellipsis", display: "block"
          }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ value, total, color, label }) {
  const pct = total > 0 ? value / total : 0;
  const r = 22;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 30 30)" />
        <text x="30" y="34" textAnchor="middle" fontSize="12" fontWeight="bold" fill={color}>{value}</text>
      </svg>
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { theme, toggleTheme, roleTheme } = useTheme();
  const { filterByDept, user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };
  
const roleBadgeStyle = {
  super_admin: "bg-blue-100 text-blue-700",
  admin: "bg-violet-100 text-violet-700",
  teacher: "bg-orange-100 text-orange-700",
  student: "bg-amber-100 text-amber-700",
};

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:5000/api/courses"),
      axios.get("http://localhost:5000/api/faculty"),
      axios.get("http://localhost:5000/api/rooms"),
      axios.get("http://localhost:5000/api/timetables"),
      axios.get("http://localhost:5000/api/notifications"),
    ]).then(([c, f, r, t, n]) => {
      setCourses(filterByDept(c.data));
      setFaculty(filterByDept(f.data));
      setRooms(r.data);
      setTimetables(filterByDept(t.data));
      setNotifications(n.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const pendingTasks = notifications.filter(n => !n.isRead).length;
  const published = timetables.filter(t => t.status === "published").length;
  const drafts = timetables.filter(t => t.status === "draft").length;
  const conflicts = timetables.reduce((a, t) => a + (t.conflicts?.length || 0), 0);

  const stats = [
    { label: "Courses", value: courses.length, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30", path: "/courses" },
    { label: "Faculty", value: faculty.length, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30", path: "/faculty" },
    { label: "Rooms", value: rooms.length, icon: Home, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/30", path: "/rooms" },
    { label: "Timetables", value: timetables.length, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30", path: "/timetables" },
    { label: "Published", value: published, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/30", path: "/timetables" },
  ];

  const deptMap = {};
  courses.forEach(c => { deptMap[c.department] = (deptMap[c.department] || 0) + 1; });
  const courseChartData = Object.entries(deptMap).slice(0, 6).map(([k, v]) => ({ label: k.slice(0, 5), value: v }));

  const roomTypes = [
    { type: "lecture_hall", label: "Lecture", color: "#7c3aed" },
    { type: "lab", label: "Lab", color: "#2563eb" },
    { type: "seminar_room", label: "Seminar", color: "#16a34a" },
    { type: "auditorium", label: "Auditorium", color: "#f59e0b" },
  ];

  const notifIcon = (type) => {
    if (type === "error" || type === "warning")
      return <AlertTriangle className={`h-3.5 w-3.5 ${type === "error" ? "text-red-500" : "text-amber-500"}`} />;
    if (type === "success") return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
    return <TrendingUp className="h-3.5 w-3.5 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center"
        style={{ background: theme === "dark" ? "#0f172a" : roleTheme?.primaryLight }}>
        <div className="animate-spin h-8 w-8 border-2 border-t-transparent rounded-full"
          style={{ borderColor: roleTheme?.primary, borderTopColor: "transparent" }} />
      </div>
    );
  }

  const bg = theme === "dark"
    ? "linear-gradient(135deg, #0f172a, #1e293b, #0f172a)"
    : `linear-gradient(135deg, ${roleTheme?.primaryLight}, ${roleTheme?.primaryMid}, ${roleTheme?.primaryBorder})`;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bg }}>

      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-white dark:bg-slate-900 border-r dark:border-slate-700 flex flex-col"
        style={{ borderColor: theme === "dark" ? undefined : roleTheme?.primaryBorder }}>
        <div className="p-4 border-b dark:border-slate-700/60 flex items-center justify-between"
          style={{ borderColor: theme === "dark" ? undefined : roleTheme?.primaryBorder }}>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">ChronoCampus</h2>
            <p className="text-xs dark:text-slate-400" style={{ color: roleTheme?.primary }}>Smart Scheduler</p>
          </div>
          <button onClick={toggleTheme}
            className="p-1.5 rounded-lg dark:bg-slate-700 hover:opacity-80 transition-colors"
            style={{ backgroundColor: theme === "dark" ? undefined : roleTheme?.primaryMid }}>
            {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" style={{ color: roleTheme?.primary }} />}
          </button>
        </div>

        {/* User card with logout */}
        {user && (
          <div className="mx-3 mt-3 p-3 rounded-lg border dark:bg-slate-800 dark:border-slate-700"
            style={{ backgroundColor: theme === "dark" ? undefined : roleTheme?.primaryLight, borderColor: theme === "dark" ? undefined : roleTheme?.primaryBorder }}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
              <button onClick={handleLogout} title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shrink-0">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeStyle[user.role]}`}>
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-0.5">
          {[...navItems, ...(user?.role === "super_admin" ? [{ id: "users", label: "Users", icon: UserCog, path: "/users" }] : [])].map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <Link key={item.id} to={item.path} onClick={() => setActiveNav(item.id)}>
                <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive ? "text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`} style={isActive ? { backgroundColor: roleTheme?.primary } : {}}>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                  <span className="font-medium">{item.label}</span>
                  {item.id === "notifications" && pendingTasks > 0 && (
                    <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                      {pendingTasks}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main — scrollable */}
      <main className="flex-1 overflow-auto p-4 space-y-2">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Welcome, <span style={{ color: roleTheme?.primary }}>{ user?.name || "Super Admin"}</span> 👋
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Here's your institution overview</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsChatOpen(true)}
              className="h-8 w-8 rounded-lg text-white shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center justify-center border-0"
              title="AI Assistant"
              style={{ backgroundColor: roleTheme?.primaryHover }}>
              <MessageSquare className="h-4 w-4" />
            </button>
            <Link to="/timetables">
              <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 h-8 px-3 text-xs">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Generate
              </Button>
            </Link>
          </div>
        </div>

        {/* Row 1 — KPI cards */}
        <div className="grid grid-cols-5 gap-3">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <Link key={i} to={s.path}>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-3 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold leading-none ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Row 2 — Charts */}
        <div className="grid grid-cols-3 gap-3">

          {/* Courses by Dept */}
          <Card className="bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-slate-50 dark:border-slate-700/60 p-2 pb-1.5">
              <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-blue-500" /> Courses by Department
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-2">
              <BarChart data={courseChartData} color={roleTheme?.primary || "#2563eb"} />
            </CardContent>
          </Card>

          {/* Timetable Status donuts */}
          <Card className="bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-slate-50 dark:border-slate-700/60 p-2 pb-1.5">
              <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-500" /> Timetable Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex items-center justify-around">
              <DonutChart value={published} total={Math.max(timetables.length, 1)} color="#16a34a" label="Published" />
              <DonutChart value={drafts} total={Math.max(timetables.length, 1)} color="#f59e0b" label="Draft" />
              <DonutChart value={conflicts} total={Math.max(timetables.length, 1)} color="#ef4444" label="Conflicts" />
            </CardContent>
          </Card>

          {/* Room Types */}
          <Card className="bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-slate-50 dark:border-slate-700/60 p-2 pb-1.5">
              <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Home className="h-3.5 w-3.5 text-violet-500" /> Room Types
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1.5">
              {roomTypes.map(({ type, label, color }) => {
                const count = rooms.filter(r => r.type === type).length;
                const pct = rooms.length > 0 ? (count / rooms.length) * 100 : 0;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">{label}</span>
                      <span className="font-semibold" style={{ color }}>{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Row 3 — Timetables | Quick Actions | Notifications */}
        <div className="grid grid-cols-3 gap-3">

          {/* Recent Timetables */}
          <Card className="bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-slate-50 dark:border-slate-700/60 p-2 pb-1.5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-300">Recent Timetables</CardTitle>
                <Link to="/timetables" className="text-xs hover:underline flex items-center gap-0.5" style={{ color: roleTheme?.primary }}>
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-2 space-y-1.5">
              {timetables.slice(0, 4).length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="h-7 w-7 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                  <p className="text-xs text-slate-400">No timetables yet</p>
                </div>
              ) : (
                timetables.slice(0, 4).map(t => (
                  <div key={t._id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{t.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.department} · Sem {t.semester}</p>
                    </div>
                    <Badge className={`ml-2 text-xs shrink-0 ${t.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                      {t.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-slate-50 dark:border-slate-700/60 p-2 pb-1.5">
              <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1.5">
              {[
                { label: "Add Course", path: "/courses", icon: BookOpen },
                { label: "Add Faculty", path: "/faculty", icon: Users },
                { label: "Add Room", path: "/rooms", icon: Home },
                { label: "Generate Timetable", path: "/timetables", icon: Sparkles },
              ].map((a, i) => (
                <Link key={i} to={a.path}>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium transition-all hover:opacity-80">
                    <a.icon className="h-3.5 w-3.5 shrink-0" style={{ color: roleTheme?.primary }} />
                    {a.label}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-slate-50 dark:border-slate-700/60 p-2 pb-1.5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notifications</CardTitle>
                <Link to="/notifications" className="text-xs hover:underline flex items-center gap-0.5" style={{ color: roleTheme?.primary }}>
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-2 space-y-1.5">
              {notifications.slice(0, 4).length === 0 ? (
                <div className="text-center py-4">
                  <Bell className="h-7 w-7 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                  <p className="text-xs text-slate-400">All caught up!</p>
                </div>
              ) : (
                notifications.slice(0, 4).map(n => (
                  <div key={n._id} className={`flex items-start gap-2 p-2 rounded-lg border text-xs ${
                    n.isRead ? "bg-slate-50 dark:bg-slate-700/40 border-slate-100 dark:border-slate-700" : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
                  }`}>
                    <div className="mt-0.5 shrink-0">{notifIcon(n.type)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{n.title}</p>
                      <p className="text-slate-400 dark:text-slate-500 truncate">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </main>

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)}
        context={{ totalCourses: courses.length, totalFaculty: faculty.length }} />
    </div>
  );
}
