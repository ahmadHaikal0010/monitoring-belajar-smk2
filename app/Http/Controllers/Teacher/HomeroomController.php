<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Services\ClassEnrollmentService;
use App\Services\ClassroomService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HomeroomController extends Controller
{
    public function __construct(
        protected ClassEnrollmentService $classEnrollmentService,
        protected ClassroomService $classroomService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $teacher = DB::table('guru')->where('id_pengguna', $user->id)->first();

        if (! $teacher) {
            return redirect()->route('teacher.profile')->with('error', 'Profil guru tidak ditemukan.');
        }

        $classroom = DB::table('kelas')->where('id_wali_kelas', $teacher->id)->first();

        // Normalize name property so frontend can use `name`
        if ($classroom) {
            $classroom->name = $classroom->nama_kelas ?? $classroom->name ?? null;
        }

        if (! $classroom) {
            return Inertia::render('Teacher/Homeroom', [
                'classroom' => null,
                'students' => [],
                'unassignedStudents' => [],
                'filters' => [],
            ]);
        }

        $filters = $request->only(['search', 'status', 'unassigned_search']);
        $students = $this->classEnrollmentService->getStudentsInClassroom($classroom->id, $filters, 50);
        $unassignedStudents = $this->classEnrollmentService->getUnassignedStudents([
            'search' => $request->get('unassigned_search'),
        ], 15);

        // Augment students with simple assignment/exam progress counts
        $studentIds = collect($students->items())->pluck('student_id')->all();

        $assignmentsSubquery = DB::table('tugas')
            ->where(function ($q) use ($classroom) {
                $q->where('id_kelas', $classroom->id)->orWhereNull('id_kelas');
            })
            ->selectRaw('count(*)');

        $examsSubquery = DB::table('ujian')
            ->where(function ($q) use ($classroom) {
                $q->where('id_kelas', $classroom->id)->orWhereNull('id_kelas');
            })
            ->selectRaw('count(*)');

        $studentsWithProgress = collect($students->items())->map(function ($s) use ($classroom) {
            $s->total_assignments = DB::table('tugas')
                ->where(function ($q) use ($classroom) {
                    $q->where('id_kelas', $classroom->id)->orWhereNull('id_kelas');
                })->count();

            $s->submitted_assignments = DB::table('pengumpulan_tugas')
                ->join('tugas', 'pengumpulan_tugas.id_tugas', '=', 'tugas.id')
                ->where('pengumpulan_tugas.id_siswa', $s->student_id)
                ->where(function ($q) use ($classroom) {
                    $q->where('tugas.id_kelas', $classroom->id)->orWhereNull('tugas.id_kelas');
                })->count();

            $s->total_exams = DB::table('ujian')
                ->where(function ($q) use ($classroom) {
                    $q->where('id_kelas', $classroom->id)->orWhereNull('id_kelas');
                })->count();

            $s->completed_exams = DB::table('sesi_ujian')
                ->join('ujian', 'sesi_ujian.id_ujian', '=', 'ujian.id')
                ->where('sesi_ujian.id_siswa', $s->student_id)
                ->where(function ($q) use ($classroom) {
                    $q->where('ujian.id_kelas', $classroom->id)->orWhereNull('ujian.id_kelas');
                })->where('sesi_ujian.status', 'submitted')
                ->count();

            return $s;
        });

        // Augment each student with material progress (overall across enrolled subjects)
        $studentsWithProgress = $studentsWithProgress->map(function ($s) {
            $enrollments = DB::table('pendaftaran')->where('id_siswa', $s->student_id)->pluck('id', 'id_mata_pelajaran')->toArray();
            $subjectIds = array_keys($enrollments);
            $enrollmentIds = array_values($enrollments);

            $totalMaterials = 0;
            $completedMaterials = 0;

            if (! empty($subjectIds)) {
                $totalMaterials = DB::table('materi')->whereIn('id_mata_pelajaran', $subjectIds)->count();
            }

            if (! empty($enrollmentIds)) {
                $completedMaterials = DB::table('progres_siswa')
                    ->whereIn('id_pendaftaran', $enrollmentIds)
                    ->where('selesai', true)
                    ->count();
            }

            $percentage = $totalMaterials > 0 ? round(($completedMaterials / $totalMaterials) * 100) : 0;

            $s->total_materials = $totalMaterials;
            $s->completed_materials = $completedMaterials;
            $s->materials_percentage = $percentage;

            return $s;
        });

        return Inertia::render('Teacher/Homeroom', [
            'classroom' => $classroom,
            'students' => $studentsWithProgress,
            'unassignedStudents' => $unassignedStudents,
            'filters' => $filters,
        ]);
    }

    public function store(Request $request)
    {
        $teacher = DB::table('guru')->where('id_pengguna', $request->user()->id)->first();
        $classroom = DB::table('kelas')->where('id_wali_kelas', $teacher->id)->first();

        if (! $classroom) {
            abort(404);
        }

        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:siswa,id',
        ], [
            'student_ids.required' => 'Pilih minimal satu siswa untuk dimasukkan ke dalam kelas.',
        ]);

        $this->classEnrollmentService->assignStudentsToClassroom($classroom->id, $validated['student_ids']);

        return redirect()->route('teacher.homeroom.index')->with('success', 'Siswa berhasil dimasukkan ke dalam kelas.');
    }

    public function updateStatus(Request $request, string $studentId)
    {
        $validated = $request->validate([
            'status' => 'required|in:aktif,pindah,lulus',
        ]);

        // find classroom for this teacher
        $teacher = DB::table('guru')->where('id_pengguna', $request->user()->id)->first();
        $classroom = DB::table('kelas')->where('id_wali_kelas', $teacher->id)->first();

        if (! $classroom) {
            abort(404);
        }

        $this->classEnrollmentService->updateEnrollmentStatus($classroom->id, $studentId, $validated['status']);

        return redirect()->route('teacher.homeroom.index')->with('success', 'Status anggota kelas berhasil diperbarui.');
    }

    public function destroy(Request $request, string $studentId)
    {
        $teacher = DB::table('guru')->where('id_pengguna', $request->user()->id)->first();
        $classroom = DB::table('kelas')->where('id_wali_kelas', $teacher->id)->first();

        if (! $classroom) {
            abort(404);
        }

        $this->classEnrollmentService->removeStudentFromClassroom($classroom->id, $studentId);

        return redirect()->route('teacher.homeroom.index')->with('success', 'Siswa berhasil dikeluarkan dari kelas.');
    }
}
