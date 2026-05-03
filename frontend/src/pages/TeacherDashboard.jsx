import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/DashboardSlider";
import {
  Calendar, BookOpen, Bell, Sparkles,
  CheckCircle, AlertTriangle, FileText, Eye,
  MessageSquare, Users, Home,
} from "lucide-react";
import { Chatbot } from "@/components/Chatbot";
const API = "http://localhost:5000/api";

export default function TeacherDashboard() {
  const { user, filterByDept } = useAuth();
  const { roleTheme } = useTheme();

  const [timetables, setTimetables] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/timetables`),
      axios.get(`${API}/courses`),
      axios.get(`${API}/notifications`),
    ]).then(([t, c, n]) => {
      setTimetables(filterByDept(Array.isArray(t.data) ? t.data : []));
      setCourses(filterByDept(Array.isArray(c.data) ? c.data : []));
      setNotifications(Array.isArray(n.data) ? n.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const published = timetables.filter(t => t.status === "published").length;
  const drafts = timetables.filter(t => t.status === "draft").length;
  const unread = notifications.filter(n => !n.isRead).length;
  const fullName = user?.name || "Teacher";

  const kpis = [
    { label: "My Timetables", value: timetables.length, icon: Calendar, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", hover: "hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:border-orange-300" },
    { label: "Published", value: published, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", hover: "hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300" },
    { label: "Drafts", value: drafts, icon: FileText, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20", hover: "hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:border-violet-300" },
    { label: "Dept Courses", value: courses.length, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", hover: "hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300" },
  ];

  const quickActions = [
    { label: "Generate Timetable", path: "/timetables", icon: Sparkles },
    { label: "Browse Courses", path: "/courses", icon: BookOpen },
    { label: "View Faculty", path: "/faculty", icon: Users },
    { label: "View Rooms", path: "/rooms", icon: Home },
    { label: "Notifications", path: "/notifications", icon: Bell },
  ];

  return (
    <Layout pendingTasks={unread}>
      {/* Full viewport height, no scroll */}
      <div className="h-screen overflow-hidden flex flex-col p-5 gap-4">

        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Welcome, <span style={{ color: roleTheme?.primary }}>{fullName}</span> 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.department} Department · Teacher
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* AI Chatbot button — next to Generate */}
            <button onClick={() => setIsChatOpen(true)}
              className="h-9 w-9 rounded-xl text-white shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center justify-center border-0"
              title="AI Assistant"
              style={{ backgroundColor: roleTheme?.primaryHover }}>
              <MessageSquare className="h-4 w-4" />
            </button>
            <Link to="/timetables">
              <Button className="text-white h-9 px-4 text-sm gap-2 border-0"
                style={{ backgroundColor: roleTheme?.primary }}>
                <Sparkles className="h-4 w-4" /> Generate Timetable
              </Button>
            </Link>
          </div>
        </div>

        {/* Body — 2 columns */}
        <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">

          {/* LEFT col (2/3) — KPIs + Slider + Timetables */}
          <div className="col-span-2 flex flex-col gap-3 min-h-0">

            {/* Top row: 2×2 KPI grid (left 60%) + Hero Slider (right 40%) */}
            <div className="grid grid-cols-5 gap-3 shrink-0">

              {/* 2×2 KPI grid — compact */}
              <div className="col-span-3 grid grid-cols-2 gap-2">
                {kpis.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i}
                      className={`bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700 shadow-sm px-3 py-2.5 flex items-center gap-3 transition-all duration-200 cursor-default ${s.hover}`}
                      style={{ borderColor: roleTheme?.primaryBorder }}>                      <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-4 w-4 ${s.color}`} />
                      </div>
                      <div>
                        <p className={`text-xl font-bold leading-none ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hero Slider — same height as KPI grid */}
              <div className="col-span-2 flex">
                <HeroSlider notifications={notifications} timetables={timetables} />
              </div>
            </div>

            {/* My Timetables — fills remaining height */}
            <Card className="bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm flex-1 min-h-0 flex flex-col"
              style={{ borderColor: roleTheme?.primaryBorder }}>
              <CardHeader className="border-b dark:border-slate-700/60 pb-3 shrink-0"
                style={{ borderColor: roleTheme?.primaryBorder }}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: roleTheme?.primary }} /> My Timetables
                  </CardTitle>
                  <Link to="/timetables" className="text-xs hover:underline" style={{ color: roleTheme?.primary }}>
                    View all →
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2 flex-1">
                {loading ? (
                  [1,2,3].map(i => (
                    <div key={i} className="h-12 rounded-lg animate-pulse"
                      style={{ backgroundColor: roleTheme?.primaryLight }} />
                  ))
                ) : timetables.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm text-slate-400">No timetables yet</p>
                    <Link to="/timetables">
                      <Button size="sm" className="mt-3 text-white gap-1 border-0"
                        style={{ backgroundColor: roleTheme?.primary }}>
                        <Sparkles className="h-3.5 w-3.5" /> Generate Now
                      </Button>
                    </Link>
                  </div>
                ) : (
                  timetables.slice(0, 5).map(t => (
                    <div key={t._id}
                      className="flex items-center justify-between p-2.5 rounded-lg border dark:border-slate-700/50 hover:opacity-90 transition-colors"
                      style={{ backgroundColor: roleTheme?.primaryLight, borderColor: roleTheme?.primaryBorder }}>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{t.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.department} · Sem {t.semester} · {t.year}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <Badge className={t.status === "published"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 text-xs"
                          : "bg-amber-100 text-amber-700 border-amber-200 text-xs"}>
                          {t.status}
                        </Badge>
                        <Link to="/timetables">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                            style={{ color: roleTheme?.primary }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT col (1/3) — Quick Actions + Notifications */}
          <div className="col-span-1 flex flex-col gap-4 min-h-0">

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm shrink-0"
              style={{ borderColor: roleTheme?.primaryBorder }}>
              <CardHeader className="border-b dark:border-slate-700/60 py-3 px-4"
                style={{ borderColor: roleTheme?.primaryBorder }}>
                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {quickActions.map((a, i) => (
                  <Link key={i} to={a.path}>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium transition-all cursor-pointer hover:opacity-80">
                      <a.icon className="h-3.5 w-3.5 shrink-0" style={{ color: roleTheme?.primary }} />
                      {a.label}
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Notifications — fills remaining height */}
            <Card className="bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm flex-1 min-h-0 flex flex-col"
              style={{ borderColor: roleTheme?.primaryBorder }}>
              <CardHeader className="border-b dark:border-slate-700/60 py-3 px-4 shrink-0"
                style={{ borderColor: roleTheme?.primaryBorder }}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="h-4 w-4" style={{ color: roleTheme?.primary }} /> Notifications
                  </CardTitle>
                  <Link to="/notifications" className="text-xs hover:underline" style={{ color: roleTheme?.primary }}>
                    View all →
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2 flex-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">All caught up!</p>
                ) : (
                  <>
                    {notifications.slice(0, 3).map(n => (
                      <div key={n._id}
                        className={`p-2 rounded-lg border text-xs ${n.isRead
                          ? "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700"
                          : "border-orange-100 dark:border-orange-800"}`}
                        style={!n.isRead ? { backgroundColor: roleTheme?.primaryLight } : {}}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {n.type === "error" || n.type === "warning"
                            ? <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                            : <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />}
                          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{n.title}</p>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 truncate pl-4">{n.message}</p>
                      </div>
                    ))}
                    {notifications.length > 3}
                  </>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)}
        context={{ totalCourses: courses.length, department: user?.department }} />
    </Layout>
  );
}
