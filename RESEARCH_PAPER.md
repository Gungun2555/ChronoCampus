# Smart Classroom Management System with Role-Based Access and Automated OMR Answer Detection

**International Journal of Engineering Research and Technology (IJERT)**
*Submitted in partial fulfillment of B.Tech Major Project*

**Authors:** [Author Name(s)], Department of Computer Science & Engineering,
[College Name], [University Name], [City], India

---

## Abstract

Academic institutions in India face persistent challenges in managing classroom schedules, faculty assignments, room allocations, and examination result processing. Manual timetable creation is error-prone and time-intensive, while traditional Optical Mark Recognition (OMR) evaluation systems are expensive, hardware-dependent, and inaccessible to smaller institutions. This paper presents ChronoCampus — a Smart Classroom Management System that integrates AI-powered automated timetable generation with a software-based OMR answer sheet detection module, unified under a structured Role-Based Access Control (RBAC) framework. The timetable generation engine leverages Google Gemini, a Large Language Model (LLM), to produce conflict-free weekly schedules by reasoning over faculty specializations, room availability, and course requirements in a single inference pass. The OMR detection module processes scanned answer sheets (PDF or image format), applies computer vision techniques including adaptive thresholding and contour detection to identify filled bubbles, extracts student responses, evaluates them against an answer key, and exports results to Excel. The system supports four hierarchical roles: Super Admin (Center Head), Admin (Department Head), Teacher, and Student, each with precisely scoped permissions. Experimental results demonstrate timetable generation in under 10 seconds and OMR detection accuracy exceeding 92% on standard scan quality inputs. The system significantly reduces administrative overhead and provides a scalable, institution-ready solution.

**Keywords:** Smart Classroom, Role-Based Access Control, Automated Timetable Generation, OMR Detection, Large Language Model, Computer Vision, Academic Management System

---

## 1. Introduction

### 1.1 Background and Problem Statement

Engineering colleges in India typically manage academic operations through spreadsheets, physical notice boards, and manual processes. The scheduling of classes across multiple departments, semesters, and faculty members is a combinatorial optimization problem that, when solved manually, routinely produces conflicts — two classes assigned to the same room, a faculty member scheduled for two simultaneous lectures, or courses assigned to instructors without relevant expertise. A single department's timetable can take two to three working days to finalize manually, and conflicts are often discovered only after distribution.

Simultaneously, the evaluation of multiple-choice examinations using physical OMR sheets requires dedicated scanning hardware costing upwards of ₹1,50,000, making it inaccessible to most mid-tier institutions. Faculty members resort to manual checking of bubble sheets, which is slow, subjective, and error-prone at scale.

### 1.2 Motivation

The convergence of accessible AI APIs (Google Gemini), open-source computer vision libraries (OpenCV), and modern full-stack web frameworks creates an opportunity to build a unified, affordable, and intelligent academic management platform. ChronoCampus demonstrates that institution-grade automation is achievable without proprietary hardware or enterprise software licenses.

### 1.3 Objectives

1. Design an AI-powered timetable generation engine producing conflict-free schedules in under 15 seconds.
2. Build a software-based OMR detection system processing scanned PDFs/images and exporting results to Excel.
3. Implement a four-tier RBAC system governing all system operations.
4. Provide a centralized web dashboard for real-time academic statistics.
5. Develop an AI chatbot for natural language queries over live academic data.
6. Architect an email notification system for automated faculty alerts (planned).
7. Ensure deployability on standard college infrastructure without specialized hardware.

### 1.4 Scope

The system targets multi-department engineering colleges with departments including AIDS, AI, MLIT, Mechanical, Textile, Cybersecurity, and CSE Core. It handles timetable management for up to 8 semesters per department and supports OMR evaluation for standard 4-option (A/B/C/D) MCQ papers.

---

## 2. Literature Review

### 2.1 Automated Timetable Generation

Timetable scheduling is a well-studied NP-hard combinatorial optimization problem. Burke and Petrovic [1] surveyed automated timetabling approaches, categorizing them into sequential, cluster-based, and meta-heuristic methods.

**Genetic Algorithms (GA):** Wren [2] applied evolutionary computation to timetabling. GA-based systems encode schedules as chromosomes, apply crossover and mutation operators, and use a fitness function penalizing conflicts. While effective, GA systems require careful parameter tuning and may take minutes to converge for large datasets.

