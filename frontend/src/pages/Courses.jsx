import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseForm } from "@/components/CourseForm";
import { DataTable } from "@/components/Data-table";
import { Plus, BookOpen } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const { canWrite, filterByDept, user } = useAuth();
  const { roleTheme } = useTheme();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/courses/");
      setCourses(filterByDept(res.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreate = async (data) => {
    try {
      setFormLoading(true);
      await axios.post("http://localhost:5000/api/courses/", data);
      setShowForm(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      setFormLoading(true);
      await axios.put(`http://localhost:5000/api/courses/${id}`, data);
      setEditingCourse(null);
      setShowForm(false);
      fetchCourses();
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/courses/${id}`);
      if (editingCourse?._id === id) {
        setEditingCourse(null);
        setShowForm(false);
      }
      fetchCourses();
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    {
      key: "code",
      label: "Code",
      sortable: true,
      render: (c) => (
        <span className="font-mono text-sm font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded">
          {c.code}
        </span>
      ),
    },
    {
      key: "name",
      label: "Course Name",
      sortable: true,
      render: (c) => (
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {c.name}
        </span>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (c) => (
        <span className="text-slate-600 dark:text-slate-300">
          {c.department}
        </span>
      ),
    },
    {
      key: "credits",
      label: "Credits",
      render: (c) => (
        <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
          {c.credits}
        </Badge>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (c) => (
        <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700">
          {c.type}
        </Badge>
      ),
    },
    {
      key: "hoursPerWeek",
      label: "Hrs/Wk",
      render: (c) => (
        <Badge className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
          {c.hoursPerWeek}
        </Badge>
      ),
    },
    {
      key: "semester",
      label: "Semester",
      render: (c) => (
        <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700">
          Sem {c.semester}
        </Badge>
      ),
    },
    {
      key: "year",
      label: "Year",
      render: (c) => (
        <Badge className="bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700">
          {c.year}
        </Badge>
      ),
    },
    {
      key: "prerequisites",
      label: "Prerequisites",
      render: (c) => (
        <div className="flex flex-wrap gap-1">
          {c.prerequisites?.length > 0 ? (
            c.prerequisites.map((p, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600"
              >
                {p}
              </Badge>
            ))
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-sm">
              None
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (c) => (
        <div className="flex gap-2">
          {canWrite() && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 h-8 px-3 text-xs"
                onClick={() => {
                  setEditingCourse(c);
                  setShowForm(true);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 h-8 px-3 text-xs"
                onClick={() => handleDelete(c._id)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Courses
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {user?.role !== "super_admin" && user?.department
                ? `Showing courses for ${user.department} department.`
                : "Manage academic courses and their details."}
            </p>
          </div>
          {canWrite() && (
          <Button
            onClick={() => {
              setEditingCourse(null);
              setShowForm(!showForm);
            }}
            className="text-white shadow-sm h-9 px-4 text-sm border-0"
            style={{ backgroundColor: roleTheme?.primary }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Course
          </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <Card className="bg-white dark:bg-slate-900 border-violet-100 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-violet-50 dark:border-slate-700/60 pb-4">
              <CardTitle className="text-slate-900 dark:text-white text-base">
                {editingCourse ? "Edit Course" : "Add New Course"}
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Fill in the course details below
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <CourseForm
                initialData={editingCourse}
                onSubmit={(data) =>
                  editingCourse
                    ? handleUpdate(editingCourse._id, data)
                    : handleCreate(data)
                }
                loading={formLoading}
              />
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card className="bg-white dark:bg-slate-900 border-violet-100 dark:border-slate-700 shadow-sm">
          <CardHeader className="border-b border-violet-50 dark:border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: roleTheme?.primaryMid }}>
                <BookOpen className="h-4 w-4" style={{ color: roleTheme?.primary }} />
              </div>
              <div>
                <CardTitle className="text-slate-900 dark:text-white text-base">
                  All Courses
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  {courses.length} courses registered
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={courses}
              columns={columns}
              searchKey="name"
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}