# Implementation Plan: Student Dashboard

## Overview

Implement a dedicated student dashboard by: (1) adding a `?status` query filter to the timetables API, (2) creating the `StudentDashboard` React page, (3) updating routing and the sidebar layout, and (4) adding access restrictions for student users on restricted routes.

## Tasks

- [x] 1. Add `?status` query filter to the timetables API
  - In `backend/routes/timetableRoute.js`, update the `GET /` handler to read `req.query.status` and pass it as a Mongoose filter: `const filter = {}; if (req.query.status) filter.status = req.query.status;`
  - This is backward-compatible — callers that omit the param continue to receive all timetables
  - _Requirements: 3.1, 3.3_

  - [ ]* 1.1 Write property test for published-only API filter
    - **Property 1: Published-only API filter**
    - Generate arrays of timetable objects with random `status` values, run them through the filter logic, assert every result item has `status === "published"`
    - **Validates: Requirements 3.1, 3.3**

- [x] 2. Add `studentNavItems` and student nav rendering to `Layout`
  - In `frontend/src/components/Layout.jsx`, define `studentNavItems` containing only `{ id: "dashboard", path: "/student" }` and `{ id: "timetables", path: "/timetables" }`
  - Update the `navItems` selection logic: when `isStudent()` is true, use `studentNavItems`
  - _Requirements: 4.1, 4.2_

  - [ ]* 2.1 Write property test for student nav completeness
    - **Property 5: Student nav completeness**
    - Render `Layout` with `isStudent() = true` and assert the rendered nav item IDs equal exactly `["dashboard", "timetables"]`
    - **Validates: Requirements 4.1, 4.2**

- [x] 3. Create `StudentDashboard` page component
  - Create `frontend/src/pages/StudentDashboard.jsx`
  - On mount, fetch `GET /api/timetables?status=published` and store results in `timetables` state
  - Apply a client-side guard: filter out any item where `status !== "published"` before setting state
  - Render: welcome header with `user.name` and "Student" label; a published timetable count badge; a list of timetable cards (name, department, semester, year, view button); skeleton placeholders while loading; empty state when list is empty
  - Do NOT include generate, edit, delete buttons, or links to `/courses`, `/faculty`, `/rooms`, `/notifications`
  - Use the `Layout` component (which will now render `studentNavItems` for students)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.4_

  - [ ]* 3.1 Write property test for no non-published timetables rendered
    - **Property 4: No non-published timetables rendered**
    - Generate arbitrary mixed-status arrays, pass through the client-side published guard, assert no item with `status !== "published"` survives
    - **Validates: Requirements 3.4**

  - [ ]* 3.2 Write example test: StudentDashboard renders correct header
    - Render with a mocked student user and assert header contains the user's name and the text "Student"
    - **Validates: Requirements 2.1**

  - [ ]* 3.3 Write example test: loading skeleton is shown
    - Render with loading state active and assert skeleton placeholder elements are present
    - **Validates: Requirements 2.5**

- [x] 4. Add semester and department filter controls to `StudentDashboard`
  - Add `semesterFilter` and `departmentFilter` state (both default `""`)
  - Derive unique semester and department values from the fetched timetables list for the filter dropdowns
  - Compute `filtered` as the subset of `timetables` matching both active filter values (empty string = no filter)
  - Render two `<select>` or shadcn `Select` controls for semester and department above the timetable list
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 4.1 Write property test for client-side filter correctness
    - **Property 2: Client-side filter correctness**
    - Generate arbitrary arrays of published timetables with random `semester`/`department` strings and random filter values; assert filtered result equals the manually computed intersection
    - **Validates: Requirements 6.1, 6.2, 6.3**

  - [ ]* 4.2 Write property test for filter clear restores full list
    - **Property 3: Filter clear restores full list**
    - Generate arbitrary published timetable list and filter values; apply filters then clear; assert `filtered.length === timetables.length`
    - **Validates: Requirements 6.4**

- [x] 5. Add timetable view modal to `StudentDashboard`
  - Add `selectedTimetable` state (default `null`)
  - When the view button on a timetable card is clicked, set `selectedTimetable` to that timetable
  - Render a modal/sheet (shadcn `Dialog` or `Sheet`) that displays all `schedule` entries (day, startTime, endTime, courseId, facultyId, roomId) when `selectedTimetable` is not null
  - Include a close button that sets `selectedTimetable` back to `null`
  - Do NOT include edit, delete, or generate controls inside the modal
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 6. Update routing in `App.jsx`
  - Import `StudentDashboard` from `./pages/StudentDashboard`
  - Update `RoleHome`: when `user?.role === "student"`, return `<Navigate to="/student" replace />` instead of `<Navigate to="/teacher" replace />`
  - Add a new protected route: `<Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />`
  - Update the `/teacher` route's `allowedRoles` to `["teacher"]` only (remove `"student"`)
  - Add redirect guards for student users on restricted routes (`/courses`, `/faculty`, `/rooms`, `/notifications`, `/teacher`) — either via `ProtectedRoute` `allowedRoles` or a dedicated student redirect wrapper
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2_

  - [ ]* 6.1 Write property test for role-based routing
    - **Property 6: Role-based routing**
    - For each role value (`student`, `teacher`, `admin`, `super_admin`), render `RoleHome` with a mocked user and assert the redirect destination matches the expected role-specific home path
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ]* 6.2 Write property test for student restricted route redirect
    - **Property 7: Student restricted route redirect**
    - For each restricted path (`/courses`, `/faculty`, `/rooms`, `/notifications`, `/teacher`), render the route with a student user and assert the user is redirected to `/student`
    - **Validates: Requirements 5.1, 5.2**

- [ ] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Verify API write-operation rejection for students
  - Confirm the existing `authorize("super_admin", "admin")` middleware on `POST /api/timetables`, `PUT /api/timetables/:id`, and `DELETE /api/timetables/:id` already returns HTTP 403 for student tokens
  - If not, add `authorize("super_admin", "admin")` to any unprotected write routes
  - _Requirements: 5.3_

  - [ ]* 8.1 Write property test for API rejects student write operations
    - **Property 8: API rejects student write operations**
    - For each write method (POST, PUT, DELETE) on `/api/timetables`, send a request with a student JWT and assert the response status is 403
    - **Validates: Requirements 5.3**

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use **fast-check** with a minimum of 100 iterations each
- Each property test references its design document property number via the tag format: `Feature: student-dashboard, Property N: <text>`
- The `/timetables` route remains shared — students can navigate there and will see only published timetables (the existing page may need a similar published-only filter applied, but that is out of scope for this spec)