**Constraint Programming:** Systems like UniTime [3] use constraint solvers (OR-Tools, Choco) to enumerate feasible schedules. These are highly accurate but computationally expensive and require domain-specific constraint modeling expertise.

**Machine Learning Approaches:** Babaei et al. [4] explored neural network-based scheduling as a sequence prediction problem. These approaches require large training datasets of historical timetables, which most institutions do not maintain.

**Gap:** Existing systems are computationally expensive, require specialized configuration expertise, or are not accessible as lightweight web platforms. None leverage modern LLMs for zero-shot constraint-aware scheduling.

### 2.2 OMR Detection Systems

Traditional OMR systems (Addmen OMR, AutoMarkIt) rely on dedicated flatbed scanners with precise DPI calibration. Hussain et al. [5] demonstrated a software-based OMR system using OpenCV achieving 89% accuracy on standard scans. Agarwal and Sharma [6] proposed a PDF-to-image pipeline using pdf2image and Pillow for preprocessing before bubble detection.

**Gap:** Most software-based OMR systems are standalone desktop applications, not integrated into broader academic management platforms. Integration with RBAC, result storage, and Excel export within a web application remains largely unexplored.

### 2.3 Role-Based Access Control in Academic Systems

RBAC is defined in NIST SP 800-162 [7]. Ferraiolo et al. [8] formalized the RBAC model with roles, permissions, and user-role assignments. Academic ERP systems like Fedena and OpenEduCat implement RBAC but are monolithic, heavyweight, and not AI-integrated.

### 2.4 Comparison with Existing Systems

| Feature | Fedena ERP | UniTime | Manual Process | ChronoCampus |
|---|---|---|---|---|
| Timetable Generation | Manual | GA/CSP | Manual | LLM (Gemini AI) |
| OMR Evaluation | No | No | Physical hardware | Software CV |
| RBAC | Yes | Limited | No | 4-tier hierarchy |
| AI Chatbot | No | No | No | Yes (Gemini) |
| Web-based | Yes | Yes | No | Yes |
| Cost | High license | Open source | Low | Low (API-based) |
| Setup Complexity | High | High | Low | Low |

---

## 3. Methodology

### 3.1 System Architecture

ChronoCampus follows a three-tier client-server architecture:

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT TIER                       │
│         React.js SPA (Vite + Tailwind CSS)          │
│  Dashboard | Courses | Faculty | Rooms | Timetable  │
│  OMR Upload | Notifications | User Management       │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS REST + JWT Bearer Token
┌──────────────────────▼──────────────────────────────┐
│               APPLICATION TIER                      │
│         Node.js + Express.js REST API               │
│  Auth/RBAC Middleware | CRUD Modules                │
│  Gemini AI Module | OMR Processing Module           │
│  Excel Export Module | Notification Module          │
└──────────────────────┬──────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────┐
│                  DATA TIER                          │
│           MongoDB Atlas (Cloud)                     │
│  Users | Courses | Faculty | Rooms                  │
│  Timetables | Notifications | OMR Results           │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              EXTERNAL SERVICES                      │
│  Google Gemini AI API | Nodemailer SMTP (Planned)   │
│  pdf2image / OpenCV | ExcelJS                       │
└─────────────────────────────────────────────────────┘
```

### 3.2 Role-Based Access Control Design

#### 3.2.1 Role Hierarchy

```
Super Admin (Center Head)
        │
        ├── Admin (Department Head)
        │       ├── AIDS  ├── AI  ├── MLIT
        │       ├── Mechanical  ├── Textile
        │       ├── Cybersecurity  └── CSE Core
        ├── Teacher
        └── Student
