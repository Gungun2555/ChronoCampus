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
import { FacultyForm } from "@/components/Faculty-Form";
import { DataTable } from "@/components/Data-table";
import { Plus, Users, Mail, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const { canWrite, filterByDept, user } = useAuth();
  const { roleTheme } = useTheme();

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/faculty");
      setFaculty(filterByDept(Array.isArray(res.data) ? res.data : []));
    } catch (e) {
      console.error(e);
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editingFaculty)
        await axios.put(
          `http://localhost:5000/api/faculty/${editingFaculty._id}`,
          data,
        );
      else await axios.post("http://localhost:5000/api/faculty", data);
      setShowForm(false);
      setEditingFaculty(null);
      fetchFaculty();
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (f) => {
    try {
      await axios.delete(`http://localhost:5000/api/faculty/${f._id}`);
      if (editingFaculty?._id === f._id) {
        setEditingFaculty(null);
        setShowForm(false);
      }
      fetchFaculty();
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (f) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-100">
            {f.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <Mail className="h-3 w-3" />
            {f.email}
          </div>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (f) => (
        <span className="text-slate-700 dark:text-slate-200">
          {f.department}
        </span>
      ),
    },
    {
      key: "designation",
      label: "Designation",
      render: (f) => (
        <span className="text-slate-700 dark:text-slate-200">
          {f.designation || "N/A"}
        </span>
      ),
    },
    {
      key: "specialization",
      label: "Specialization",
      render: (f) => (
        <div className="flex flex-wrap gap-1">
          {f.specialization?.slice(0, 2).map((s) => (
            <Badge
              key={s}
              className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 text-xs"
            >
              {s}
            </Badge>
          ))}
          {f.specialization?.length > 2 && (
            <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 text-xs">
              +{f.specialization.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "maxHoursPerWeek",
      label: "Max Hrs/Wk",
      render: (f) => (
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
          <Clock className="h-3 w-3 text-violet-500 dark:text-violet-400" />
          {f.maxHoursPerWeek}h
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (f) => (
        <div className="flex gap-2">
          {canWrite() && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 h-8 px-3 text-xs"
                onClick={() => {
                  setEditingFaculty(f);
                  setShowForm(true);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 h-8 px-3 text-xs"
                onClick={() => handleDelete(f)}
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Faculty
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {user?.role !== "super_admin" && user?.department
                ? `Showing faculty for ${user.department} department.`
                : "Manage faculty members and their information."}
            </p>
          </div>
          {canWrite() && (
            <Button
              onClick={() => {
                setEditingFaculty(null);
                setShowForm(!showForm);
              }}
              className="text-white shadow-sm h-9 px-4 text-sm border-0"
              style={{ backgroundColor: roleTheme?.primary }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Faculty
            </Button>
          )}        </div>

        {showForm && (
          <Card className="bg-white dark:bg-slate-900 border-violet-100 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-violet-50 dark:border-slate-700/60 pb-4">
              <CardTitle className="text-slate-900 dark:text-white text-base">
                {editingFaculty ? "Edit Faculty" : "Add New Faculty"}
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Fill in the faculty details below
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <FacultyForm
                initialData={editingFaculty}
                onSubmit={handleSubmit}
                loading={formLoading}
              />
            </CardContent>
          </Card>
        )}

        <Card className="bg-white dark:bg-slate-900 border-violet-100 dark:border-slate-700 shadow-sm">
          <CardHeader className="border-b border-violet-50 dark:border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: roleTheme?.primaryMid }}>
                <Users className="h-4 w-4" style={{ color: roleTheme?.primary }} />
              </div>
              <div>
                <CardTitle className="text-slate-900 dark:text-white text-base">
                  All Faculty
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  {faculty.length} faculty members registered
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={faculty}
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
