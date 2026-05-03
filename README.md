# ChronoCampus — Smart Classroom Management System

## A Research-Oriented Academic Project

---

## Abstract

ChronoCampus is a full-stack web-based Smart Classroom Management System designed to automate and streamline academic scheduling, resource management, and institutional communication within a college environment. The system leverages Artificial Intelligence (specifically Google Gemini) to generate conflict-free timetables, incorporates a role-based access control (RBAC) hierarchy, and provides a real-time AI chatbot for querying live academic data. The platform is built with modern web technologies including React.js, Node.js, Express.js, and MongoDB, and is designed to replace manual, error-prone scheduling processes with an intelligent, automated solution.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Problem Statement](#problem-statement)
3. [Objectives](#objectives)
4. [System Architecture](#system-architecture)
5. [Technology Stack](#technology-stack)
6. [Features](#features)
7. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
8. [AI-Powered Timetable Generation](#ai-powered-timetable-generation)
9. [AI Chatbot Assistant](#ai-chatbot-assistant)
10. [Email Notification System (Planned)](#email-notification-system-planned)
11. [Database Design](#database-design)
12. [API Reference](#api-reference)
13. [Frontend Architecture](#frontend-architecture)
14. [Security Implementation](#security-implementation)
15. [Installation & Setup](#installation--setup)
16. [Future Scope](#future-scope)
17. [Conclusion](#conclusion)
18. [References](#references)

---

## Introduction

Academic institutions face significant challenges in managing classroom schedules, faculty assignments, room allocations, and inter-departmental communication. Traditional manual scheduling is time-consuming, error-prone, and lacks the flexibility to adapt to real-time changes. ChronoCampus addresses these challenges by providing a centralized, intelligent platform that automates timetable generation, manages academic resources, and enforces structured access control across multiple departments.

The system is designed for a multi-department engineering college environment with departments including AIDS (Artificial Intelligence & Data Science), AI (Artificial Intelligence), MLIT, Mechanical Engineering, Textile Engineering, Cybersecurity, and CSE Core (Computer Science & Engineering). It supports four distinct user roles — Super Admin (Center Head), Admin (Department Head), Teacher, and Student — each with precisely defined permissions.

---

## Problem Statement

Manual academic scheduling in engineering colleges suffers from several critical issues:

- **Scheduling Conflicts**: Faculty members being assigned to multiple classes at the same time slot.
- **Room Allocation Errors**: Multiple classes assigned to the same room simultaneously.
- **Lack of Specialization Matching**: Courses assigned to faculty without relevant expertise.
- **Communication Gaps**: Delayed or missed notifications to faculty about schedule changes.
- **No Centralized System**: Data spread across spreadsheets, emails, and physical notice boards.
- **No Access Control**: Unauthorized modifications to academic data by non-privileged users.
- **Time-Intensive Process**: Manual timetable creation for multiple departments and semesters takes days.

ChronoCampus solves all of the above through automation, AI, and structured access management.

---

## Objectives

1. Design and implement an AI-powered timetable generation engine that produces conflict-free schedules.
2. Build a multi-role access control system with four hierarchical roles.
3. Provide a centralized dashboard for real-time academic statistics.
4. Enable CRUD operations for Courses, Faculty, Rooms, and Timetables.
5. Implement an AI chatbot that answers natural language queries about live academic data.
6. Design a notification system for broadcasting alerts to users.
7. Plan and architect an email notification system for automated faculty alerts (future implementation).
8. Ensure a responsive, modern UI with dark/light theme support.

---

## System Architecture

ChronoCampus follows a **3-tier client-server architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT TIER                         │
│         React.js SPA (Vite + Tailwind CSS)              │
│   Dashboard | Courses | Faculty | Rooms | Timetable     │
│   Notifications | User Management | AI Chatbot          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST (Axios)
                         │ JWT Bearer Token
┌────────────────────────▼────────────────────────────────┐
│                   APPLICATION TIER                      │
│           Node.js + Express.js REST API                 │
│  Auth | Courses | Faculty | Rooms | Timetables          │
│  Notifications | AI Routes                              │
│  JWT Middleware | RBAC Middleware                       │
└────────────────────────┬────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────┐
│                     DATA TIER                           │
│              MongoDB Atlas (Cloud)                      │
│  Users | Courses | Faculty | Rooms | Timetables         │
│  Notifications                                          │
└─────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  EXTERNAL SERVICES                      │
│         Google Gemini AI API (Timetable + Chat)         │
│         Email Service - Nodemailer (Planned)            │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | v18+ | Runtime environment |
| Express.js | v5.x | REST API framework |
| MongoDB | Atlas Cloud | NoSQL database |
| Mongoose | v8.x | ODM for MongoDB |
| JSON Web Token (JWT) | v9.x | Authentication tokens |
| bcryptjs | v2.x | Password hashing |
| Google Gemini AI | @google/genai v1.x | AI timetable generation & chatbot |
| dotenv | v17.x | Environment variable management |
| cors | v2.x | Cross-Origin Resource Sharing |
| Nodemailer | (Planned) | Email notification delivery |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | v19.x | UI library |
| Vite (rolldown-vite) | v7.x | Build tool & dev server |
| React Router DOM | v7.x | Client-side routing |
| Axios | v1.x | HTTP client |
| Tailwind CSS | v4.x | Utility-first CSS framework |
| Shadcn/ui | Latest | Pre-built accessible UI components |
| Radix UI | v2.x | Headless UI primitives |
| Lucide React | v0.5x | Icon library |
| React Markdown | v10.x | Markdown rendering for chatbot |
| clsx + tailwind-merge | Latest | Conditional class utilities |

---

## Features

### 1. Authentication & Session Management
- JWT-based stateless authentication
- Secure password hashing using bcryptjs (salt rounds: 10)
- Token stored in localStorage, auto-attached to all API requests via Axios interceptors
- Session restoration on page reload via `/api/auth/me`
- Automatic redirect to login on token expiry
- Logout clears token and resets Axios headers

### 2. Role-Based Access Control (RBAC)
Four hierarchical roles with granular permissions (detailed in the RBAC section below).

### 3. Dashboard
- Real-time KPI cards showing: Total Courses, Faculty, Rooms, Timetables, Conflicts, Published Timetables, Unread Notifications
- Recent timetables list with status badges
- Quick action shortcuts to all major modules
- Recent notifications feed
- Integrated AI chatbot floating action button

### 4. Course Management
- Full CRUD operations for academic courses
- Fields: Course Name, Code, Department, Credits, Semester, Year, Type (Lecture/Lab/Seminar), Hours Per Week, Prerequisites, Description, Duration
- Searchable and sortable data table
- Role-restricted: only super_admin and admin can create/edit/delete

### 5. Faculty Management
- Full CRUD for faculty members
- Fields: Name, Email, Department, Designation, Specialization (multi-value), Max Hours Per Week, Weekly Availability Slots (per day), Preferred/Avoid Time Slots
- Availability schedule builder with day-wise time slot management
- Role-restricted write operations

### 6. Room Management
- Full CRUD for classrooms, labs, seminar rooms, and auditoriums
- Fields: Room Name, Building, Floor, Capacity, Type, Equipment (multi-value), Weekly Availability Schedule
- Only super_admin can create/edit/delete rooms (shared infrastructure)
- All authenticated users can view rooms

### 7. AI-Powered Timetable Generation
- Generates complete weekly timetables using Google Gemini AI
- Input: Department, Semester, Academic Year, Optional Constraints
- AI enforces: specialization matching, no conflicts, all sessions scheduled
- Timetable grid visualization (Days × Time Slots matrix)
- Conflict detection and display
- Publish/Unpublish/Delete timetable actions
- Export timetable as JSON
- Utilization rate metadata

### 8. Notification System
- Create, read, delete notifications
- Types: Info, Warning, Error, Success
- Priority levels: Low, Medium, High
- Mark individual or all notifications as read
- Unread count badge in sidebar navigation
- Auto-generated notifications on timetable generation success/failure

### 9. AI Chatbot Assistant
- Floating chat widget accessible from Dashboard
- Powered by Google Gemini 2.5 Flash
- Has full access to live database context (faculty, courses, rooms, timetables)
- Answers natural language questions like:
  - "Who teaches Data Structures?"
  - "What rooms are available on Monday?"
  - "Show me the timetable for AIDS Semester 3"
- Markdown-rendered responses

### 10. Dark / Light Theme
- System-wide dark/light mode toggle
- Persisted in localStorage
- Consistent theming across all components using Tailwind CSS dark: variants

### 11. User Management (Super Admin)
- Create users with role and department assignment
- Enable/disable user accounts
- Delete users
- View all registered users with role badges
- Accessible only to super_admin via dedicated `/users` route

---

## Role-Based Access Control (RBAC)

### Role Hierarchy

```
Super Admin (Center Head)
        │
        ├── Admin (Department Head)
        │       ├── AIDS Department
        │       ├── AI Department
        │       ├── MLIT Department
        │       ├── Mechanical Department
        │       ├── Textile Department
        │       ├── Cybersecurity Department
        │       └── CSE Core Department
        │
        ├── Teacher
        └── Student
```

### Permission Matrix

| Feature | Super Admin | Admin | Teacher | Student |
|---|:---:|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Courses | ✅ | ✅ | ✅ | ✅ |
| Create/Edit/Delete Courses | ✅ | ✅ | ❌ | ❌ |
| View Faculty | ✅ | ✅ | ✅ | ✅ |
| Create/Edit/Delete Faculty | ✅ | ✅ | ❌ | ❌ |
| View Rooms | ✅ | ✅ | ✅ | ✅ |
| Create/Edit/Delete Rooms | ✅ | ❌ | ❌ | ❌ |
| View Timetables | ✅ | ✅ | ✅ | ✅ |
| Generate/Publish Timetables | ✅ | ✅ | ❌ | ❌ |
| Delete Timetables | ✅ | ❌ | ❌ | ❌ |
| View Notifications | ✅ | ✅ | ✅ | ✅ |
| Create/Delete Notifications | ✅ | ✅ | ❌ | ❌ |
| Mark Notifications as Read | ✅ | ✅ | ✅ | ✅ |
| User Management | ✅ | ❌ | ❌ | ❌ |
| AI Chatbot | ✅ | ✅ | ✅ | ✅ |

### JWT Token Payload
```json
{
  "id": "user_mongodb_id",
  "role": "admin",
  "department": "AIDS",
  "iat": 1700000000,
  "exp": 1700604800
}
```

Token expiry: **7 days**

---

## AI-Powered Timetable Generation

### How It Works

The timetable generation engine follows a 5-step pipeline:

```
Step 1: Receive Request
        { department, semester, academicYear, constraints }
                │
Step 2: Fetch Database Context
        Courses (filtered by dept + semester)
        Faculty (filtered by dept)
        All Rooms
                │
Step 3: Engineer Prompt for Gemini AI
        - Available days: Mon–Fri
        - Time slots: 09:00–17:30 (6 slots/day)
        - Mandatory break: 12:15–13:15
        - Specialization matching rules
        - Conflict-free constraints
                │
Step 4: Parse AI JSON Response
        Array of schedule entries:
        { courseId, facultyId, roomId, day, startTime, endTime }
                │
Step 5: Enrich & Save to MongoDB
        Resolve IDs to names
        Calculate utilization rate
        Create success/error notification
        Return saved timetable
```

### Time Slots
| Slot | Start | End |
|---|---|---|
| 1 | 09:00 | 10:00 |
| 2 | 10:00 | 11:00 |
| 3 | 11:15 | 12:15 |
| Break | 12:15 | 13:15 |
| 4 | 14:15 | 15:15 |
| 5 | 15:15 | 16:15 |
| 6 | 16:30 | 17:30 |

### AI Constraints Enforced
1. Faculty specialization must match course subject matter
2. One faculty per course for all weekly sessions
3. No faculty double-booking (same time slot)
4. No room double-booking (same time slot)
5. All required weekly sessions must be scheduled
6. Mandatory break slot must remain empty

---

## AI Chatbot Assistant

The chatbot is powered by **Google Gemini 2.5 Flash** and has access to a live database snapshot built at query time.

### Context Provided to AI
- Total counts (faculty, courses, rooms, timetables)
- Full faculty list with availability and specializations
- Full course list with codes, credits, and semester info
- Full room list with capacity and equipment
- Full timetable schedules with resolved names (not raw IDs)

### Example Queries
- "Which faculty teaches Machine Learning?"
- "How many courses are in semester 3 of AIDS?"
- "Is Room A101 available on Wednesday?"
- "Show me all published timetables"
- "Who has the most teaching hours this week?"

---

## Email Notification System (Planned)

> **Status: Designed & Architected — Implementation Pending**

This feature is planned as the next major addition to ChronoCampus. The architecture is fully designed and documented here.

### Overview
An automated email notification system that dynamically alerts faculty members about:
- New timetable published for their department
- Schedule changes affecting their assigned courses
- Room changes or cancellations
- Important announcements from Admin/Super Admin
- Upcoming class reminders (24 hours before)

### Planned Technology
- **Nodemailer** — Node.js email sending library
- **SMTP Provider** — Gmail SMTP / SendGrid / AWS SES
- **Email Templates** — HTML templates with dynamic content injection
- **Job Scheduler** — node-cron for time-based reminder emails

### Planned Architecture

```
Trigger Event (e.g., Timetable Published)
        │
        ▼
Notification Service
        │
        ├── Save to DB (existing notification system)
        │
        └── Email Queue
                │
                ▼
        Fetch affected faculty emails from DB
                │
                ▼
        Render HTML email template
        (faculty name, course, room, time slot)
                │
                ▼
        Send via Nodemailer SMTP
                │
                ▼
        Log delivery status
```

### Planned Email Types

| Email Type | Trigger | Recipients |
|---|---|---|
| Timetable Published | Admin publishes timetable | All faculty in that department |
| Schedule Change | Timetable entry updated | Affected faculty member |
| New Notification | Admin creates high-priority notification | All active users in department |
| Class Reminder | 24 hours before class | Assigned faculty |
| Account Created | Super admin creates user | New user (welcome email) |
| Password Reset | User requests reset | Requesting user |

### Planned API Endpoints
```
POST /api/email/send-timetable-notification
POST /api/email/send-announcement
POST /api/email/send-reminder
GET  /api/email/logs
```

### Planned Email Template (Timetable Notification)
```
Subject: [ChronoCampus] New Timetable Published — {Department} Semester {N}

Dear {Faculty Name},

A new timetable has been published for {Department}, Semester {N}, Academic Year {Year}.

Your Schedule:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{Day}     {Time}     {Course}     {Room}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please log in to ChronoCampus for full details.

Regards,
ChronoCampus System
```

---

## Database Design

### Collections

#### Users
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (bcrypt hashed),
  role: Enum ["super_admin", "admin", "teacher", "student"],
  department: Enum ["AIDS", "AI", "MLIT", "Mechanical", "Textile", "Cybersecurity", "CSE Core", null],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### Courses
```javascript
{
  _id: ObjectId,
  name: String (required),
  code: String (required, unique),
  department: String (required),
  credits: Number (required),
  semester: Number (required),
  year: Number (default: current year),
  description: String,
  duration: Number (default: 13 weeks),
  prerequisites: [String],
  type: Enum ["lecture", "lab", "seminar"],
  hoursPerWeek: Number (default: 3),
  createdAt: Date,
  updatedAt: Date
}
```

#### Faculty
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  department: String (required),
  specialization: [String],
  availability: {
    monday: [{ start: String, end: String }],
    tuesday: [...], wednesday: [...],
    thursday: [...], friday: [...],
    saturday: [...], sunday: [...]
  },
  maxHoursPerWeek: Number (required),
  preferences: {
    preferredTimeSlots: [String],
    avoidTimeSlots: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Rooms
```javascript
{
  _id: ObjectId,
  name: String (required),
  building: String (required),
  floor: Number (required),
  capacity: Number (required),
  type: Enum ["lecture_hall", "lab", "seminar_room", "auditorium"],
  equipment: [String],
  availability: {
    monday: [{ start: String, end: String }],
    // ... same structure as faculty availability
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Timetables
```javascript
{
  _id: ObjectId,
  name: String (required),
  semester: String (required),
  year: Number (required),
  department: String (required),
  schedule: [{
    courseId: String,
    facultyId: String,
    roomId: String,
    day: Enum ["Monday"..."Friday"],
    startTime: String,
    endTime: String,
    courseName: String,
    facultyName: String,
    roomName: String,
    timeSlot: String
  }],
  status: Enum ["draft", "published", "archived"],
  conflicts: [{ type: String, message: String, entries: [String] }],
  metadata: {
    totalHours: Number,
    utilizationRate: Number,
    conflictCount: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Notifications
```javascript
{
  _id: ObjectId,
  title: String (required),
  message: String (required),
  type: Enum ["info", "warning", "error", "success"],
  priority: Enum ["low", "medium", "high"],
  isRead: Boolean (default: false),
  createdAt: Date
}
```

---

## API Reference

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/seed` | None | — | Create first super_admin (only if no users exist) |
| POST | `/login` | None | — | Login and receive JWT token |
| GET | `/me` | JWT | Any | Get current user profile |
| POST | `/register` | JWT | super_admin | Create a new user |
| GET | `/users` | JWT | super_admin | List all users |
| PUT | `/users/:id` | JWT | super_admin | Update user role/status |
| DELETE | `/users/:id` | JWT | super_admin | Delete a user |

### Courses Routes (`/api/courses`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/` | JWT | Any | Get all courses |
| GET | `/:id` | JWT | Any | Get course by ID |
| POST | `/` | JWT | super_admin, admin | Create course |
| PUT | `/:id` | JWT | super_admin, admin | Update course |
| DELETE | `/:id` | JWT | super_admin, admin | Delete course |

### Faculty Routes (`/api/faculty`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/` | JWT | Any | Get all faculty |
| GET | `/:id` | JWT | Any | Get faculty by ID |
| POST | `/` | JWT | super_admin, admin | Create faculty |
| PUT | `/:id` | JWT | super_admin, admin | Update faculty |
| DELETE | `/:id` | JWT | super_admin, admin | Delete faculty |

### Rooms Routes (`/api/rooms`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/` | JWT | Any | Get all rooms |
| GET | `/:id` | JWT | Any | Get room by ID |
| POST | `/` | JWT | super_admin | Create room |
| PUT | `/:id` | JWT | super_admin | Update room |
| DELETE | `/:id` | JWT | super_admin | Delete room |

### Timetables Routes (`/api/timetables`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/` | JWT | Any | Get all timetables |
| GET | `/:id` | JWT | Any | Get timetable by ID |
| POST | `/` | JWT | super_admin, admin | Create timetable manually |
| POST | `/generate` | JWT | super_admin, admin | Generate timetable with AI |
| PUT | `/:id` | JWT | super_admin, admin | Update/publish timetable |
| DELETE | `/:id` | JWT | super_admin | Delete timetable |

### Notifications Routes (`/api/notifications`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/` | JWT | Any | Get all notifications |
| POST | `/` | JWT | super_admin, admin | Create notification |
| PUT | `/:id/read` | JWT | Any | Mark notification as read |
| DELETE | `/:id` | JWT | super_admin, admin | Delete notification |

### AI Routes (`/api/ai`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/chat` | JWT | Any | Send message to AI chatbot |

---

## Frontend Architecture

### Component Tree
```
App
├── AuthProvider (Context)
│   └── ThemeProvider (Context)
│       └── Router
│           ├── /login → LoginPage
│           ├── / → ProtectedRoute → Dashboard
│           ├── /courses → ProtectedRoute → CoursesPage
│           ├── /faculty → ProtectedRoute → FacultyPage
│           ├── /rooms → ProtectedRoute → RoomsPage
│           ├── /timetables → ProtectedRoute → TimetablePage
│           ├── /notifications → ProtectedRoute → NotificationsPage
│           └── /users → ProtectedRoute (super_admin) → UserManagementPage
│
├── Layout (Sidebar + Navigation)
│   ├── Brand + Theme Toggle
│   ├── User Info Card (name, role badge, department, logout)
│   └── Navigation Items (role-aware)
│
└── Shared Components
    ├── ProtectedRoute
    ├── DataTable (searchable, sortable)
    ├── CourseForm
    ├── FacultyForm
    ├── Chatbot
    └── UI Components (Button, Card, Input, Select, Badge, etc.)
```

### State Management
- **Local State**: `useState` for component-level data
- **Auth Context**: Global user session, token, login/logout, permission helpers
- **Theme Context**: Dark/light mode, persisted to localStorage
- **No Redux/Zustand**: Kept simple with React Context API for this scale

### Permission Helper Functions (AuthContext)
```javascript
isSuperAdmin()   // role === "super_admin"
isAdmin()        // role === "admin" || "super_admin"
isTeacher()      // role === "teacher"
isStudent()      // role === "student"
canWrite()       // role === "super_admin" || "admin"
canManageRooms() // role === "super_admin"
```

---

## Security Implementation

### 1. Password Security
- Passwords hashed using **bcryptjs** with 10 salt rounds
- Plain-text passwords never stored or logged
- Password comparison done server-side only

### 2. JWT Authentication
- Tokens signed with a secret key (stored in `.env`)
- Token expiry: 7 days
- Token validated on every protected route via middleware
- Inactive users rejected even with valid tokens

### 3. Route Protection
- Backend: `authenticate` middleware on all non-public routes
- Backend: `authorize(...roles)` middleware for role-specific routes
- Frontend: `ProtectedRoute` component redirects unauthenticated users to `/login`
- Frontend: Role-based UI rendering hides unauthorized actions

### 4. CORS Configuration
- CORS enabled for frontend-backend communication
- Should be restricted to specific origin in production

### 5. Environment Variables
- All secrets (MongoDB URI, JWT Secret, Google API Key) stored in `.env`
- `.env` excluded from version control via `.gitignore`

---

## Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### Backend Setup
```bash
cd Smart-Classroom/backend
npm install
```

Create `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
GOOGLE_API_KEY=your_gemini_api_key
JWT_SECRET=your_strong_secret_key
```

Start backend:
```bash
npm run dev
```

### Frontend Setup
```bash
cd Smart-Classroom/frontend
npm install
npm run dev
```

### First-Time Super Admin Setup
If no users exist in the database, call:
```
POST http://localhost:5000/api/auth/seed
Content-Type: application/json

{
  "name": "Center Head",
  "email": "admin@college.com",
  "password": "securepassword"
}
```

If users already exist, run the script:
```bash
cd Smart-Classroom/backend
node scripts/createSuperAdmin.js
```

---

## Future Scope

1. **Email Notification System** — Automated email alerts to faculty on timetable publish, schedule changes, and reminders (architecture fully designed, implementation pending).
2. **Mobile Application** — React Native app for students and teachers to view timetables on mobile.
3. **Timetable Optimization** — AI-powered optimization of existing timetables to reduce conflicts and improve utilization.
4. **Student Enrollment** — Link students to courses and generate personalized timetable views.
5. **Attendance Integration** — QR-code based attendance marking linked to timetable slots.
6. **Analytics Dashboard** — Department-wise analytics on room utilization, faculty workload, and course distribution.
7. **Calendar Integration** — Export timetables to Google Calendar / iCal format.
8. **Multi-Semester Planning** — Plan and compare timetables across multiple semesters simultaneously.
9. **Conflict Resolution AI** — AI suggestions for resolving detected scheduling conflicts.
10. **API Rate Limiting** — Protect API endpoints from abuse using express-rate-limit.
11. **Audit Logs** — Track all create/update/delete operations with user and timestamp.
12. **Two-Factor Authentication (2FA)** — OTP-based login for admin accounts.

---

## Conclusion

ChronoCampus demonstrates the practical application of Artificial Intelligence in solving real-world academic administration problems. By combining a modern full-stack architecture with Google Gemini AI, the system reduces timetable generation time from days to seconds while ensuring zero scheduling conflicts. The role-based access control system ensures data integrity and appropriate access across all levels of the institutional hierarchy. The planned email notification system will further enhance communication efficiency by ensuring faculty are dynamically and timely informed of any schedule changes. This project serves as a foundation for a fully automated, AI-driven smart campus management ecosystem.

---

## References

1. Vastrakar, A., et al. (2023). *Automated Timetable Generation Using Genetic Algorithms*. International Journal of Computer Applications.
2. Google. (2024). *Gemini API Documentation*. https://ai.google.dev/docs
3. MongoDB Inc. (2024). *MongoDB Atlas Documentation*. https://www.mongodb.com/docs/atlas/
4. React Documentation. (2024). https://react.dev
5. Express.js Documentation. (2024). https://expressjs.com
6. Nodemailer Documentation. (2024). https://nodemailer.com
7. JSON Web Tokens. (2024). *JWT Introduction*. https://jwt.io/introduction
8. Tailwind CSS Documentation. (2024). https://tailwindcss.com/docs
9. Wren, A. (1996). *Scheduling, Timetabling and Rostering — A Special Relationship?* Lecture Notes in Computer Science, Springer.
10. Burke, E., & Petrovic, S. (2002). *Recent Research Directions in Automated Timetabling*. European Journal of Operational Research, 140(2), 266–280.

---

*ChronoCampus — Developed as an academic research project for B.Tech final year.*
*Department of Computer Science & Engineering*