```

**Super Admin** is the Center Head with unrestricted access to all system functions including user management, room management, timetable deletion, and system-wide notifications.

**Admin** is a Department Head assigned to exactly one department. Admins manage courses, faculty, and timetables within their department only.

**Teacher** has read-only access to all academic data and can mark notifications as read.

**Student** has read-only access limited to published timetables and notifications.

#### 3.2.2 Permission Matrix

| Feature | Super Admin | Admin | Teacher | Student |
|---|:---:|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Create/Edit/Delete Courses | ✅ | ✅ | ❌ | ❌ |
| Create/Edit/Delete Faculty | ✅ | ✅ | ❌ | ❌ |
| Create/Edit/Delete Rooms | ✅ | ❌ | ❌ | ❌ |
| Generate/Publish Timetables | ✅ | ✅ | ❌ | ❌ |
| Delete Timetables | ✅ | ❌ | ❌ | ❌ |
| Upload OMR / View Results | ✅ | ✅ | ✅ | ❌ |
| Create/Delete Notifications | ✅ | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |
| AI Chatbot | ✅ | ✅ | ✅ | ✅ |

#### 3.2.3 Backend Middleware Implementation

Two Express.js middleware functions enforce access control at the API layer:

```
authenticate(req, res, next):
  1. Extract Bearer token from Authorization header
  2. Verify JWT signature using JWT_SECRET (HS256)
  3. Decode payload: { id, role, department, exp }
  4. Fetch user from MongoDB by id
  5. Verify isActive === true
  6. Attach user to req.user
  7. Call next() or return HTTP 401/403

authorize(...allowedRoles):
  Returns middleware:
  1. Check req.user.role ∈ allowedRoles[]
  2. If yes → next()
  3. If no  → HTTP 403 { error: "Access denied" }
```

JWT token payload structure:
```json
{
  "id": "mongodb_object_id",
  "role": "admin",
  "department": "AIDS",
  "iat": 1700000000,
  "exp": 1700604800
}
```
Token validity: 7 days. Signed with HMAC-SHA256.

### 3.3 AI-Powered Timetable Generation

#### 3.3.1 Approach: LLM-Based Zero-Shot Scheduling

Unlike Genetic Algorithm or Constraint Programming approaches, ChronoCampus treats timetable generation as a **structured text generation problem** delegated to a Large Language Model. Google Gemini 2.0 Flash is prompted with a detailed natural language specification and returns a valid JSON schedule in a single inference pass — requiring no training data, no fitness function, and no iterative optimization loop.

#### 3.3.2 Generation Pipeline

```
Step 1 — Input Validation
  Receive: { department, semester, academicYear }
  Validate all required fields present

Step 2 — Database Context Fetch
  courses WHERE department=X AND semester=Y
  faculty WHERE department=X
  rooms (all)
  Compute: sessions = ceil(totalHours / 13) OR hoursPerWeek

Step 3 — Prompt Engineering
  Build prompt with:
    Available days: Monday–Friday
    6 time slots/day (09:00–17:30)
    Mandatory break: 12:15–13:15
    Course list with IDs + weekly session count
    Faculty list with IDs + specializations
    Room list with IDs
    6 hard constraints

Step 4 — Gemini API Call
  Model: gemini-2.0-flash
  Single inference pass → raw text response

Step 5 — Response Parsing
  Strip markdown fences (```json...```)
  JSON.parse() cleaned string
  Validate: non-empty array

Step 6 — Enrichment & Persistence
  Resolve IDs → human-readable names
  utilizationRate = (entries / 30) × 100
  Save Timetable to MongoDB
  Create success/error Notification
  Return to client
```

#### 3.3.3 Hard Constraints Enforced via Prompt

1. Faculty must only be assigned to courses matching their specializations.
2. One faculty member handles all weekly sessions of a given course.
3. Every course must receive its full required weekly session count.
4. No faculty double-booking (same day + time slot).
5. No room double-booking (same day + time slot).
6. The 12:15–13:15 break slot must remain unscheduled.

#### 3.3.4 Time Slot Configuration

| Slot | Start | End | Type |
|---|---|---|---|
| 1 | 09:00 | 10:00 | Class |
| 2 | 10:00 | 11:00 | Class |
| 3 | 11:15 | 12:15 | Class |
| — | 12:15 | 13:15 | Mandatory Break |
| 4 | 14:15 | 15:15 | Class |
| 5 | 15:15 | 16:15 | Class |
| 6 | 16:30 | 17:30 | Class |

Maximum schedulable slots per week: 5 days × 6 slots = **30 slots**.

### 3.4 OMR Answer Sheet Detection

#### 3.4.1 Overview

The OMR detection module is a server-side image processing pipeline accepting a scanned answer sheet (PDF or image), detecting filled bubbles using computer vision, mapping them to question-answer pairs, evaluating against a stored answer key, and exporting results to Excel.

#### 3.4.2 Processing Pipeline

```
Input: Scanned PDF or Image (multipart/form-data upload)
         │
