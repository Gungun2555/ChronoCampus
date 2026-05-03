import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ROLE_THEMES = {
  super_admin: {
    name: "blue",
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    primaryLight: "#eff6ff",
    primaryMid: "#dbeafe",
    primaryText: "#1d4ed8",
    primaryBorder: "#bfdbfe",
    gradient: "from-blue-50 via-sky-50 to-blue-100",
    gradientDark: "from-slate-900 via-slate-900 to-slate-800",
    sidebar: "border-blue-100",
    navActive: "bg-blue-600",
    navHover: "hover:bg-blue-50 hover:text-blue-700",
    badge: "bg-blue-100 text-blue-700",
    btn: "bg-blue-600 hover:bg-blue-700",
    accent: "text-blue-600",
    cardBorder: "border-blue-100",
    tag: "blue",
  },
  admin: {
    name: "violet",
    primary: "#7c3aed",
    primaryHover: "#6d28d9",
    primaryLight: "#f5f3ff",
    primaryMid: "#ede9fe",
    primaryText: "#6d28d9",
    primaryBorder: "#ddd6fe",
    gradient: "from-violet-50 via-purple-50 to-indigo-100",
    gradientDark: "from-slate-900 via-slate-900 to-slate-800",
    sidebar: "border-violet-100",
    navActive: "bg-violet-600",
    navHover: "hover:bg-violet-50 hover:text-violet-700",
    badge: "bg-violet-100 text-violet-700",
    btn: "bg-violet-600 hover:bg-violet-700",
    accent: "text-violet-600",
    cardBorder: "border-violet-100",
    tag: "violet",
  },
  teacher: {
    name: "orange",
    primary: "#f97316",
    primaryHover: "#ea580c",
    primaryLight: "#fff7ed",
    primaryMid: "#ffedd5",
    primaryText: "#ea580c",
    primaryBorder: "#fed7aa",
    gradient: "from-orange-50 via-amber-50 to-orange-100",
    gradientDark: "from-slate-900 via-slate-900 to-slate-800",
    sidebar: "border-orange-100",
    navActive: "bg-orange-500",
    navHover: "hover:bg-orange-50 hover:text-orange-700",
    badge: "bg-orange-100 text-orange-700",
    btn: "bg-orange-500 hover:bg-orange-600",
    accent: "text-orange-500",
    cardBorder: "border-orange-100",
    tag: "orange",
  },
  student: {
    name: "green",
    primary: "#16a34a",
    primaryHover: "#15803d",
    primaryLight: "#f0fdf4",
    primaryMid: "#dcfce7",
    primaryText: "#15803d",
    primaryBorder: "#bbf7d0",
    gradient: "from-green-50 via-emerald-50 to-green-100",
    gradientDark: "from-slate-900 via-slate-900 to-slate-800",
    sidebar: "border-green-100",
    navActive: "bg-green-600",
    navHover: "hover:bg-green-50 hover:text-green-700",
    badge: "bg-green-100 text-green-700",
    btn: "bg-green-600 hover:bg-green-700",
    accent: "text-green-600",
    cardBorder: "border-green-100",
    tag: "green",
  },
};

function getThemeForRole(role) {
  return ROLE_THEMES[role] || ROLE_THEMES.admin;
}

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  const [roleTheme, setRoleTheme] = useState(() => {
    const savedRole = localStorage.getItem("userRole");
    return getThemeForRole(savedRole);
  });

  // Apply dark/light class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(darkMode ? "dark" : "light");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Apply CSS custom properties for role theme
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", roleTheme.primary);
    root.style.setProperty("--color-primary-hover", roleTheme.primaryHover);
    root.style.setProperty("--color-primary-light", roleTheme.primaryLight);
    root.style.setProperty("--color-primary-mid", roleTheme.primaryMid);
    root.style.setProperty("--color-primary-text", roleTheme.primaryText);
    root.style.setProperty("--color-primary-border", roleTheme.primaryBorder);
  }, [roleTheme]);

  // Listen for storage events dispatched on login
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "userRole" && e.newValue) {
        setRoleTheme(getThemeForRole(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const applyRoleTheme = (role) => {
    const t = getThemeForRole(role);
    setRoleTheme(t);
    localStorage.setItem("userRole", role);
  };

  const toggleTheme = () => setDarkMode((d) => !d);
  const theme = darkMode ? "dark" : "light";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, roleTheme, applyRoleTheme, darkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
