import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Building2, LogOut, Loader, Bell, AlertTriangle, CheckCircle, Info, Check, Clock, BookOpen, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import boyImage from "@/assets/images/image.png";
import logo from "@/assets/images/logo.png";

const API = "http://localhost:5000/api";

const ChartWithTooltip = ({ summary }) => {
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useState(null)[1];

  const courses = Object.entries(summary.courseCounts);
  const colors = [
    "#0ea5e9", "#06b6d4", "#10b981", "#3b82f6", "#8b5cf6",
    "#ec4899", "#f59e0b", "#ef4444"
  ];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div 
      className="flex items-center justify-center relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredCourse(null)}
    >
      <svg width="380" height="280" viewBox="0 0 280 280" className="drop-shadow-xl">
        {(() => {
          let currentAngle = -90;
          const cx = 140, cy = 140, r = 90, innerR = 60;

          return courses.map(([course, count], idx) => {
            const percentage = count / summary.totalLectures;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = cx + r * Math.cos(startRad);
            const y1 = cy + r * Math.sin(startRad);
            const x2 = cx + r * Math.cos(endRad);
            const y2 = cy + r * Math.sin(endRad);

            const x3 = cx + innerR * Math.cos(endRad);
            const y3 = cy + innerR * Math.sin(endRad);
            const x4 = cx + innerR * Math.cos(startRad);
            const y4 = cy + innerR * Math.sin(startRad);

            const largeArc = angle > 180 ? 1 : 0;
            const pathData = [
              `M ${x1} ${y1}`,
              `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
              `L ${x3} ${y3}`,
              `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
              "Z"
            ].join(" ");

            currentAngle = endAngle;

            return (
              <g 
                key={idx} 
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredCourse({ course, count, color: colors[idx % colors.length], percentage: Math.round(percentage * 100) })}
                onMouseLeave={() => setHoveredCourse(null)}
              >
                <path
                  d={pathData}
                  fill={colors[idx % colors.length]}
                  stroke="white"
                  strokeWidth={hoveredCourse?.course === course ? "3" : "2"}
                  className="transition-all"
                  opacity={hoveredCourse && hoveredCourse.course !== course ? "0.5" : "1"}
                />
              </g>
            );
          });
        })()}
      </svg>

      {/* Custom Tooltip - Positioned relative to container */}
      {hoveredCourse && (
        <div 
          className="absolute bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-4 z-50 pointer-events-none whitespace-nowrap"
          style={{
            left: `${tooltipPos.x + 30}px`,
            top: `${tooltipPos.y - 50}px`,
            border: `2px solid ${hoveredCourse.color}`
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: hoveredCourse.color }}
            />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {hoveredCourse.course}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {hoveredCourse.count} lectures • {hoveredCourse.percentage}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState({});
  const [courseMap, setCourseMap] = useState({});
  const [facultyMap, setFacultyMap] = useState({});
  const [roomMap, setRoomMap] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);

  // Fetch published timetables, courses, faculty, and rooms on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses
        const coursesRes = await axios.get(`${API}/courses`);
        const courses = coursesRes.data || [];
        const courseMapping = {};
        courses.forEach((course) => {
          courseMapping[course._id] = course.name;
        });
        setCourseMap(courseMapping);
        
        // Fetch faculty
        const facultyRes = await axios.get(`${API}/faculty`);
        const faculty = facultyRes.data || [];
        const facultyMapping = {};
        faculty.forEach((fac) => {
          facultyMapping[fac._id] = fac.name;
        });
        setFacultyMap(facultyMapping);
        
        // Fetch rooms
        const roomsRes = await axios.get(`${API}/rooms`);
        const rooms = roomsRes.data || [];
        const roomMapping = {};
        rooms.forEach((room) => {
          roomMapping[room._id] = room.name;
        });
        setRoomMap(roomMapping);
        
        // Fetch timetables
        const res = await axios.get(`${API}/timetables?status=published`);
        const published = (res.data || []).filter((t) => t.status === "published");
        setTimetables(published);
        
        // Generate summaries for each timetable
        published.forEach((timetable) => {
          generateSummary(timetable, courseMapping);
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch notifications for student
  useEffect(() => {
    axios.get(`${API}/notifications`)
      .then((res) => {
        const sorted = (Array.isArray(res.data) ? res.data : [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(sorted);
      })
      .catch((err) => console.error("Error fetching notifications:", err))
      .finally(() => setNotifLoading(false));
  }, []);

  // Generate LLM summary for a timetable
  const generateSummary = async (timetable, courseMapping) => {
    try {
      setLoadingSummary((prev) => ({ ...prev, [timetable._id]: true }));

      // Count courses and lectures using course names
      const courseCounts = {};
      const dayCount = {};
      let totalLectures = 0;

      if (timetable.schedule && timetable.schedule.length > 0) {
        timetable.schedule.forEach((entry) => {
          const courseName = courseMapping[entry.courseId] || entry.courseId;
          courseCounts[courseName] = (courseCounts[courseName] || 0) + 1;
          dayCount[entry.day] = (dayCount[entry.day] || 0) + 1;
          totalLectures++;
        });
      }

      // Create a summary message for the AI
      const scheduleText = Object.entries(courseCounts)
        .map(([course, count]) => `${count} lecture(s) of ${course}`)
        .join(", ");

      const message = `Summarize this student timetable in a brief, friendly way: "${timetable.name}" has ${totalLectures} total lectures. ${scheduleText}. Provide a 1-2 sentence summary highlighting the course distribution and workload.`;

      const response = await axios.post(`${API}/ai/chat`, { message });

      setSummaries((prev) => ({
        ...prev,
        [timetable._id]: {
          text: response.data.response,
          courseCounts,
          dayCount,
          totalLectures,
        },
      }));
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummaries((prev) => ({
        ...prev,
        [timetable._id]: {
          text: "Unable to generate summary",
          courseCounts: {},
          dayCount: {},
          totalLectures: 0,
        },
      }));
    } finally {
      setLoadingSummary((prev) => ({ ...prev, [timetable._id]: false }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`${API}/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case "error":   return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "success": return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotifBorder = (type, isRead) => {
    if (isRead) return "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50";
    const map = {
      error:   "border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20 border-red-200",
      warning: "border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200",
      success: "border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200",
      info:    "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200",
    };
    return map[type] || map.info;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 border-b border-white/20 shadow-sm">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ChronoCampus Logo" className="h-10 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ChronoCampus</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || "Student"}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{user?.department || "Department"}</p>
            </div>
            {unreadCount > 0 && (
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </div>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section - Rectangular Card */}
<div className="mb-10 relative overflow-hidden rounded-3xl p-5 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-800 shadow-2xl">          {/* Decorative elements */}
<div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_white,_transparent)]" />          <div className="absolute bottom-0 right-20 w-24 h-24 bg-cyan-300 rounded-full opacity-20 blur-xl" />
          <div className="absolute top-12 right-1/4 w-3 h-3 bg-cyan-300 rounded-full" />
          <div className="absolute bottom-8 right-1/3 w-2 h-2 bg-lime-300 rounded-full" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-lg text-green-100 mb-2">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h2 className="text-5xl font-bold mb-2 text-white">
                Welcome back, {user?.name || "Student"}!
              </h2>
              <p className="text-green-100 text-1.5xl">
                Always stay updated in your student portal
              </p>
            </div>
            
            {/* Illustration with boy image */}
            <div className="hidden md:flex items-center ml-8">
              <img 
                src={boyImage} 
                alt="Student illustration" 
                className="h-64 w-auto object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>

        {loading ? (
          // Skeleton placeholders
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-slate-700 animate-pulse"
              />
            ))}
          </div>
        ) : timetables.length === 0 ? (
          // Empty state
          <Card className="p-12 text-center bg-white dark:bg-slate-800 border-green-200 dark:border-slate-700">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              No published timetables available
            </p>
          </Card>
        ) : (
          // Timetables rendered automatically
          <div className="space-y-8">
            {timetables.map((timetable) => {
              const summary = summaries[timetable._id];
              const isSummaryLoading = loadingSummary[timetable._id];

              return (
                <Card
                  key={timetable._id}
                  className="p-6 bg-white dark:bg-slate-800 border-green-200 dark:border-slate-700"
                >
                  {/* Timetable Header */}
                  <div className="mb-6 pb-4 border-b border-green-200 dark:border-slate-700">
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                      {timetable.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>{timetable.department}</span>
                      <span>•</span>
                      <span>{timetable.semester}</span>
                      <span>•</span>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>Year {timetable.year}</span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 mt-3">
                      Published
                    </Badge>
                  </div>

                  {/* Schedule Table - Card-based Weekly View */}
                  {timetable.schedule && timetable.schedule.length > 0 ? (
                    <div className="mb-6">
                      {/* Days Header */}
                      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                        <div className="w-24 flex-shrink-0 px-4 py-2 rounded-full border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium text-center">
                          Time
                        </div>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                          <div
                            key={day}
                            className="w-40 flex-shrink-0 px-4 py-2 rounded-full border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium text-center"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Get unique time slots */}
                      {(() => {
                        const timeSlots = new Set();
                        timetable.schedule.forEach((entry) => {
                          timeSlots.add(entry.startTime);
                        });
                        const sortedTimes = Array.from(timeSlots).sort();

                        return (
                          <div className="space-y-4">
                            {sortedTimes.map((time) => (
                              <div key={time} className="flex gap-3">
                                {/* Time slot */}
                                <div className="w-24 flex-shrink-0 pt-2">
                                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-medium">{time}</span>
                                  </div>
                                </div>

                                {/* Days columns */}
                                <div className="flex gap-3 flex-1 overflow-x-auto pb-2">
                                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                                    const dayClasses = timetable.schedule.filter(
                                      (entry) => entry.day === day && entry.startTime === time
                                    );

                                    return (
                                      <div key={`${day}-${time}`} className="w-40 flex-shrink-0">
                                        {dayClasses.length > 0 ? (
                                          dayClasses.map((entry, idx) => (
                                            <div
                                              key={idx}
                                              className="p-3 rounded-lg border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20 dark:border-l-green-400"
                                            >
                                              <p className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                                                {courseMap[entry.courseId] || entry.courseId}
                                              </p>
                                              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                                🧑‍🏫 {facultyMap[entry.facultyId] || entry.facultyId}
                                              </p>
                                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                                📍 {roomMap[entry.roomId] || entry.roomId}
                                              </p>
                                              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                                {entry.startTime} - {entry.endTime}
                                              </p>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="h-24"></div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400 text-center py-8 mb-6">
                      No schedule entries available
                    </p>
                  )}

                  {/* AI Summary Section - MOVED DOWN */}
                  {isSummaryLoading ? (
                    <div className="p-4 bg-green-50 dark:bg-slate-700/50 rounded-lg border border-green-200 dark:border-slate-600 flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin text-green-600" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">Generating AI summary...</p>
                    </div>
                  ) : summary ? (
                    <div className="p-4 bg-green-50 dark:bg-slate-700/50 rounded-lg border border-green-200 dark:border-slate-600">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Summary</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">{summary.text}</p>

                      {/* Statistics KPIs and Chart */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* KPI Cards - Enhanced */}
                        <div className="flex flex-col gap-4">
                          {/* Total Lectures */}
                          <div className="flex items-center gap-4 p-6 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-shrink-0">
                              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-blue-600 dark:text-blue-300 uppercase tracking-wide">Total Lectures</p>
                              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{summary.totalLectures}</div>
                              <p className="text-xs text-blue-600/70 dark:text-blue-300/70 mt-1">This week</p>
                            </div>
                          </div>

                          {/* Courses Count */}
                          <div className="flex items-center gap-4 p-6 rounded-lg border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-shrink-0">
                              <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-purple-600 dark:text-purple-300 uppercase tracking-wide">Unique Courses</p>
                              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                                {Object.keys(summary.courseCounts).length}
                              </div>
                              <p className="text-xs text-purple-600/70 dark:text-purple-300/70 mt-1">Enrolled</p>
                            </div>
                          </div>

                          {/* Days Count */}
                          <div className="flex items-center gap-4 p-6 rounded-lg border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-shrink-0">
                              <Calendar className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-amber-600 dark:text-amber-300 uppercase tracking-wide">Days with Classes</p>
                              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                                {Object.keys(summary.dayCount).length}
                              </div>
                              <p className="text-xs text-amber-600/70 dark:text-amber-300/70 mt-1">Per week</p>
                            </div>
                          </div>
                        </div>

                        {/* Donut Chart */}
                        <div className="lg:col-span-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-8 rounded-xl border border-green-200 dark:border-slate-700 shadow-lg">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Course Distribution</h3>
                            <a href="#" className="text-sm text-green-600 hover:text-green-700 font-medium">View More →</a>
                          </div>
                          
                          <ChartWithTooltip summary={summary} courseMap={courseMap} />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}

        {/* Notifications Section */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</h2>
              <p className="text-xs text-slate-500">{notifications.length} total · {unreadCount} unread</p>
            </div>
          </div>

          {notifLoading ? (
            <Card className="p-8 text-center bg-white dark:bg-slate-800 border-green-200 dark:border-slate-700">
              <Loader className="w-5 h-5 animate-spin text-green-500 mx-auto" />
            </Card>
          ) : notifications.length === 0 ? (
            <Card className="p-10 text-center bg-white dark:bg-slate-800 border-green-200 dark:border-slate-700">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No notifications yet.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 rounded-lg border flex items-start justify-between gap-4 transition-all ${getNotifBorder(n.type, n.isRead)}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5 shrink-0">{getNotifIcon(n.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`font-semibold text-sm ${n.isRead ? "text-slate-500" : "text-slate-800 dark:text-slate-100"}`}>
                          {n.title}
                        </p>
                        <Badge variant="outline" className="text-xs capitalize px-1.5 py-0">
                          {n.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                        {n.createdBy?.name && <span className="ml-2">· by {n.createdBy.name}</span>}
                      </p>
                    </div>
                  </div>
                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 shrink-0"
                      onClick={() => handleMarkAsRead(n._id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