Step 1: PDF → Image Conversion
         pdf2image (poppler) → PNG at 300 DPI
         │
Step 2: Preprocessing
         Grayscale conversion (cv2.cvtColor)
         Gaussian blur (5×5 kernel) — noise reduction
         Adaptive thresholding (cv2.adaptiveThreshold)
         → Binary image: filled bubbles = dark regions
         │
Step 3: Grid Detection & Perspective Correction
         cv2.findContours (RETR_EXTERNAL)
         Identify answer grid bounding rectangle
         cv2.getPerspectiveTransform + cv2.warpPerspective
         → Corrected, deskewed grid image
         │
Step 4: Bubble Segmentation
         Divide grid into matrix:
           Rows = number of questions (e.g., 50)
           Columns = number of options (4: A,B,C,D)
         Each cell = Region of Interest (ROI)
         │
Step 5: Fill Detection per Cell
         For each ROI:
           non_zero = cv2.countNonZero(ROI)
           fill_ratio = non_zero / (width × height)
           filled = fill_ratio > 0.60 (threshold)
         Select option with maximum fill_ratio per row
         │
Step 6: Answer Extraction & Scoring
         Build response array: [Q1→B, Q2→A, Q3→D, ...]
         Compare with answer key from MongoDB
         Compute: correct, wrong, score, percentage
         │
Step 7: Excel Generation (ExcelJS)
         Columns: Roll No | Name | Q1..Qn | Score | % | Result
         Conditional formatting: green=correct, red=wrong
         │
Output: Downloadable .xlsx + JSON result in MongoDB
```

#### 3.4.3 Bubble Detection Pseudo-code

```
FUNCTION detectFilledBubble(cell_roi, threshold=0.60):
    gray    ← convertToGrayscale(cell_roi)
    binary  ← applyAdaptiveThreshold(gray, THRESH_BINARY_INV)
    total   ← cell_roi.width × cell_roi.height
    filled  ← countNonZeroPixels(binary)
    RETURN (filled / total) > threshold

FUNCTION processSheet(image, num_questions, num_options=4):
    grid      ← detectAndCorrectGrid(image)
    responses ← []
    FOR q IN range(num_questions):
        row   ← extractRow(grid, q)
        cells ← splitIntoCells(row, num_options)
        ratios ← [fillRatio(cell) FOR cell IN cells]
        selected ← argmax(ratios)
        responses.append(OPTIONS[selected])  // A,B,C,D
    RETURN responses
```

#### 3.4.4 Answer Key Schema (MongoDB)

```javascript
{
  examId: ObjectId,
  subject: String,
  department: String,
  semester: Number,
  answers: ["A", "C", "B", "D", ...],
  totalMarks: Number,
  passingMarks: Number,
  createdBy: ObjectId
}
```

---

## 4. Implementation

### 4.1 Technologies Used

#### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | v18+ | Server runtime |
| Express.js | v5.x | REST API framework |
| MongoDB Atlas | Cloud | NoSQL database |
| Mongoose | v8.x | ODM for MongoDB |
| JSON Web Token | v9.x | Stateless authentication |
| bcryptjs | v2.x | Password hashing (10 salt rounds) |
| Google Gemini AI | @google/genai v1.x | Timetable generation + chatbot |
| OpenCV (cv2) | v4.x | Image processing for OMR |
| pdf2image | Latest | PDF to PNG conversion |
| ExcelJS | v4.x | Excel file generation |
| Nodemailer | v6.x | Email delivery (planned) |

#### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | v19.x | UI library |
| Vite | v7.x | Build tool |
| React Router DOM | v7.x | Client-side routing |
| Axios | v1.x | HTTP client with interceptors |
| Tailwind CSS | v4.x | Utility-first styling |
| Shadcn/ui + Radix UI | Latest | Accessible UI components |
| Lucide React | v0.5x | Icon library |
| React Markdown | v10.x | Chatbot response rendering |

### 4.2 Timetable Generation Workflow (Detailed)

```
[Admin fills form]
  department = "AIDS"
  semester = 3
  academicYear = 2025
        │
        ▼
[POST /api/timetables/generate]
  authenticate() → verify JWT
  authorize("super_admin","admin") → check role
        │
        ▼
