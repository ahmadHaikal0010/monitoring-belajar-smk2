<?php

namespace App\Http\Controllers;

use App\Http\Requests\Assignment\GradeSubmissionRequest;
use App\Http\Requests\Assignment\StoreAssignmentRequest;
use App\Http\Requests\Assignment\UpdateAssignmentRequest;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Services\AssignmentService;
use App\Services\SubjectService;
use App\Services\TeacherService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    public function __construct(
        protected AssignmentService $assignmentService,
        protected SubjectService $subjectService,
        protected TeacherService $teacherService
    ) {}

    public function index()
    {
        return redirect()->route('teacher.subjects.index');
    }

    public function create()
    {
        if (auth()->user()->role !== 'guru') {
            abort(403, 'Manajemen Tugas hanya dapat diakses oleh Guru.');
        }

        Gate::authorize('create', Assignment::class);

        $teacher = $this->teacherService->getTeacherByUserId(auth()->id());
        $subjects = $this->subjectService->getSubjectList(['teacher_id' => $teacher?->id], 100)->items();

        $subjectId = request('subject_id');
        $classroomId = request('classroom_id');

        $classrooms = [];
        if ($subjectId) {
            $classrooms = DB::table('kelas_mata_pelajaran')
                ->join('kelas', 'kelas_mata_pelajaran.id_kelas', '=', 'kelas.id')
                ->where('kelas_mata_pelajaran.id_mata_pelajaran', $subjectId)
                ->select(['kelas.id', 'kelas.nama_kelas as name'])
                ->get();
        }

        return Inertia::render('Assignments/create', [
            'subjects' => $subjects,
            'subjectId' => $subjectId,
            'classroomId' => $classroomId,
            'classrooms' => $classrooms,
        ]);
    }

    public function store(StoreAssignmentRequest $request)
    {
        if (auth()->user()->role !== 'guru') {
            abort(403, 'Manajemen Tugas hanya dapat diakses oleh Guru.');
        }

        $data = $request->validated();
        $teacher = $this->teacherService->getTeacherByUserId(auth()->id());

        if (! $teacher) {
            return redirect()->back()->with('error', 'Profil pengajar Anda tidak ditemukan.');
        }

        $data['teacher_id'] = $teacher->id;
        $this->assignmentService->createAssignment($data);

        if (! empty($data['classroom_id'])) {
            return redirect()->route('teacher.subjects.classrooms.assignments', [$data['subject_id'], $data['classroom_id']])
                ->with('success', 'Tugas baru berhasil dibuat.');
        }

        return redirect()->route('teacher.subjects.show', $data['subject_id'])
            ->with('success', 'Tugas baru berhasil dibuat.');
    }

    public function show(Assignment $assignment)
    {
        if (auth()->user()->role !== 'guru') {
            abort(403, 'Manajemen Tugas hanya dapat diakses oleh Guru.');
        }

        Gate::authorize('view', $assignment);

        $assignmentData = $this->assignmentService->getAssignmentById($assignment->id);
        $submissions = $this->assignmentService->getSubmissionsForAssignment($assignment->id);

        return Inertia::render('Assignments/show', [
            'assignment' => $assignmentData,
            'submissions' => $submissions,
        ]);
    }

    public function edit(Assignment $assignment)
    {
        if (auth()->user()->role !== 'guru') {
            abort(403, 'Manajemen Tugas hanya dapat diakses oleh Guru.');
        }

        Gate::authorize('update', $assignment);

        $assignmentData = $this->assignmentService->getAssignmentById($assignment->id);
        $teacher = $this->teacherService->getTeacherByUserId(auth()->id());
        $subjects = $this->subjectService->getSubjectList(['teacher_id' => $teacher?->id], 100)->items();

        $classrooms = DB::table('kelas_mata_pelajaran')
            ->join('kelas', 'kelas_mata_pelajaran.id_kelas', '=', 'kelas.id')
            ->where('kelas_mata_pelajaran.id_mata_pelajaran', $assignment->subject_id)
            ->select(['kelas.id', 'kelas.nama_kelas as name'])
            ->get();

        return Inertia::render('Assignments/edit', [
            'assignment' => $assignmentData,
            'subjects' => $subjects,
            'classrooms' => $classrooms,
        ]);
    }

    public function update(UpdateAssignmentRequest $request, Assignment $assignment)
    {
        if (auth()->user()->role !== 'guru') {
            abort(403, 'Manajemen Tugas hanya dapat diakses oleh Guru.');
        }

        $data = $request->validated();
        $data['teacher_id'] = $assignment->teacher_id;

        $this->assignmentService->updateAssignment($assignment->id, $data);

        $classroomId = $data['classroom_id'] ?? $assignment->classroom_id;
        if (! empty($classroomId)) {
            return redirect()->route('teacher.subjects.classrooms.assignments', [$assignment->subject_id, $classroomId])
                ->with('success', 'Tugas berhasil diperbarui.');
        }

        return redirect()->route('teacher.subjects.show', $assignment->subject_id)
            ->with('success', 'Tugas berhasil diperbarui.');
    }

    public function destroy(Assignment $assignment)
    {
        if (auth()->user()->role !== 'guru') {
            abort(403, 'Manajemen Tugas hanya dapat diakses oleh Guru.');
        }

        Gate::authorize('delete', $assignment);

        $subjectId = $assignment->subject_id;
        $classroomId = $assignment->classroom_id;

        $this->assignmentService->deleteAssignment($assignment->id);

        if (! empty($classroomId)) {
            return redirect()->route('teacher.subjects.classrooms.assignments', [$subjectId, $classroomId])
                ->with('success', 'Tugas berhasil dihapus.');
        }

        return redirect()->route('teacher.subjects.show', $subjectId)
            ->with('success', 'Tugas berhasil dihapus.');
    }

    public function showSubmission(Assignment $assignment, AssignmentSubmission $submission)
    {
        if (auth()->user()->role !== 'guru') {
            abort(403, 'Manajemen Tugas hanya dapat diakses oleh Guru.');
        }

        Gate::authorize('grade', $assignment);

        $submissionData = $this->assignmentService->getSubmissionById($submission->id);

        return Inertia::render('Assignments/submission', [
            'assignment' => $assignment,
            'submission' => $submissionData,
        ]);
    }

    public function gradeSubmission(GradeSubmissionRequest $request, Assignment $assignment, AssignmentSubmission $submission)
    {
        if (auth()->user()->role !== 'guru') {
            abort(403, 'Manajemen Tugas hanya dapat diakses oleh Guru.');
        }

        $data = $request->validated();

        $this->assignmentService->gradeSubmission(
            $submission->id,
            (float) $data['score'],
            $data['feedback'] ?? null
        );

        return redirect()->route('teacher.assignments.show', $assignment->id)
            ->with('success', 'Nilai tugas siswa telah berhasil disimpan secara manual.');
    }
}
