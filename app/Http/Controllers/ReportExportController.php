<?php

namespace App\Http\Controllers;

use App\Services\ReportExportService;
use App\Services\SubjectService;
use App\Services\TeacherService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportExportController extends Controller
{
    public function __construct(
        protected ReportExportService $reportExportService,
        protected SubjectService $subjectService,
        protected TeacherService $teacherService
    ) {}

    public function getExportOptions(string $subjectId)
    {
        $subject = $this->subjectService->getSubjectById($subjectId);

        if (! $subject) {
            return response()->json(['message' => 'Mata pelajaran tidak ditemukan.'], 404);
        }

        $user = auth()->user();
        if ($user->role === 'guru') {
            $teacher = $this->teacherService->getTeacherByUserId($user->id);
            if ($subject->teacher_id !== ($teacher->id ?? null)) {
                return response()->json(['message' => 'Anda tidak memiliki hak akses untuk mengunduh laporan mata pelajaran ini.'], 403);
            }
        }

        $materials = DB::table('materi')
            ->where('id_mata_pelajaran', $subjectId)
            ->select(['id', 'judul as title', 'tipe_konten as content_type'])
            ->orderBy('created_at', 'asc')
            ->get();

        $exams = DB::table('ujian')
            ->where('id_mata_pelajaran', $subjectId)
            ->where('status', 'published')
            ->select(['id', 'judul as title', 'nilai_kkm as pass_score', 'durasi as duration'])
            ->orderBy('created_at', 'asc')
            ->get();

        $assignments = DB::table('tugas')
            ->where('id_mata_pelajaran', $subjectId)
            ->where('status', 'published')
            ->select(['id', 'judul as title', 'skor_maksimal as max_score', 'tenggat_waktu as due_date'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'subject' => [
                'id' => $subject->id,
                'title' => $subject->title,
                'code' => $subject->code,
            ],
            'materials' => $materials,
            'exams' => $exams,
            'assignments' => $assignments,
        ]);
    }

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

        $parseIds = function ($input) {
            if (is_array($input)) {
                return array_values(array_filter($input));
            }
            if (is_string($input) && strlen(trim($input)) > 0) {
                return array_values(array_filter(explode(',', $input)));
            }

            return null;
        };

        $options = [
            'include_materials' => $request->boolean('include_materials', true),
            'include_exams' => $request->boolean('include_exams', true),
            'include_assignments' => $request->boolean('include_assignments', true),
            'material_ids' => $parseIds($request->input('material_ids')),
            'exam_ids' => $parseIds($request->input('exam_ids')),
            'assignment_ids' => $parseIds($request->input('assignment_ids')),
            'format' => $request->query('format', 'excel'),
        ];

        return $this->reportExportService->exportSubjectReport($subjectId, $options);
    }
}