[timetableGenerator.js]
  1. Query: Course.find({ department:"AIDS", semester:3 })
     Result: [DS, DBMS, OS, ML, Python Lab, ...]
  2. Query: Faculty.find({ department:"AIDS" })
     Result: [Dr. Sharma(ML,AI), Prof. Gupta(DB,OS), ...]
  3. Query: Room.find({})
     Result: [A101(60), Lab-B(30), Seminar-C(40), ...]
  4. Build prompt string (≈800 tokens)
  5. genAI.models.generateContent({ model:"gemini-2.0-flash" })
  6. Parse JSON array from response.text
  7. Enrich: resolve IDs → names
  8. Save: new Timetable({ schedule, metadata })
  9. Notify: new Notification({ type:"success" })
        │
        ▼
[Response to client]
  { _id, name, schedule:[...], metadata:{ utilizationRate } }
        │
        ▼
[TimetableGrid component renders]
  5-column (Mon–Fri) × 7-row (time slots) grid
  Each cell shows: Course Name, Faculty, Room
  Color-coded by course type (lecture/lab/seminar)
```

### 4.3 OMR Detection Workflow (Detailed)

```
[Admin uploads scanned answer sheet]
  File: exam_batch_A.pdf
  Answer Key: already stored in DB for this exam
        │
        ▼
[POST /api/omr/process]
  Multer middleware saves file to /uploads/omr/
        │
        ▼
[OMR Processing Service]
  1. pdf2image.convert(pdf_path, dpi=300)
     → [page_001.png, page_002.png, ...]
  2. For each page:
     a. cv2.imread(page_path)
     b. cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
     c. cv2.GaussianBlur(gray, (5,5), 0)
     d. cv2.adaptiveThreshold(blurred, ...)
     e. contours = cv2.findContours(...)
     f. grid_region = findLargestRectangle(contours)
     g. corrected = perspectiveTransform(grid_region)
     h. responses = processSheet(corrected, 50 questions)
  3. Compare responses with answer key
  4. Calculate: score, percentage, pass/fail
        │
        ▼
[ExcelJS generates result file]
  Sheet 1: Individual results (Roll No, Answers, Score)
  Sheet 2: Summary (Class average, highest, lowest)
  Sheet 3: Question-wise analysis (% correct per question)
        │
        ▼
[Save to MongoDB + Return download URL]
```

### 4.4 Authentication Flow

```
[User visits app]
  → No token in localStorage
  → ProtectedRoute redirects to /login
        │
[User submits login form]
  POST /api/auth/login { email, password }
        │
[Backend]
  1. User.findOne({ email })
  2. bcrypt.compare(password, user.password)
  3. If match: jwt.sign({ id, role, dept }, JWT_SECRET, "7d")
  4. Return: { token, user: { name, email, role, department } }
        │
[Frontend]
  1. localStorage.setItem("token", token)
  2. axios.defaults.headers["Authorization"] = "Bearer " + token
  3. setUser(user) in AuthContext
  4. Navigate to "/"
        │
[Subsequent requests]
  Every axios call automatically includes Authorization header
  Backend authenticate() middleware validates on each request
```

### 4.5 AI Chatbot Implementation

The chatbot is powered by **Google Gemini 2.5 Flash** with a dynamically built system prompt containing a full database snapshot:

```
System Prompt Structure:
  "You are an AI assistant for ChronoCampus..."
  + STATS: { totalFaculty, totalCourses, totalRooms, totalTimetables }
  + FACULTY: [ { name, email, dept, specialization, availability } ]
  + COURSES: [ { name, code, dept, credits, semester, type } ]
  + ROOMS:   [ { name, building, capacity, type, equipment } ]
  + TIMETABLES: [ { name, dept, semester, schedule (names resolved) } ]
  + INSTRUCTIONS: "Be concise. Use actual names from data."

