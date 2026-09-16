# Exam Feature System Architecture & Mobile REST API Specifications

## 🗄️ Database Tables & Models for Exam Feature
- **`exams`** (`App\Models\Exam`):
  - `id` (uuid, PK)
  - `subject_id` (foreignUuid -> `subjects`)
  - `teacher_id` (foreignUuid -> `teachers`)
  - `title` (string)
  - `description` (text, nullable)
  - `duration` (integer) — minutes
  - `pass_score` (integer, default: 75) — KKM
  - `randomize_questions` (boolean)
  - `randomize_options` (boolean)
  - `status` (enum: `draft`, `published`, `archived`)
  - `start_time` (timestamp, nullable)
  - `end_time` (timestamp, nullable)

- **`questions`** (`App\Models\Question`):
  - `id` (uuid, PK)
  - `exam_id` (foreignUuid -> `exams`, cascade)
  - `material_id` (foreignUuid -> `materials`, nullable) — material link for wrong answer recommendations
  - `question_text` (text)
  - `question_type` (enum: `multiple_choice`, `essay`)
  - `image_path` (string, nullable) — public storage relative path
  - `score` (float, default: 1.0)
  - `order` (integer)

- **`options`** (`App\Models\Option`):
  - `id` (uuid, PK)
  - `question_id` (foreignUuid -> `questions`, cascade)
  - `option_text` (text)
  - `is_correct` (boolean, default: false)
  - `order` (integer)

- **`exam_sessions`** (`App\Models\ExamSession`):
  - `id` (uuid, PK)
  - `exam_id` (foreignUuid -> `exams`, cascade)
  - `student_id` (foreignUuid -> `students`, cascade)
  - `started_at` (timestamp)
  - `submitted_at` (timestamp, nullable)
  - `total_score` (float, nullable)
  - `status` (enum: `in_progress`, `submitted`, `graded`, `timed_out`)

- **`student_answers`** (`App\Models\StudentAnswer`):
  - `id` (uuid, PK)
  - `exam_session_id` (foreignUuid -> `exam_sessions`, cascade)
  - `question_id` (foreignUuid -> `questions`, cascade)
  - `selected_option_id` (foreignUuid -> `options`, nullable)
  - `essay_answer` (text, nullable)
  - `is_correct` (boolean, nullable)
  - `score_earned` (float, default: 0.0)

---

## ⚙️ Business Rules & Implementation Architecture
1. **Real-time Answer Saving**:
   - `POST /api/exams/sessions/{session_id}/answer`: Saves student's answer per question on click next question.
   - `POST /api/exams/sessions/{session_id}/answers`: Saves array of answers (batch update).
2. **Session Resuming & Network Failures**:
   - When a student re-enters an active exam session (`status = in_progress`), `POST /api/exams/{exam_id}/start` or `GET /api/exams/sessions/{session_id}` returns `saved_answers` (object dictionary) and `saved_answers_list` (array) so the mobile app can restore selected options.
3. **Timezone & Timer Management**:
   - Time calculations use `Asia/Jakarta` (`config('app.timezone')`).
   - Server returns `duration_seconds` and `remaining_seconds` in session responses so mobile timers run accurately without local device timezone discrepancies.
   - Starting an exam is blocked if `now() < start_time` ("Belum dibuka") or `now() > end_time` ("Telah ditutup").
4. **Material Linkage for Wrong Answers**:
   - When a student finishes an exam, `GET /api/exams/sessions/{session_id}/result` returns `material_id` and `material_title` for questions answered incorrectly so students know which material to review.

---

## 📱 Mobile REST API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/subjects/{subject}/exams` | Get published exams & active student session status |
| `POST` | `/api/exams/{exam}/start` | Start or resume active exam session |
| `GET` | `/api/exams/sessions/{session}` | Get active session state, remaining seconds, and saved answers |
| `POST` | `/api/exams/sessions/{session}/answer` | Real-time single question answer save |
| `POST` | `/api/exams/sessions/{session}/answers` | Batch answers save |
| `POST` | `/api/exams/sessions/{session}/submit` | Submit exam & calculate KKM pass score |
| `GET` | `/api/exams/sessions/{session}/result` | Exam result breakdown with material recommendation for wrong answers |
| `GET` | `/api/subjects/{subject}/progress` | Subject progress (materials completion + exam results) |
