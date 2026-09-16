# 📚 Subject & Classroom Architecture Specifications (Teacher Workflow)

## 📌 Single Source of Truth for Subject Features (`/teacher/subjects`)
- All teacher management workflows (Materials, Assignments, Exams, and Student Progress) are centralized inside `/teacher/subjects/{id}`.
- Standalone index pages (`/teacher/materials`, `/teacher/exams`, `/teacher/assignments`) have been deprecated and refactored into the subject-centered architecture.
- **Tab Memory**: Active tab (`materials`, `assignments`, `exams`, `progress`) is persisted in `localStorage` (`active_subject_tab_{subjectId}`) and reflected in URL search params (`?tab={tab}`). When navigating back to subject details, the last selected tab is automatically restored.

## 🗂️ Sub-routes & Component Hierarchy per Classroom
- **Materials per Class**: `GET /teacher/subjects/{subject}/classrooms/{classroom}/materials` (`ClassroomMaterials.tsx`)
  - Features: Search, Content Type Filter (`all`, `video`, `document`, `url`), Sort (`created_at_desc`, `created_at_asc`, `title_asc`, `title_desc`), and Copy materials from other classrooms.
- **Assignments per Class**: `GET /teacher/subjects/{subject}/classrooms/{classroom}/assignments` (`ClassroomAssignments.tsx`)
  - Features: Search, Status/Max Score Filter, Sort, and Copy assignments from other classrooms.
- **Exams per Class**: `GET /teacher/subjects/{subject}/classrooms/{classroom}/exams` (`ClassroomExams.tsx`)
  - Features: Search, Status Filter (`all`, `published`, `draft`), Sort, Publish/Unpublish toggle, Question management, and Copy exams from other classrooms.
- **Student Progress per Class**: `GET /teacher/subjects/{subject}/classrooms/{classroom}/progress` (`ClassroomProgress.tsx`)
  - Features: Classroom cards grid with total student badge (`{cls.students_count || 0} Siswa`), instant NISN/email/name search, progress percentage bar, and classroom report export modal.

## 📊 Export Report System (`ReportExportController` & `ReportExportService`)
- **Modal Component**: `ExportReportModal.tsx` supports multi-selection of classrooms via checkboxes with master select-all toggle. Accordions default to CLOSED.
- **Download Mechanism**: Excel exports use dynamic DOM anchor links (`link.setAttribute('download', '')` + `link.click()`) to trigger direct `.xls` file downloads without page reloads or blank tabs. Print format opens printable HTML in a new tab.
- **Authorization**: Strict teacher ownership verification: `(string) $subject->teacher_user_id === (string) $user->id`.
- **Student Data Inclusivity**: Queries `anggota_kelas` with `LEFT JOIN pendaftaran` so all classroom students are included in exported reports even if `pendaftaran` rows have not been created yet.

## ⚠️ React 19 & Inertia v3 Prevention Patterns
- **Infinite Render Loop Prevention**: Use stable default prop constants (e.g. `const EMPTY_CLASSROOMS: ClassroomOption[] = []`) and state change guards (e.g. `if (prev.size === 1 && prev.has(id)) return prev;`) in `useEffect` to prevent `Maximum update depth exceeded` errors.
- **Wayfinder Route Resolution**: Import routes explicitly from `@/routes/index` or `@/routes/admin/index` to avoid Vite SSR module resolution errors.
- **Flash Banner Rendering**: Derive flash message visibility reactively using a `dismissedFlash` state instead of calling `setState` synchronously in `useEffect` (enforces ESLint `react-hooks/set-state-in-effect` compliance).
