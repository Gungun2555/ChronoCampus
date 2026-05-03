import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { ChevronLeft, ChevronRight, Megaphone, Clock, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";

const SLIDES_CONFIG = [
{
  tag: "Announcements",
  tagIcon: Megaphone,
  gradient: "linear-gradient(135deg, #f5efb6ff 0%, #f4d866ff 100%)",
  iconBg: "#fde68a",
  iconColor: "#d97706",
  textColor: "#92400e",
  subtitleColor: "#b45309",
  ctaStyle: { backgroundColor: "#f59e0b", color: "#fff" },
  dataKey: "announcements",
  icon: "📢",
},
 {
  tag: "Today's Schedule",
  tagIcon: Clock,
  gradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
  iconBg: "#bfdbfe",
  iconColor: "#2563eb",
  textColor: "#1e3a8a",
  subtitleColor: "#3b82f6",
  ctaStyle: { backgroundColor: "#2563eb", color: "#fff" },
  dataKey: "schedule",
  icon: "🗓️",
},
  {
    tag: "System Status",
    tagIcon: CheckCircle,
    gradient: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    iconBg: "#bbf7d0",
    iconColor: "#16a34a",
    textColor: "#14532d",
    subtitleColor: "#15803d",
    ctaStyle: { backgroundColor: "#16a34a", color: "#fff" },
    dataKey: "status",
    icon: "✅",
  },
  {
    tag: "Quick Tip",
    tagIcon: Sparkles,
    gradient: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
    iconBg: "#e9d5ff",
    iconColor: "#9333ea",
    textColor: "#581c87",
    subtitleColor: "#7e22ce",
    ctaStyle: { backgroundColor: "#9333ea", color: "#fff" },
    dataKey: "tip",
    icon: "✨",
  },
];

export function HeroSlider({ notifications = [], timetables = [] }) {
  const { roleTheme } = useTheme();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(null);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todaySlots = timetables.flatMap(t =>
    (t.schedule || []).filter(e => e.day === today).map(e => ({ ...e, tname: t.name }))
  );
  const conflicts = timetables.flatMap(t => (t.conflicts || []).map(c => ({ ...c, tname: t.name })));
  const unread = notifications.filter(n => !n.isRead);

  const slideData = {
    announcements: {
      title: unread.length > 0 ? unread[0].title : "All Caught Up!",
      subtitle: unread.length > 0 ? unread[0].message : "No new announcements today.",
      cta: "View All",
      ctaPath: "/notifications",
      count: unread.length,
      countLabel: "unread",
    },
    schedule: {
      title: todaySlots.length > 0 ? `${todaySlots.length} Class${todaySlots.length > 1 ? "es" : ""} Today` : "No Classes Today",
      subtitle: todaySlots.length > 0
        ? `${todaySlots[0].courseName || "Class"} · ${todaySlots[0].startTime} · ${todaySlots[0].roomName || "TBD"}`
        : `Enjoy your free day — ${today}`,
      cta: "View Timetable",
      ctaPath: "/timetables",
      count: todaySlots.length,
      countLabel: "classes",
    },
    status: {
      title: conflicts.length > 0 ? `${conflicts.length} Conflict${conflicts.length > 1 ? "s" : ""} Found` : "No Conflicts",
      subtitle: conflicts.length > 0
        ? conflicts[0].message || "Review your timetable"
        : "All timetables are conflict-free. Great work!",
      cta: conflicts.length > 0 ? "Review Now" : "View Timetables",
      ctaPath: "/timetables",
      count: conflicts.length,
      countLabel: "conflicts",
    },
    tip: {
      title: "AI Timetable Generator",
      subtitle: "Create conflict-free schedules in seconds using Gemini AI.",
      cta: "Generate Now",
      ctaPath: "/timetables",
      count: null,
      countLabel: "",
    },
  };

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES_CONFIG.length), 2000);
    return () => clearInterval(t);
  }, [paused]);

  const prev = () => setCurrent(c => (c - 1 + SLIDES_CONFIG.length) % SLIDES_CONFIG.length);
  const next = () => setCurrent(c => (c + 1) % SLIDES_CONFIG.length);

  const onTouchStart = e => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = e => {
    if (!touchStart.current) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStart.current = null;
  };

  const cfg = SLIDES_CONFIG[current];
  const data = slideData[cfg.dataKey];
  const TagIcon = cfg.tagIcon;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-sm select-none h-full"
      style={{ background: cfg.gradient, minHeight: "180px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Main content */}
      <div className="flex flex-col justify-between h-full px-5 pt-4 pb-8">

        {/* Tag row */}
        <div className="flex items-center gap-1.5 mb-2">
          <TagIcon className="h-3 w-3" style={{ color: cfg.iconColor }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: cfg.subtitleColor }}>
            {cfg.tag}
          </span>
        </div>

        {/* Title + subtitle + CTA on left, icon+count on right */}
        <div className="flex items-start justify-between gap-3 flex-1">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black leading-tight mb-1" style={{ color: cfg.textColor }}>
              {data.title}
            </h2>
            <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: cfg.subtitleColor }}>
              {data.subtitle}
            </p>
            <a href={data.ctaPath}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
              style={cfg.ctaStyle}>
              {data.cta} →
            </a>
          </div>

          {/* Right icon + count */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm text-2xl"
              style={{ backgroundColor: cfg.iconBg }}>
              {cfg.icon}
            </div>
            {data.count !== null && (
              <div className="text-center">
                <p className="text-2xl font-black leading-none" style={{ color: cfg.textColor }}>{data.count}</p>
                <p className="text-xs font-medium" style={{ color: cfg.subtitleColor }}>{data.countLabel}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Arrows — bottom corners, not overlapping text */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
        <button onClick={prev}
          className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm"
          style={{ backgroundColor: cfg.iconBg }}>
          <ChevronLeft className="h-3.5 w-3.5" style={{ color: cfg.iconColor }} />
        </button>

        {/* Dots — centered */}
        <div className="flex gap-1.5 items-center">
          {SLIDES_CONFIG.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? "16px" : "5px",
                height: "5px",
                backgroundColor: i === current ? cfg.iconColor : cfg.iconBg,
              }} />
          ))}
        </div>

        <button onClick={next}
          className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm"
          style={{ backgroundColor: cfg.iconBg }}>
          <ChevronRight className="h-3.5 w-3.5" style={{ color: cfg.iconColor }} />
        </button>
      </div>
    </div>
  );
}
