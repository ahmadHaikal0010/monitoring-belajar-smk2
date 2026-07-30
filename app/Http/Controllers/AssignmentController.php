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
        if (auth()->user()->role !== 'guru') {
            abort(403, 'Manajemen Tugas hanya dapat diakses oleh Guru.');
        }

        $filters = request()->only(['search', 'subject_id', 'status', 'sort', 'direction']);
        $teacher = $this->teacherService->getTeacherByUserId(auth()->id());
        $filters['teacher_id'] = $teacher?->id;

        $assignments = $this->assignmentService->getAssignmentList($filters, 12);
        $subjects = $this->subjectService->getSubjectList(['teacher_id' => $teacher?->id], 100);

        return Inertia::render('Assignments/index', [
            'assignments' => $assignments,
            'subjects' => $subjects->items(),
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        if (auth()->user()->role !== 'guru') {
            abort(403, 'Manajemen Tugas hanya dapat diakses oleh Guru.');
        }

        Gate::authorize('create', Assignment::class);

        $teacher = $this->teacherService->getTeacherByUserId(auth()->id());
        $subjects = $this->subjectService->getSubjectList(['teacher_id' => $teacher?->id], 100)->items();

        return Inertia::render('Assignments/create', [
            'subjects' => $subjects,
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

        return redirect()->route('teacher.assignments.index')
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

        return Inertia::render('Assignments/edit', [
            'assignment' => $assignmentData,
            'subjects' => $subjects,
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

        return redirect()->route('teacher.assignments.index')
            ->with('success', 'Tugas berhasil diperbarui.');
    }

    public function destroy(Assignment $assignment)
    {
        if (auth()->user()->role !== 'guru') {
            abort(403, 'Manajemen Tugas hanya dapat diakses oleh Guru.');
        }

        Gate::authorize('delete', $assignment);

        $this->assignmentService->deleteAssignment($assignment->id);

        return redirect()->route('teacher.assignments.index')
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
