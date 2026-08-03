<?php

namespace App\Http\Controllers;

use App\Services\ReportExportService;
use App\Services\SubjectService;
use App\Services\TeacherService;
use Illuminate\Http\Request;

class ReportExportController extends Controller
{
    public function __construct(
        protected ReportExportService $reportExportService,
        protected SubjectService $subjectService,
        protected TeacherService $teacherService
    ) {}

    public function export(Request $request, string $subjectId)
    {
        $subject = $this->subjectService->getSubjectById($subjectId);

        if (! $subject) {
            abort(404, 'Mata pelajaran tidak ditemukan.');
        }

        $user = auth()->user();
        if ($user->role === 'guru') {
            $teacher = $this->teacherService->getTeacherByUserId($user->id);
            if ($subject->teacher_id !== ($teacher->id ?? null)) {
                abort(403, 'Anda tidak memiliki hak akses untuk mengunduh laporan mata pelajaran ini.');
            }
        }

        $options = [
            'include_materials' => $request->boolean('include_materials', true),
            'include_exams' => $request->boolean('include_exams', true),
            'include_assignments' => $request->boolean('include_assignments', true),
            'format' => $request->query('format', 'excel'),
        ];

        return $this->reportExportService->exportSubjectReport($subjectId, $options);
    }
}
