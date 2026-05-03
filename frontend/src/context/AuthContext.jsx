import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API = "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Attach token to every axios request
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Restore session on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    axios.get(`${API}/auth/me`)
      .then(res => setUser(res.data))
      .catch(() => { localStorage.removeItem("token"); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem("token", t);
    localStorage.setItem("userRole", u.role); // for theme persistence
    setToken(t);
    axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    setUser(u);
    // Trigger theme update by dispatching a storage event
    window.dispatchEvent(new StorageEvent("storage", { key: "userRole", newValue: u.role }));
    return u;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  // Permission helpers
  const isSuperAdmin = () => user?.role === "super_admin";
  const isAdmin = () => user?.role === "admin" || user?.role === "super_admin";
  const isTeacher = () => user?.role === "teacher";
  const isStudent = () => user?.role === "student";
  const canWrite = () => ["super_admin", "admin"].includes(user?.role);
  const canManageRooms = () => user?.role === "super_admin";

  // Returns true if user can see all departments (super_admin only)
  const seeAllDepts = () => user?.role === "super_admin";

  // Filter an array by department field — super_admin sees all
  const filterByDept = (arr, field = "department") => {
    if (!arr) return [];
    if (user?.role === "super_admin" || !user?.department) return arr;
    return arr.filter(item =>
      (item[field] || "").toLowerCase() === user.department.toLowerCase()
    );
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isSuperAdmin, isAdmin, isTeacher, isStudent, canWrite, canManageRooms, seeAllDepts, filterByDept }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
