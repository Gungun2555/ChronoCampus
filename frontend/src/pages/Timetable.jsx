import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Sparkles,
  AlertTriangle,
  Clock,
  User,
  MapPin,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "09:00-10:00",
  "10:00-11:00",
  "11:15-12:15",
  "12:15-13:15",
  "14:15-15:15",
  "15:15-16:15",
  "16:30-17:30",
];

const inputCls =
  "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500";

function typeColor(t) {
  switch (t) {
    case "lecture":
      return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700";
    case "lab":
      return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700";
    case "tutorial":
      return "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700";
    case "exam":
      return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700";
    default:
      return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600";
  }
}

function TimetableGrid({ timetable, courses, faculty, rooms, roleTheme }) {
  const getEntry = (day, slot) =>
    timetable?.schedule?.find(
      (e) =>
        e.day.toLowerCase() === day.toLowerCase() &&
        `${e.startTime}-${e.endTime}` === slot,
    ) || null;
  const findCourse = (id) => courses.find((c) => c._id === id) || null;
  const findFaculty = (id) => faculty.find((f) => f._id === id) || null;
  const findRoom = (id) => rooms.find((r) => r._id === id) || null;

  return (
    <Card className="bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm"
      style={{ borderColor: roleTheme?.primaryBorder }}>
      <CardHeader className="border-b dark:border-slate-700/60 p-4"
        style={{ borderColor: roleTheme?.primaryBorder }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-slate-900 dark:text-white text-base">
              {timetable.name}
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {timetable.department} · Semester {timetable.semester} ·{" "}
              {timetable.year}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge
              className={
                timetable.status === "published"
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"
              }
            >
              {timetable.status}
            </Badge>
            {timetable.conflicts?.length > 0 && (
              <Badge className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700">
                {timetable.conflicts.length} conflicts
              </Badge>
            )}
            <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600">
              {timetable.metadata?.utilizationRate || 0}% utilized
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-6 gap-2 min-w-[800px]">
            {/* Header row */}
            <div className="font-semibold text-center p-2 dark:bg-slate-800 rounded-lg dark:text-slate-300 text-sm dark:border-slate-700"
              style={{ backgroundColor: roleTheme?.primaryLight, color: roleTheme?.primaryText, borderColor: roleTheme?.primaryBorder, border: "1px solid" }}>
              Time
            </div>
            {DAYS.map((d) => (
              <div
                key={d}
                className="font-semibold text-center p-2 dark:bg-slate-800 rounded-lg dark:text-slate-300 text-sm dark:border-slate-700"
                style={{ backgroundColor: roleTheme?.primaryLight, color: roleTheme?.primaryText, borderColor: roleTheme?.primaryBorder, border: "1px solid" }}
              >
                {d}
              </div>
            ))}

            {/* Time slot rows */}
            {TIME_SLOTS.map((slot) => (
              <div key={slot} className="contents">
                <div className="text-xs text-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50">
                  <Clock className="h-3 w-3 mr-1 shrink-0" />
                  {slot}
                </div>
                {DAYS.map((day) => {
                  const entry = getEntry(day, slot);
                  if (!entry)
                    return (
                      <div key={`${day}-${slot}`} className="min-h-[72px] p-1">
                        <div className="h-full bg-slate-50 dark:bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700/50" />
                      </div>
                    );
                  const course = findCourse(entry.courseId);
                  const prof = findFaculty(entry.facultyId);
                  const room = findRoom(entry.roomId);
                  return (
                    <div key={`${day}-${slot}`} className="min-h-[72px] p-1">
                      <div
                        className={`p-2 rounded-lg text-xs h-full shadow-sm hover:shadow-md transition-shadow ${typeColor(course?.type || "lecture")}`}
                      >
                        <div className="font-semibold leading-tight mb-1 line-clamp-2">
                          {course
                            ? `${course.name} (${course.code})`
                            : entry.courseId}
                        </div>
                        <div className="space-y-0.5 opacity-80">
                          <div className="flex items-center gap-1 truncate">
                            <User className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">
                              {prof ? prof.name : entry.facultyId}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">
                              {room ? room.name : entry.roomId}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {timetable.conflicts?.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Conflicts Detected
            </h4>
            {timetable.conflicts.map((c, i) => (
              <div
                key={i}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p className="font-medium text-red-700 dark:text-red-300 text-sm">
                  {(c.type || "CONFLICT").replace("_", " ")}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
                  {c.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TimetablePage() {
  const [timetables, setTimetables] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    department: "Computer Science",
    semester: "5",
    academicYear: new Date().getFullYear(),
    constraintsText: "",
  });
  const { canWrite, isSuperAdmin, isStudent, filterByDept } = useAuth();
  const { roleTheme } = useTheme();

  useEffect(() => {
    fetchTimetables();
    fetchSupportingData();
  }, []);

  async function fetchTimetables() {
    setLoadingList(true);
    setError(null);
    try {
      const r = await api.get("/timetables");
      setTimetables(filterByDept(Array.isArray(r.data) ? r.data : []));
    } catch (err) {
      setError(
        `Failed to load timetables: ${err.response?.data?.error || err.message}`,
      );
      setTimetables([]);
    } finally {
      setLoadingList(false);
    }
  }

  async function fetchSupportingData() {
    try {
      const [cr, fr, rr] = await Promise.all([
        api.get("/courses"),
        api.get("/faculty"),
        api.get("/rooms"),
      ]);
      setCourses(Array.isArray(cr.data) ? cr.data : []);
      setFaculty(Array.isArray(fr.data) ? fr.data : []);
      setRooms(Array.isArray(rr.data) ? rr.data : []);
    } catch (err) {
      setError(
        `Failed to load supporting data: ${err.response?.data?.error || err.message}`,
      );
    }
  }

  async function viewTimetable(id) {
    setLoadingDetail(true);
    setSelected(null);
    setError(null);
    try {
      const r = await api.get(`/timetables/${id}`);
      setSelected(r.data);
    } catch (err) {
      setError(
        `Failed to load timetable: ${err.response?.data?.error || err.message}`,
      );
    } finally {
      setLoadingDetail(false);
    }
  }

  async function generateTimetable(e) {
    e.preventDefault();
    if (!form.department || !form.semester) {
      setError("Please fill in department and semester");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      let constraints = {};
      if (form.constraintsText.trim()) {
        try {
          constraints = JSON.parse(form.constraintsText);
        } catch {
          constraints = { notes: form.constraintsText };
        }
      }
      const r = await api.post("/timetables/generate", {
        department: form.department,
        semester: parseInt(form.semester),
        academicYear: parseInt(form.academicYear),
        constraints,
      });
      await fetchTimetables();
      if (r.data._id) await viewTimetable(r.data._id);
      alert("Timetable generated successfully!");
    } catch (err) {
      setError(
        `Failed to generate: ${err.response?.data?.error || err.message}`,
      );
    } finally {
      setGenerating(false);
    }
  }

  async function optimizeSelected() {
    if (!selected) return;
    setOptimizing(true);
    setError(null);
    try {
      const r = await api.post(`/timetables/${selected._id}/optimize`);
      await viewTimetable(selected._id);
      alert(
        r.data.suggestions?.length
          ? "Optimization complete!\n\n• " + r.data.suggestions.join("\n• ")
          : "Optimization completed!",
      );
    } catch (err) {
      setError(
        `Optimization failed: ${err.response?.data?.error || err.message}`,
      );
    } finally {
      setOptimizing(false);
    }
  }

  async function togglePublish(t) {
    setError(null);
    try {
      await api.put(`/timetables/${t._id}`, {
        ...t,
        status: t.status === "published" ? "draft" : "published",
      });
      await fetchTimetables();
      if (selected?._id === t._id) await viewTimetable(t._id);
    } catch (err) {
      setError(
        `Failed to update status: ${err.response?.data?.error || err.message}`,
      );
    }
  }

  async function deleteTimetable(t) {
    if (!confirm(`Delete "${t.name}"? This cannot be undone.`)) return;
    setError(null);
    try {
      await api.delete(`/timetables/${t._id}`);
      await fetchTimetables();
      if (selected?._id === t._id) setSelected(null);
    } catch (err) {
      setError(`Failed to delete: ${err.response?.data?.error || err.message}`);
    }
  }

  function exportTimetable() {
    if (!selected) return;
    const blob = new Blob([JSON.stringify(selected, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.name.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isStudent() ? "Published Timetables" : "Timetable Generator"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isStudent() ? "View published timetables for your courses" : "Generate, optimize and manage academic timetables with AI assistance."}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-6 items-stretch">
          {/* Left column */}
          <div className="flex-1 space-y-6">
            {/* Generate form — only for teachers/admins */}
            {!isStudent() && (
            <Card className="bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm"
              style={{ borderColor: roleTheme?.primaryBorder }}>
              <CardHeader className="border-b dark:border-slate-700/60 pb-4"
                style={{ borderColor: roleTheme?.primaryBorder }}>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-base">
                    <Sparkles className="h-4 w-4" style={{ color: roleTheme?.primary }} />{" "}
                    Generate New Timetable
                  </CardTitle>
                  <Badge className="text-white text-xs" style={{ backgroundColor: roleTheme?.primary }}>
                    AI Powered
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <form onSubmit={generateTimetable} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Department
                      </label>
                      <Input
                        value={form.department}
                        onChange={(e) =>
                          setForm({ ...form, department: e.target.value })
                        }
                        placeholder="e.g., Computer Science"
                        required
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Semester
                      </label>
                      <Select
                        value={form.semester}
                        onValueChange={(v) => setForm({ ...form, semester: v })}
                      >
                        <SelectTrigger className={inputCls}>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <SelectItem key={s} value={s.toString()}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Academic Year
                      </label>
                      <Input
                        type="number"
                        value={form.academicYear}
                        onChange={(e) =>
                          setForm({ ...form, academicYear: e.target.value })
                        }
                        min="2020"
                        max="2030"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Constraints (Optional)
                    </label>
                    <Textarea
                      value={form.constraintsText}
                      onChange={(e) =>
                        setForm({ ...form, constraintsText: e.target.value })
                      }
                      placeholder='e.g., {"avoidFriday": true} or "No classes after 4 PM"'
                      rows={2}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={generating}
                      className="text-white h-9 px-5 border-0"
                      style={{ backgroundColor: roleTheme?.primary }}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {generating ? "Generating..." : "Generate"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setForm({
                          department: "Computer Science",
                          semester: "5",
                          academicYear: new Date().getFullYear(),
                          constraintsText: "",
                        })
                      }
                      className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 h-9 px-5"
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            )}

            {/* Timetable list */}
            <Card className="bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm"
              style={{ borderColor: roleTheme?.primaryBorder }}>
              <CardHeader className="border-b dark:border-slate-700/60 pb-4"
                style={{ borderColor: roleTheme?.primaryBorder }}>
                <CardTitle className="text-slate-900 dark:text-white text-base">
                  Existing Timetables ({timetables.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {loadingList ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Loading...
                    </p>
                  </div>
                ) : timetables.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                    <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      No timetables yet. Generate one above!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {timetables.map((t) => (
                      <div
                        key={t._id}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-violet-50 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700/50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                            {t.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {t.department} · Sem {t.semester} · {t.year}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge
                              className={
                                t.status === "published"
                                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 text-xs"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 text-xs"
                              }
                            >
                              {t.status}
                            </Badge>
                            <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 text-xs">
                              {t.metadata?.totalHours || 0}h
                            </Badge>
                            {t.conflicts?.length > 0 && (
                              <Badge className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 text-xs">
                                {t.conflicts.length} conflicts
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => viewTimetable(t._id)}
                            className="text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 h-8 px-3 text-xs"
                          >
                            View
                          </Button>
                          {canWrite() && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePublish(t)}
                            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-8 px-3 text-xs"
                          >
                            {t.status === "published" ? "Unpublish" : "Publish"}
                          </Button>
                          )}
                          {isSuperAdmin() && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTimetable(t)}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column — timetable grid */}
          <div className="xl:w-[700px] flex flex-col space-y-4">
            {loadingDetail ? (
              <Card className="bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm flex-1"
                style={{ borderColor: roleTheme?.primaryBorder }}>
                <CardContent className="text-center py-12">
                  <div className="animate-spin h-6 w-6 border-2 border-t-transparent rounded-full mx-auto mb-3"
                    style={{ borderColor: roleTheme?.primary, borderTopColor: "transparent" }} />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Loading timetable...</p>
                </CardContent>
              </Card>
            ) : !selected ? (
              <Card className="bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm flex-1 flex flex-col justify-center"
                style={{ borderColor: roleTheme?.primaryBorder }}>
                <CardHeader className="border-b dark:border-slate-700/60 pb-4"
                  style={{ borderColor: roleTheme?.primaryBorder }}>
                  <CardTitle className="text-slate-900 dark:text-white text-base">
                    Timetable Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-16 flex-1 flex flex-col items-center justify-center">
                  <CalendarIcon className="h-14 w-14 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">No Timetable Selected</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">Select a timetable from the list to view its schedule.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Action buttons — only for teachers/admins */}
                {!isStudent() && (
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={optimizeSelected}
                    disabled={optimizing}
                    className="bg-violet-600 hover:bg-violet-700 text-white h-8 px-4 text-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    {optimizing ? "Optimizing..." : "Optimize"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportTimetable}
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 h-8 px-4 text-xs"
                  >
                    Export JSON
                  </Button>
                </div>
                )}
                <TimetableGrid
                  timetable={selected}
                  courses={courses}
                  faculty={faculty}
                  rooms={rooms}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
