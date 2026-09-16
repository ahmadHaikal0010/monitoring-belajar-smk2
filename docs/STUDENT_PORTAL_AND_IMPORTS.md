# 🎓 Student Web Portal & Admin Management Specifications

## 📌 Web Portal for Students (`/student/*`)
- The web platform provides full web portal capabilities for students (`StudentWebController`), guarded by `auth` middleware and student role checks.
- Controller: `App\Http\Controllers\StudentWebController`
- Component Hierarchy (`resources/js/pages/Student/`):
  - **Subjects Catalog (`Student/Subjects/index.tsx`)**: `GET /student/subjects` — Browse enrolled/available subjects with search and major filtering.
  - **Subject Detail View (`Student/Subjects/show.tsx`)**: `GET /student/subjects/{subject}` — Tabbed interface for Materials, Assignments, Exams, and progress tracking overview.
  - **Materials Viewer (`Student/Materials/index.tsx`, `show.tsx`)**: `GET /student/materials/{material}` — Interactive viewer for Document, Video player, and External URL content with real-time "Tandai Selesai" status updates.
  - **Assignments Submission (`Student/Assignments/index.tsx`, `show.tsx`)**: `GET /student/assignments/{assignment}` — Detailed assignment instruction view with bulk photo upload, PDF file attachment, student notes input, and submission status.
  - **Exams Session & Result (`Student/Exams/*`)**:
    - `GET /student/exams/{exam}` (`show.tsx`): Exam summary & start button.
    - `POST /student/exams/{exam}/start`: Start or resume exam session (`status = in_progress`).
    - `GET /student/exams/sessions/{session}` (`session.tsx`): Real-time exam session with `Asia/Jakarta` server timer countdown, answer auto-save, essay input, and question bookmarking/flagging.
    - `POST /student/exams/sessions/{session}/answer` & `/answers`: Auto-save question answers.
    - `POST /student/exams/sessions/{session}/submit`: Exam submission and automatic score calculation against KKM pass score.
    - `GET /student/exams/sessions/{session}/result` (`result.tsx`): Comprehensive result breakdown including overall score, KKM pass status, detailed question analysis, and material recommendation links for wrong answers.
  - **Profile Management (`Student/Profile/edit.tsx`)**: `GET /student/profile` & `PUT /student/profile` — Form for students to edit personal information and upload profile picture/avatar.

---

## 🏫 Major & Classroom (Rombel) Management System Specifications

### 🗄️ Database Tables & Models
- **`majors`** (`App\Models\Major`):
  - `id` (uuid, PK)
  - `code` (string, unique) — e.g. `RPL`, `TKJ`
  - `name` (string) — e.g. `Rekayasa Perangkat Lunak`
  - `description` (text, nullable)

- **`classrooms`** (`App\Models\Classroom`):
  - `id` (uuid, PK)
  - `name` (string) — e.g. `X RPL 1`
  - `major_id` (foreignUuid -> `majors`, cascade)
  - `grade_level` (enum: `X`, `XI`, `XII`)
  - `homeroom_teacher_id` (foreignUuid -> `teachers`, nullable)

- **`class_enrollments`** (`App\Models\ClassEnrollment`):
  - `id` (uuid, PK)
  - `classroom_id` (foreignUuid -> `classrooms`, cascade)
  - `student_id` (foreignUuid -> `students`, cascade)
  - `academic_year` (string) — e.g. `2025/2026`
  - `status` (enum: `active`, `transferred`, `graduated`, default: `active`)

### 📱 Admin Management Workflows (`/admin/*`)
- **Majors Management**: `GET /admin/majors` (`Admin/Majors/index.tsx`) — CRUD operations for school majors (`Admin/MajorController`, `MajorService`, `SqlMajorRepository`).
- **Classrooms Management**: `GET /admin/classrooms` (`Admin/Classrooms/*`) — CRUD operations for rombel (`Admin/ClassroomController`, `ClassroomService`, `SqlClassroomRepository`).
- **Class Enrollment / Student Assignment**: `GET /admin/classrooms/{classroom}/students` (`Admin/Classrooms/students.tsx`) — Bulk assign/remove students to classrooms (`Admin/ClassEnrollmentController`, `ClassEnrollmentService`, `SqlClassEnrollmentRepository`).

---

## 📥 Teacher Mass Import Specifications

- **Route**: `POST /admin/teachers/import` & `GET /admin/teachers/import-template`
- **Controller**: `TeacherImportController` / `Admin/TeacherController`
- **Functionality**:
  - Provides a downloadable CSV template with standard fields (`nip`, `name`, `email`, `phone`, `specialization`).
  - Batch validates NIP (18-digit unique), email format, and missing fields.
  - Automatically creates User records (with default password & teacher role) and linked Teacher profile models.
