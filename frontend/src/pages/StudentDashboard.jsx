import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Building2, LogOut, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 border-b border-white/20 shadow-sm">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ChronoCampus</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Student Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || "Student"}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{user?.department || "Department"}</p>
            </div>
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
<div className="mb-10 relative overflow-hidden rounded-3xl p-10 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 shadow-2xl">          {/* Decorative elements */}
<div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_white,_transparent)]" />          <div className="absolute bottom-0 right-20 w-24 h-24 bg-cyan-300 rounded-full opacity-20 blur-xl" />
          <div className="absolute top-12 right-1/4 w-3 h-3 bg-cyan-300 rounded-full" />
          <div className="absolute bottom-8 right-1/3 w-2 h-2 bg-lime-300 rounded-full" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-green-100 mb-2">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h2 className="text-4xl font-bold mb-2">
                Welcome back, {user?.name || "Student"}!
              </h2>
              <p className="text-green-100 text-lg">
                Always stay updated in your student portal
              </p>
            </div>
            
            {/* Illustration placeholder with emojis */}
            <div className="hidden md:flex items-center gap-4 ml-8">
              <div className="text-6xl">🎓</div>
              <div className="text-5xl">📚</div>
              <div className="text-5xl">🚀</div>
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

                  {/* Schedule Table - MOVED UP */}
                  {timetable.schedule && timetable.schedule.length > 0 ? (
                    <div className="mb-6 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-green-200 dark:border-slate-600 bg-green-50 dark:bg-slate-700/50">
                            <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                              Day
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                              Start Time
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                              End Time
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                              Course
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                              Faculty
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                              Room
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {timetable.schedule.map((entry, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-slate-200 dark:border-slate-700 hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                              <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{entry.day}</td>
                              <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{entry.startTime}</td>
                              <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{entry.endTime}</td>
                              <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{courseMap[entry.courseId] || entry.courseId}</td>
                              <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{facultyMap[entry.facultyId] || entry.facultyId}</td>
                              <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{roomMap[entry.roomId] || entry.roomId}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/50 p-6 rounded-xl border border-blue-200 dark:border-blue-700/50 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-blue-600 dark:text-blue-300 uppercase tracking-wide">Total Lectures</p>
                              <div className="text-2xl">📚</div>
                            </div>
                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{summary.totalLectures}</div>
                            <p className="text-xs text-blue-600/70 dark:text-blue-300/70 mt-2">This week</p>
                          </div>

                          {/* Courses Count */}
                          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/50 p-6 rounded-xl border border-green-200 dark:border-green-700/50 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-green-600 dark:text-green-300 uppercase tracking-wide">Unique Courses</p>
                              <div className="text-2xl">🎓</div>
                            </div>
                            <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                              {Object.keys(summary.courseCounts).length}
                            </div>
                            <p className="text-xs text-green-600/70 dark:text-green-300/70 mt-2">Enrolled</p>
                          </div>

                          {/* Days Count */}
                          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/50 p-6 rounded-xl border border-amber-200 dark:border-amber-700/50 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-amber-600 dark:text-amber-300 uppercase tracking-wide">Days with Classes</p>
                              <div className="text-2xl">📅</div>
                            </div>
                            <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                              {Object.keys(summary.dayCount).length}
                            </div>
                            <p className="text-xs text-amber-600/70 dark:text-amber-300/70 mt-2">Per week</p>
                          </div>
                        </div>

                        {/* Donut Chart */}
                        <div className="lg:col-span-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-8 rounded-xl border border-green-200 dark:border-slate-700 shadow-lg">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Course Distribution</h3>
                            <a href="#" className="text-sm text-green-600 hover:text-green-700 font-medium">View More →</a>
                          </div>
                          
                          <div className="flex items-center justify-center">
                            <svg width="280" height="280" viewBox="0 0 280 280" className="drop-shadow-xl">
                              {(() => {
                                const courses = Object.entries(summary.courseCounts);
                                const colors = [
                                  "#0ea5e9", "#06b6d4", "#10b981", "#3b82f6", "#8b5cf6",
                                  "#ec4899", "#f59e0b", "#ef4444"
                                ];
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
                                    <g key={idx}>
                                      <path
                                        d={pathData}
                                        fill={colors[idx % colors.length]}
                                        stroke="white"
                                        strokeWidth="2"
                                        className="hover:opacity-80 transition-opacity cursor-pointer"
                                      />
                                    </g>
                                  );
                                });
                              })()}
                            </svg>
                          </div>

                          {/* Legend */}
                          <div className="mt-8 grid grid-cols-2 gap-4">
                            {Object.entries(summary.courseCounts).map(([course, count], idx) => {
                              const colors = [
                                "#0ea5e9", "#06b6d4", "#10b981", "#3b82f6", "#8b5cf6",
                                "#ec4899", "#f59e0b", "#ef4444"
                              ];
                              const percentage = Math.round((count / summary.totalLectures) * 100);
                              return (
                                <div key={course} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                  <div
                                    className="w-4 h-4 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: colors[idx % colors.length] }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                      {course}
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                      {count} lectures • {percentage}%
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