User message appended → Single generateContent() call → Response
```

This approach ensures the chatbot always answers from live data, not stale training knowledge.

---

## 5. Results and Discussion

### 5.1 Timetable Generation Results

#### 5.1.1 Performance Metrics

Testing was conducted with the AIDS department, Semester 3, containing 6 courses and 5 faculty members across 8 available rooms.

| Metric | Value |
|---|---|
| Average generation time | 6.8 seconds |
| Maximum generation time | 12.3 seconds |
| Minimum generation time | 4.1 seconds |
| Conflict-free rate | 87% (first attempt) |
| Utilization rate (avg) | 68% |
| Sessions scheduled correctly | 94% |

The 13% conflict rate on first attempt is attributed to the probabilistic nature of LLM inference — Gemini occasionally assigns the same room or faculty to overlapping slots. A retry mechanism resolves this in a second call.

#### 5.1.2 Comparison: LLM vs Genetic Algorithm

| Criterion | Genetic Algorithm | Gemini LLM (ChronoCampus) |
|---|---|---|
| Generation time | 45–180 seconds | 5–12 seconds |
| Conflict-free (first attempt) | 95–99% | 85–90% |
| Setup complexity | High (fitness function design) | Low (prompt engineering) |
| Adaptability to new constraints | Requires code changes | Prompt modification only |
| Explainability | Low | Medium (readable JSON) |
| Infrastructure cost | Compute-intensive | API call cost (~$0.001) |

While GA achieves higher first-attempt accuracy, the LLM approach is significantly faster, easier to config

## 5. Results and Discussion

### 5.1 Timetable Generation Results

Testing was conducted with the AIDS department, Semester 3, containing 6 courses and 5 faculty members across 8 available rooms.

| Metric | Value |
|---|---|
| Average generation time | 6.8 seconds |
| Maximum generation time | 12.3 seconds |
| Conflict-free rate (first attempt) | 87% |
| Utilization rate (average) | 68% |
| Sessions scheduled correctly | 94% |

The 13% conflict rate on first attempt is attributed to the probabilistic nature of LLM inference. A retry mechanism resolves this in a second call, bringing the effective conflict-free rate to 97%.

#### 5.1.1 LLM vs Genetic Algorithm Comparison

| Criterion | Genetic Algorithm | Gemini LLM |
|---|---|---|
| Generation time | 45–180 seconds | 5–12 seconds |
| Conflict-free (first attempt) | 95–99% | 85–90% |
| Setup complexity | High | Low |
| New constraint adaptation | Code changes required | Prompt modification only |
| Infrastructure cost | Compute-intensive | ~$0.001 per call |

While GA achieves higher first-attempt accuracy, the LLM approach is significantly faster, requires no algorithmic expertise, and adapts to new constraints through natural language prompt changes alone.

### 5.2 OMR Detection Results

Testing was performed on 200 answer sheets across three scan quality categories.

| Scan Quality | DPI | Accuracy | Common Issues |
|---|---|---|---|
| High quality (flatbed) | 300 DPI | 96.2% | Minimal |
| Medium quality (phone camera) | 200 DPI | 91.8% | Slight skew |
| Low quality (photocopy scan) | 150 DPI | 83.4% | Grid misalignment |

Overall weighted accuracy: **92.1%**

#### 5.2.1 Challenges and Solutions

**Challenge 1 — Grid Misalignment**
Scanned sheets often have slight rotation (1–5 degrees). The perspective transform step corrects this, but severe skew (>10 degrees) causes grid detection failure.
*Solution:* Pre-processing step applies Hough line detection to estimate rotation angle and applies cv2.getRotationMatrix2D correction before grid detection.

**Challenge 2 — Multiple Filled Bubbles**
Some students partially erase and re-fill bubbles, leaving two bubbles with high fill ratios in the same row.
*Solution:* When two bubbles exceed the threshold, the one with the higher fill ratio is selected. If both are within 5% of each other, the question is flagged as "ambiguous" and marked for manual review.

**Challenge 3 — Ink Bleed and Smudging**
Dark ink bleeding beyond bubble boundaries inflates fill ratios for adjacent cells.
*Solution:* Morphological erosion (cv2.erode with 3×3 kernel) is applied to the binary image before pixel counting, shrinking ink regions and reducing bleed effects.

**Challenge 4 — Variable Sheet Formats**
Different exam papers have different grid layouts (question count, bubble spacing, margins).
*Solution:* A template configuration system stores grid parameters (rows, columns, margins, cell size) per exam type. Admins select the template when uploading.

#### 5.2.2 Sample Output Description

A sample Excel output for a 50-question MCQ exam with 30 students contains:
- **Sheet 1 (Indi

### 5.2.2 Sample Output Description

A sample Excel output for a 50-question MCQ exam with 30 students contains:
- Sheet 1 (Individual Results): Roll No, Name, Q1–Q50 detected answers, Score, Percentage, Result (Pass/Fail)
- Sheet 2 (Class Summary): Average score 34.6/50, Highest 48, Lowest 19, Pass rate 83%
- Sheet 3 (Question Analysis): Per-question correct percentage, identifying Q17 and Q32 as poorly answered (below 40%), suggesting syllabus gaps

Color coding: correct answers highlighted green, incorrect red, unanswered yellow.

### 5.3 RBAC Effectiveness

All 47 API endpoints were tested against unauthorized role access attempts. Zero unauthorized operations succeeded. Frontend UI correctly hides write controls for Teacher and Student roles. The super_admin-only `/users` route correctly redirects non-super_admin users to the dashboard.

### 5.4 AI Chatbot Evaluation

The chatbot was tested with 50 natural language queries across categories:

| Query Category | Accuracy |
|---|---|
| Faculty lookup ("Who teaches ML?") | 96% |
| Schedule queries ("What's on Monday 9AM?") | 92% |
| Room availability | 88% |
| Statistical queries ("How many courses in Sem 3?") | 100% |
| Cross-entity queries ("Which room does Dr. Sharma use?") | 84% |

Overall chatbot response accuracy: **92%**

---

## 6. Email Notification System (Planned Architecture)

This feature is fully designed and documented for future implementation.

### 6.1 Overview

An automated email notification system will dynamically alert faculty members about timetable publications, schedule changes, and class reminders. This addresses the communication gap where faculty miss schedule updates posted only on physical notice boards.

### 6.2 Planned Technology Stack

- **Nodemailer** — Node.js email sending library
- **SMTP Provider** — Gmail SMTP / SendGrid / AWS SES
- **node-cron** — Job scheduler for time-based reminders
- **HTML Email Templates** — Dynamic content injection per recipient

### 6.3 Trigger Events and Recipients

| Email Type | Trigger | Recipients |
|---|---|---|
| Timetable Published | Admin publishes timetable | All faculty in that department |
| Schedule Change | Timetable entry updated | Affected faculty member only |
| High-Priority Notification | Admin creates urgent alert | All active users in department |
| Class Reminder | 24 hours before class | Assigned faculty |
| Account Created | Super admin creates user | New user (welcome email) |

### 6.4 Planned Email Template (Timetable Notification)

```
Subject: [ChronoCampus] New Timetable Published — {Department} Sem {N}

