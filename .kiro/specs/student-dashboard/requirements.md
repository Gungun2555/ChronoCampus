# Requirements Document

## Introduction

ChronoCampus currently routes both teacher and student users to the same `TeacherDashboard` component after login, exposing teacher-specific UI elements (course management, faculty, rooms, notifications, draft timetables, and generation controls) to students. This feature introduces a dedicated Student Dashboard that shows only published timetables and provides no access to administrative or teacher-only functionality.

## Glossary

- **Student**: A user whose `role` field equals `"student"` in the authentication context.
- **Teacher**: A user whose `role` field equals `"teacher"` in the authentication context.
- **StudentDashboard**: The new React page component rendered exclusively for users with the `student` role.
- **Published_Timetable**: A `Timetable` document whose `status` field equals `"published"`.
- **Router**: The React Router instance in `App.jsx` responsible for mapping URL paths to page components.
- **AuthContext**: The React context in `frontend/src/context/AuthContext.jsx` that exposes the authenticated user object and role-helper functions.
- **Layout**: The sidebar/layout component in `frontend/src/components/Layout.jsx`.
- **Timetables_API**: The Express endpoint at `GET /api/timetables` served by `backend/routes/timetableRoute.js`.
- **Student_Nav**: The sidebar navigation set containing only "Dashboard" and "My Timetables" items, rendered for students.

---

## Requirements

### Requirement 1: Role-Based Routing

**User Story:** As a student, I want to be redirected to a student-specific dashboard after login, so that I do not see teacher or admin UI elements.

#### Acceptance Criteria

1. WHEN a user with `role === "student"` navigates to the root path `/`, THE Router SHALL redirect the user to `/student` instead of `/teacher`.
2. WHEN a user with `role === "teacher"` navigates to the root path `/`, THE Router SHALL redirect the user to `/teacher` as before.
3. THE Router SHALL protect the `/student` route so that only users with `role === "student"` can access it; any other role SHALL be redirected to their appropriate home path.
4. IF an unauthenticated user navigates to `/student`, THEN THE Router SHALL redirect the user to `/login`.

---

### Requirement 2: Student Dashboard Page

**User Story:** As a student, I want a dedicated dashboard page, so that I can view my published timetables without distraction from teacher controls.

#### Acceptance Criteria

1. THE StudentDashboard SHALL render a welcome header displaying the authenticated student's name and the label "Student".
2. THE StudentDashboard SHALL display a summary count of the student's available Published_Timetables.
3. THE StudentDashboard SHALL NOT render any timetable generation button, edit controls, or links to `/courses`, `/faculty`, `/rooms`, or `/notifications`.
4. THE StudentDashboard SHALL use the existing `Layout` component configured with Student_Nav.
5. WHEN the StudentDashboard is loading data, THE StudentDashboard SHALL display skeleton placeholder elements in place of timetable cards.

---

### Requirement 3: Published Timetable Filtering

**User Story:** As a student, I want to see only published timetables, so that I am not exposed to draft or failed timetable data.

#### Acceptance Criteria

1. WHEN THE StudentDashboard fetches timetables, THE Timetables_API SHALL accept a `status=published` query parameter and return only documents where `status === "published"`.
2. THE StudentDashboard SHALL request timetables using the query `GET /api/timetables?status=published`.
3. IF the Timetables_API receives a request with `status=published`, THEN THE Timetables_API SHALL exclude all timetable documents where `status` is `"draft"` or `"archived"`.
4. THE StudentDashboard SHALL NOT display any timetable whose `status` is not `"published"`, even if the API returns mixed results.

---

### Requirement 4: Student Sidebar Navigation

**User Story:** As a student, I want a simplified sidebar, so that I only see navigation items relevant to my role.

#### Acceptance Criteria

1. WHEN the Layout renders for a student user, THE Layout SHALL display only the "Dashboard" (path `/student`) and "My Timetables" (path `/timetables`) navigation items.
2. THE Layout SHALL NOT display "Courses", "Faculty", "Rooms", "Notifications", or "Users" navigation items for student users.
3. WHEN the Layout renders for a student user, THE Layout SHALL display the role badge as "student" in the sidebar user info section.

---

### Requirement 5: Access Restriction

**User Story:** As a system administrator, I want student users to be blocked from teacher and admin routes, so that internal data and controls remain protected.

#### Acceptance Criteria

1. WHEN a student user navigates to `/courses`, `/faculty`, `/rooms`, or `/notifications`, THE Router SHALL redirect the student to `/student`.
2. WHEN a student user navigates to `/teacher`, THE Router SHALL redirect the student to `/student`.
3. THE Timetables_API SHALL continue to reject `POST /api/timetables`, `PUT /api/timetables/:id`, and `DELETE /api/timetables/:id` requests from users with `role === "student"` with HTTP 403.

---

### Requirement 6: Timetable Filtering UI

**User Story:** As a student, I want to filter timetables by semester and department, so that I can quickly find the schedule relevant to me.

#### Acceptance Criteria

1. THE StudentDashboard SHALL render a semester filter control that, when a value is selected, restricts the displayed timetable list to entries matching that semester value.
2. THE StudentDashboard SHALL render a department filter control that, when a value is selected, restricts the displayed timetable list to entries matching that department value.
3. WHEN both filters are active, THE StudentDashboard SHALL display only timetables matching both the selected semester AND the selected department.
4. WHEN a filter is cleared, THE StudentDashboard SHALL restore the full list of Published_Timetables.

---

### Requirement 7: Timetable View

**User Story:** As a student, I want to preview a timetable's schedule, so that I can read my class times without navigating away.

#### Acceptance Criteria

1. WHEN a student clicks the view button on a timetable card, THE StudentDashboard SHALL display the full schedule entries for that timetable (day, start time, end time, course, faculty, room).
2. THE StudentDashboard SHALL provide a mechanism to close or dismiss the timetable view and return to the timetable list.
3. THE StudentDashboard SHALL NOT provide edit, delete, or generate controls within the timetable view.
