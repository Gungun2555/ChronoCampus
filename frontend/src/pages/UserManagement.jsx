import { useState, useEffect } from "react";
import axios from "axios";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, UserCog, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const DEPARTMENTS = ["AIDS", "AI", "MLIT", "Mechanical", "Textile", "Cybersecurity", "CSE Core"];
const ROLES = ["super_admin", "admin", "teacher", "student"];

const roleBadge = {
  super_admin: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200",
  admin: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border-sky-200",
  teacher: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200",
  student: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200",
};

const API = "http://localhost:5000/api";

export default function UserManagementPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin", department: "" });

const ROLE_ORDER = { super_admin: 0, admin: 1, teacher: 2, student: 3 };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/auth/users`);
      const sorted = res.data.sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
      setUsers(sorted);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    try {
      await axios.post(`${API}/auth/register`, {
        ...form,
        department: form.role === "super_admin" ? null : form.department,
      });
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "admin", department: "" });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await axios.put(`${API}/auth/users/${u._id}`, { ...u, isActive: !u.isActive });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update user");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await axios.delete(`${API}/auth/users/${id}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete user");
    }
  };

  const needsDept = form.role !== "super_admin";

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage roles and access for all users.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm">
            <Plus className="h-4 w-4 mr-2" /> Add User
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {showForm && (
          <Card className="bg-white dark:bg-slate-900 border-blue-100 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-blue-50 dark:border-slate-700/60 pb-4">
              <CardTitle className="text-slate-900 dark:text-white text-base">Create New User</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">Assign a role and department</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 dark:text-slate-300">Name *</Label>
                    <Input className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label className="text-slate-700 dark:text-slate-300">Email *</Label>
                    <Input type="email" className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div>
                    <Label className="text-slate-700 dark:text-slate-300">Password *</Label>
                    <Input type="password" className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                  </div>
                  <div>
                    <Label className="text-slate-700 dark:text-slate-300">Role *</Label>
                    <Select value={form.role} onValueChange={v => setForm({ ...form, role: v, department: "" })}>
                      <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100">
                        {ROLES.map(r => <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {needsDept && (
                    <div>
                      <Label className="text-slate-700 dark:text-slate-300">Department *</Label>
                      <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                        <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100">
                          {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-1">
                  <Button type="submit" disabled={formLoading} className="bg-violet-600 hover:bg-violet-700 text-white h-9 px-5">
                    {formLoading ? "Creating..." : "Create User"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 h-9 px-5">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white dark:bg-slate-900 border-blue-100 dark:border-slate-700 shadow-sm">
          <CardHeader className="border-b border-blue-50 dark:border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <UserCog className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-slate-900 dark:text-white text-base">All Users</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">{users.length} users registered</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-10 text-slate-400">Loading...</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {users.map(u => (
                  <div key={u._id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-800 dark:text-slate-100 text-sm">{u.name}</span>
                        <Badge className={`text-xs ${roleBadge[u.role]}`}>{u.role.replace("_", " ")}</Badge>
                        {!u.isActive && <Badge className="text-xs bg-red-100 text-red-600 border-red-200">inactive</Badge>}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {u.email}{u.department ? ` · ${u.department}` : ""}
                      </div>
                    </div>
                    {u._id !== me?._id && (
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <Button size="sm" variant="outline"
                          className="h-7 px-3 text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                          onClick={() => handleToggleActive(u)}>
                          {u.isActive ? "Disable" : "Enable"}
                        </Button>
                        <Button size="sm" variant="ghost"
                          className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                          onClick={() => handleDelete(u._id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