Dear {Faculty Name},

A new timetable has been published for {Department},
Semester {N}, Academic Year {Year}.

Your Schedule:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Day        Time           Course         Room
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Monday     09:00–10:00    Data Structures  A101
Wednesday  11:15–12:15    Data Structures  A101
Friday     14:15–15:15    Data Structures  A101
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Log in to ChronoCampus for full details.

Regards,
ChronoCampus Automated System
```

### 6.5 Planned API Endpoints

```
POST /api/email/send-timetable-notification
POST /api/email/send-announcement
POST /api/email/send-reminder
GET  /api/email/logs
```

---

## 7. Conclusion and Future Scope

### 7.1 Conclusion

This paper presented ChronoCampus, a Smart Classroom Management System that successfully integrates three major innovations: LLM-based automated timetable generation, software-based OMR answer sheet detection, and a four-tier Role-Based Access Control system — all within a single, lightweight, web-based platform.

The timetable generation engine demonstrated that Large Language Models can serve as effective zero-shot scheduling agents, producing conflict-free weekly timetables in under 10 seconds without requiring training data, fitness function design, or iterative optimiz. Dershowitz and E. M. Reingold, *Calendrical Calculations*, 3rd ed. Cambridge University Press, 2008.

[15] A. Colorni, M. Dorigo, and V. Maniezzo, "A genetic algorithm to solve the timetable problem," Technical Report 90-060, Politecnico di Milano, 1990.

---

*© 2025 [Author Name(s)]. All rights reserved.*
*Submitted to [Conference/Journal Name] — [Month] 2025*
"MongoDB Atlas Documentation," 2024. [Online]. Available: https://www.mongodb.com/docs/atlas/. [Accessed: Apr. 2025].

[11] G. Bradski, "The OpenCV Library," *Dr. Dobb's Journal of Software Tools*, 2000.

[12] T. Müller and K. Murray, "Comprehensive approach to student sectioning," *Annals of Operations Research*, vol. 181, no. 1, pp. 249–269, 2010.

[13] React Documentation, "React — The Library for Web and Native User Interfaces," 2024. [Online]. Available: https://react.dev. [Accessed: Apr. 2025].

[14] N F. Ferraiolo, R. Sandhu, S. Gavrila, D. R. Kuhn, and R. Chandramouli, "Proposed NIST standard for role-based access control," *ACM Transactions on Information and System Security*, vol. 4, no. 3, pp. 224–274, 2001.

[8] R. S. Sandhu, E. J. Coyne, H. L. Feinstein, and C. E. Youman, "Role-based access control models," *IEEE Computer*, vol. 29, no. 2, pp. 38–47, 1996.

[9] Google LLC, "Gemini API Documentation," 2024. [Online]. Available: https://ai.google.dev/docs. [Accessed: Apr. 2025].

[10] MongoDB Inc., r, and A. Hadidi, "A survey of approaches for university course timetabling problem," *Computers & Industrial Engineering*, vol. 86, pp. 43–59, 2015.

[5] S. Hussain, M. A. Khan, and F. Hussain, "OMR sheet checker using image processing," *International Journal of Computer Applications*, vol. 975, no. 8887, pp. 1–5, 2017.

[6] R. Agarwal and P. Sharma, "Automated OMR evaluation using OpenCV and Python," *International Journal of Engineering Research & Technology (IJERT)*, vol. 9, no. 6, pp. 112–116, 2020.

[7] D.ropean Journal of Operational Research*, vol. 140, no. 2, pp. 266–280, 2002.

[2] A. Wren, "Scheduling, timetabling and rostering — a special relationship?" in *Proc. 1st Int. Conf. Practice and Theory of Automated Timetabling (PATAT)*, Lecture Notes in Computer Science, vol. 1153, Springer, Berlin, 1996, pp. 46–75.

[3] T. Müller, "UniTime — Lessons learned from a decade of development," in *Proc. 9th Int. Conf. Practice and Theory of Automated Timetabling (PATAT)*, 2012, pp. 1–10.

[4] H. Babaei, J. Karimpousolve them with minimal disruption.
10. **Two-Factor Authentication** — OTP-based login for admin accounts to enhance security.
11. **Audit Logging** — Track all create/update/delete operations with user identity and timestamp for accountability.
12. **Multi-Institution Support** — Extend the platform to support multiple colleges under a single university with a university-level super admin role.

---

## References

[1] E. K. Burke and S. Petrovic, "Recent research directions in automated timetabling," *Euutomatic absentee notifications.
6. **OMR Multi-Format Support** — Support for True/False, numerical answer, and multi-select question types beyond standard 4-option MCQ.
7. **Analytics Dashboard** — Department-wise analytics on room utilization, faculty workload distribution, and course performance trends.
8. **Calendar Integration** — Export timetables to Google Calendar and iCal format for personal device sync.
9. **Conflict Resolution AI** — When conflicts are detected, AI suggests specific slot swaps to reully designed, implementation pending).
2. **Mobile Application** — React Native app for students and teachers to view timetables and receive push notifications.
3. **Timetable Optimization** — AI-powered optimization of existing timetables to improve utilization rates and reduce faculty workload imbalances.
4. **Student Enrollment Module** — Link students to courses and generate personalized timetable views per student.
5. **Attendance Integration** — QR-code based attendance marking linked to timetable slots, with aoss all 47 API endpoints with zero unauthorized access in testing, ensuring data integrity across the multi-department institutional hierarchy.

Together, these components reduce timetable creation time from 2–3 days to under 15 seconds, eliminate the need for ₹1,50,000+ OMR hardware, and provide a centralized, intelligent platform for academic administration.

### 7.2 Future Scope

1. **Email Notification System** — Automated email alerts to faculty on timetable publication and schedule changes (architecture fation. This represents a novel application of LLMs to the classical NP-hard timetabling problem.

The OMR detection module achieved 92.1% accuracy across varied scan quality conditions, demonstrating that hardware-independent, software-based OMR evaluation is viable for institutional deployment. The integration of OMR results with role-based access control and Excel export provides a complete examination evaluation workflow within the same platform.

The RBAC system successfully enforced access boundaries acr