# Assignment Feature Database Tables & Models Specifications

## 🗄️ Database Tables & Models for Assignment Feature
- **`assignments`** (`App\Models\Assignment`):
  - `id` (uuid, PK)
  - `subject_id` (foreignUuid -> `subjects`, cascade)
  - `teacher_id` (foreignUuid -> `teachers`, cascade)
  - `title` (string) — Judul tugas
  - `description` (text, nullable) — Instruksi/deskripsi tugas
  - `due_date` (timestamp, nullable) — Tenggat waktu pengumpulan
  - `max_score` (integer, default: 100) — Nilai maksimal
  - `allowed_file_types` (json, nullable) — e.g. `['image', 'pdf']`
  - `status` (enum: `draft`, `published`, `archived`, default: `published`)

- **`assignment_submissions`** (`App\Models\AssignmentSubmission`):
  - `id` (uuid, PK)
  - `assignment_id` (foreignUuid -> `assignments`, cascade)
  - `student_id` (foreignUuid -> `students`, cascade)
  - `submitted_at` (timestamp)
  - `notes` (text, nullable) — Catatan dari siswa
  - `score` (float, nullable) — Nilai dari guru
  - `feedback` (text, nullable) — Catatan/feedback penilaian dari guru
  - `status` (enum: `submitted`, `graded`, `late`, `returned`, default: `submitted`)
  - Unique constraint: `[assignment_id, student_id]`

- **`assignment_submission_files`** (`App\Models\AssignmentSubmissionFile`):
  - `id` (uuid, PK)
  - `assignment_submission_id` (foreignUuid -> `assignment_submissions`, cascade)
  - `file_path` (string) — Relative storage path
  - `file_name` (string) — Original file name
  - `file_type` (enum: `image`, `pdf`) — Supports bulk photo uploads and PDF files
  - `file_size` (integer, nullable) — Bytes
  - `mime_type` (string, nullable)

---

## 📱 Mobile REST API Endpoints for Assignments

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/subjects/{subject}/assignments` | Get published assignments & student submission status |
| `GET` | `/api/assignments/{assignment}` | Get assignment detail & submission status |
| `POST` | `/api/assignments/{assignment}/submit` | Student submit assignment (bulk photos & PDF files) |
