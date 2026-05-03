import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import Faculty from "../models/Faculty.js";
import Course from "../models/course.js";
import Room from "../models/Room.js";
import Timetable from "../models/Timetable.js";
import { authenticate } from "../middleware/auth.js";

export const aiRouter = Router();

aiRouter.use(authenticate);

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Fetch all DB data and build a rich context string for the AI
async function buildDatabaseContext() {
  const [faculties, courses, rooms, timetables] = await Promise.all([
    Faculty.find({}).lean(),
    Course.find({}).lean(),
    Room.find({}).lean(),
    Timetable.find({}).lean(),
  ]);

  // --- FACULTY ---
  const facultySummary = faculties.map((f) => ({
    name: f.name,
    email: f.email,
    department: f.department,
    designation: f.designation || "Faculty",
    specialization: f.specialization,
    maxHoursPerWeek: f.maxHoursPerWeek,
    availability: Object.entries(f.availability || {})
      .filter(([, slots]) => slots.length > 0)
      .map(
        ([day, slots]) =>
          `${day}: ${slots.map((s) => `${s.start}-${s.end}`).join(", ")}`,
      )
      .join(" | "),
    preferences: {
      preferred: f.preferences?.preferredTimeSlots || [],
      avoid: f.preferences?.avoidTimeSlots || [],
    },
  }));

  // --- COURSES ---
  const courseSummary = courses.map((c) => ({
    name: c.name,
    code: c.code,
    department: c.department,
    credits: c.credits,
    semester: c.semester,
    year: c.year,
    type: c.type,
    hoursPerWeek: c.hoursPerWeek,
    prerequisites: c.prerequisites,
  }));

  // --- ROOMS ---
  const roomSummary = rooms.map((r) => ({
    name: r.name,
    building: r.building,
    floor: r.floor,
    capacity: r.capacity,
    type: r.type,
    equipment: r.equipment,
    availableDays: Object.entries(r.availability || {})
      .filter(([, slots]) => slots.length > 0)
      .map(([day]) => day),
  }));

  // --- TIMETABLES ---
  // Resolve IDs to names for readability
  const courseMap = Object.fromEntries(
    courses.map((c) => [c._id.toString(), c]),
  );
  const facultyMap = Object.fromEntries(
    faculties.map((f) => [f._id.toString(), f]),
  );
  const roomMap = Object.fromEntries(rooms.map((r) => [r._id.toString(), r]));

  const timetableSummary = timetables.map((t) => ({
    name: t.name,
    department: t.department,
    semester: t.semester,
    year: t.year,
    status: t.status,
    totalHours: t.metadata?.totalHours || 0,
    conflicts: t.conflicts?.length || 0,
    schedule: (t.schedule || []).map((entry) => ({
      day: entry.day,
      time: `${entry.startTime}-${entry.endTime}`,
      course: courseMap[entry.courseId]?.name || entry.courseId,
      courseCode: courseMap[entry.courseId]?.code || "",
      faculty: facultyMap[entry.facultyId]?.name || entry.facultyId,
      room: roomMap[entry.roomId]?.name || entry.roomId,
    })),
  }));

  return {
    stats: {
      totalFaculty: faculties.length,
      totalCourses: courses.length,
      totalRooms: rooms.length,
      totalTimetables: timetables.length,
      departments: [...new Set(faculties.map((f) => f.department))],
    },
    faculty: facultySummary,
    courses: courseSummary,
    rooms: roomSummary,
    timetables: timetableSummary,
  };
}

aiRouter.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Fetch live data from MongoDB
    const dbContext = await buildDatabaseContext();

    const systemPrompt = `You are an AI assistant for ChronoCampus — a Smart Classroom Scheduler application.
You have FULL access to the live database. Answer questions accurately using the data below.

=== DATABASE SNAPSHOT ===

STATS:
- Total Faculty: ${dbContext.stats.totalFaculty}
- Total Courses: ${dbContext.stats.totalCourses}
- Total Rooms: ${dbContext.stats.totalRooms}
- Total Timetables: ${dbContext.stats.totalTimetables}
- Departments: ${dbContext.stats.departments.join(", ")}

FACULTY (${dbContext.faculty.length} members):
${JSON.stringify(dbContext.faculty, null, 2)}

COURSES (${dbContext.courses.length} courses):
${JSON.stringify(dbContext.courses, null, 2)}

ROOMS (${dbContext.rooms.length} rooms):
${JSON.stringify(dbContext.rooms, null, 2)}

TIMETABLES (${dbContext.timetables.length} timetables):
${JSON.stringify(dbContext.timetables, null, 2)}

=== INSTRUCTIONS ===
- Answer questions about faculty, courses, rooms, schedules, and timetables using the data above.
- If asked about a specific teacher/faculty, look them up by name in the FACULTY section.
- If asked about a schedule, look it up in the TIMETABLES section where IDs are already resolved to names.
- Be concise and specific. Use actual names, codes, and times from the data.
- If something is not in the database, say so clearly.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [`${systemPrompt}\n\nUser: ${message}\nAI:`],
    });

    res.json({ response: response.text });
  } catch (error) {
    console.error("AI Chat error:", error);
    res.status(500).json({ error: "Failed to process AI request" });
  }
});
