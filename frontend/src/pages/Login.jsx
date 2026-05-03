import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moon, Sun, AlertCircle, Calendar, Users, BookOpen, Sparkles } from "lucide-react";

const features = [
  { icon: Sparkles, text: "AI-Powered Timetable Generation" },
  { icon: Users, text: "Role-Based Access Control" },
  { icon: Calendar, text: "Smart Schedule Management" },
  { icon: BookOpen, text: "Multi-Department Support" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-6 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #3b82f6, #8b5cf6, transparent)" }} />
      </div>

      {/* Theme toggle */}
      <button onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 z-20">
        {theme === "dark"
          ? <Sun className="w-4 h-4 text-amber-400" />
          : <Moon className="w-4 h-4 text-slate-600" />}
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-6xl bg-white min-h-[650px] dark:bg-slate-900 rounded-3xl overflow-hidden flex"
        style={{ boxShadow: "0 0 0 1px rgba(59,130,246,0.12), 0 30px 80px rgba(59,130,246,0.18), 0 0 100px rgba(139,92,246,0.12)" }}>

        {/* Left — dark branded */}
        <div className="w-5/12 flex flex-col justify-between p-10 relative overflow-hidden"
          style={{ background: "linear-gradient(145deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%)" }}>

          {/* Dot grid */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

          {/* Glow blobs */}
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full opacity-25 blur-3xl bg-blue-500" />
          <div className="absolute bottom-10 right-5 w-32 h-32 rounded-full opacity-20 blur-3xl bg-purple-500" />

          {/* Brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                CC
              </div>
              <span className="text-white font-bold text-lg">ChronoCampus</span>
            </div>
            <p className="text-blue-300 text-xs">Smart Classroom Management</p>
          </div>

          {/* Hero text */}
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white leading-tight mb-3">
              Welcome to
              <br />
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #60a5fa, #a78bfa)" }}>
                ChronoCampus
              </span>
            </h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Intelligent platform for academic scheduling and institutional coordination.
            </p>
            <div className="space-y-3">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/20">
                      <Icon className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <span className="text-slate-300 text-xs">{f.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role badges */}
          <div className="relative z-10 flex gap-2 flex-wrap">
            {["Super Admin", "HOD", "Teacher"].map((role, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full border border-slate-600 text-slate-400">
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="flex-1 flex flex-col justify-center p-10">
          <div className="max-w-sm mx-auto w-full">

            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Welcome Back!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm mb-5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Email ID
                </label>
                <Input
                  type="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-white font-bold rounded-xl text-sm border-0 mt-2"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
              >
                {loading ? "Signing in..." : "Log In"}
              </Button>
            </form>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
              Don't have an account? Contact your Super Admin.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
