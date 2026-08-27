<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Classroom;
use App\Models\Exam;
use App\Models\Material;
use App\Models\Option;
use App\Models\Question;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClassroomContentController extends Controller
{
    /**
     * Display materials management page for a specific classroom.
     */
    public function materials(Subject $subject, Classroom $classroom)
    {
        $materials = Material::where('id_mata_pelajaran', $subject->id)
            ->where(function ($q) use ($classroom) {
                $q->where('id_kelas', $classroom->id)
                    ->orWhereNull('id_kelas');
            })
            ->orderBy('created_at', 'asc')
            ->get();

        $otherClassroomMaterials = DB::table('materi')
            ->leftJoin('kelas', 'materi.id_kelas', '=', 'kelas.id')
            ->where('materi.id_mata_pelajaran', $subject->id)
            ->where(function ($q) use ($classroom) {
                $q->where('materi.id_kelas', '!=', $classroom->id)
                    ->orWhereNull('materi.id_kelas');
            })
            ->select([
                'materi.id',
                'materi.judul as title',
                'materi.tipe_konten as content_type',
                'materi.deskripsi as description',
                DB::raw("COALESCE(kelas.nama_kelas, 'Umum / Semua Kelas') as classroom_name"),
            ])
            ->orderBy('materi.created_at', 'asc')
            ->get();

        return Inertia::render('Subjects/ClassroomMaterials', [
            'subject' => $subject,
            'classroom' => $classroom,
            'materials' => $materials,
            'otherClassroomMaterials' => $otherClassroomMaterials,
        ]);
    }

    /**
     * Copy materials from other classrooms into this classroom.
     */
    public function copyMaterials(Subject $subject, Classroom $classroom, Request $request)
    {
        $validated = $request->validate([
            'material_ids' => 'required|array|min:1',
            'material_ids.*' => 'exists:materi,id',
        ]);

        $sourceMaterials = Material::whereIn('id', $validated['material_ids'])->get();
        $count = 0;

        foreach ($sourceMaterials as $m) {
            Material::create([
                'id_mata_pelajaran' => $subject->id,
                'id_kelas' => $classroom->id,
                'judul' => $m->judul.' (Salinan)',
                'tipe_konten' => $m->tipe_konten,
                'isi_konten' => $m->isi_konten,
                'deskripsi' => $m->deskripsi,
            ]);
            $count++;
        }

        return redirect()->back()->with('success', "Berhasil menyalin {$count} materi pembelajaran ke kelas {$classroom->nama_kelas}.");
    }

    /**
     * Display assignments management page for a specific classroom.
     */
    public function assignments(Subject $subject, Classroom $classroom)
    {
        $assignments = Assignment::where('id_mata_pelajaran', $subject->id)
            ->where(function ($q) use ($classroom) {
                $q->where('id_kelas', $classroom->id)
                    ->orWhereNull('id_kelas');
            })
            ->withCount('submissions')
            ->orderBy('created_at', 'asc')
            ->get();

        $otherClassroomAssignments = DB::table('tugas')
            ->leftJoin('kelas', 'tugas.id_kelas', '=', 'kelas.id')
            ->where('tugas.id_mata_pelajaran', $subject->id)
            ->where(function ($q) use ($classroom) {
                $q->where('tugas.id_kelas', '!=', $classroom->id)
                    ->orWhereNull('tugas.id_kelas');
            })
            ->select([
                'tugas.id',
                'tugas.judul as title',
                'tugas.deskripsi as description',
                'tugas.tenggat_waktu as due_date',
                'tugas.skor_maksimal as max_score',
                DB::raw("COALESCE(kelas.nama_kelas, 'Umum / Semua Kelas') as classroom_name"),
            ])
            ->orderBy('tugas.created_at', 'asc')
            ->get();

        return Inertia::render('Subjects/ClassroomAssignments', [
            'subject' => $subject,
            'classroom' => $classroom,
            'assignments' => $assignments,
            'otherClassroomAssignments' => $otherClassroomAssignments,
        ]);
    }

    /**
     * Copy assignments from other classrooms into this classroom.
     */
    public function copyAssignments(Subject $subject, Classroom $classroom, Request $request)
    {
        $validated = $request->validate([
            'assignment_ids' => 'required|array|min:1',
            'assignment_ids.*' => 'exists:tugas,id',
        ]);

        $sourceAssignments = Assignment::whereIn('id', $validated['assignment_ids'])->get();
        $count = 0;

        foreach ($sourceAssignments as $a) {
            Assignment::create([
                'id_mata_pelajaran' => $subject->id,
                'id_kelas' => $classroom->id,
                'id_guru' => $a->id_guru,
                'judul' => $a->judul.' (Salinan)',
                'deskripsi' => $a->deskripsi,
                'tenggat_waktu' => $a->tenggat_waktu,
                'skor_maksimal' => $a->skor_maksimal,
                'tipe_berkas_diizinkan' => $a->tipe_berkas_diizinkan,
                'status' => 'draft',
            ]);
            $count++;
        }

        return redirect()->back()->with('success', "Berhasil menyalin {$count} tugas ke kelas {$classroom->nama_kelas}.");
    }

    /**
     * Display exams management page for a specific classroom.
     */
    public function exams(Subject $subject, Classroom $classroom)
    {
        $exams = Exam::where('id_mata_pelajaran', $subject->id)
            ->where(function ($q) use ($classroom) {
                $q->where('id_kelas', $classroom->id)
                    ->orWhereNull('id_kelas');
            })
            ->withCount('questions')
            ->orderBy('created_at', 'asc')
            ->get();

        $otherClassroomExams = DB::table('ujian')
            ->leftJoin('kelas', 'ujian.id_kelas', '=', 'kelas.id')
            ->where('ujian.id_mata_pelajaran', $subject->id)
            ->where(function ($q) use ($classroom) {
                $q->where('ujian.id_kelas', '!=', $classroom->id)
                    ->orWhereNull('ujian.id_kelas');
            })
            ->select([
                'ujian.id',
                'ujian.judul as title',
                'ujian.durasi as duration',
                'ujian.nilai_kkm as pass_score',
                DB::raw("COALESCE(kelas.nama_kelas, 'Umum / Semua Kelas') as classroom_name"),
            ])
            ->orderBy('ujian.created_at', 'asc')
            ->get();

        return Inertia::render('Subjects/ClassroomExams', [
            'subject' => $subject,
            'classroom' => $classroom,
            'exams' => $exams,
            'otherClassroomExams' => $otherClassroomExams,
        ]);
    }

    /**
     * Copy exams and their questions/options into this classroom.
     */
    public function copyExams(Subject $subject, Classroom $classroom, Request $request)
    {
        $validated = $request->validate([
            'exam_ids' => 'required|array|min:1',
            'exam_ids.*' => 'exists:ujian,id',
        ]);

        $sourceExams = Exam::whereIn('id', $validated['exam_ids'])->with(['questions.options'])->get();
        $count = 0;

        DB::transaction(function () use ($sourceExams, $subject, $classroom, &$count) {
            foreach ($sourceExams as $e) {
                $newExam = Exam::create([
                    'id_mata_pelajaran' => $subject->id,
                    'id_kelas' => $classroom->id,
                    'id_guru' => $e->id_guru,
                    'judul' => $e->judul.' (Salinan)',
                    'deskripsi' => $e->deskripsi,
                    'durasi' => $e->durasi,
                    'nilai_kkm' => $e->nilai_kkm,
                    'acak_soal' => $e->acak_soal,
                    'acak_opsi' => $e->acak_opsi,
                    'status' => 'draft',
                ]);

                foreach ($e->questions as $q) {
                    $newQuestion = Question::create([
                        'id_ujian' => $newExam->id,
                        'id_materi' => $q->id_materi,
                        'teks_soal' => $q->teks_soal,
                        'tipe_soal' => $q->tipe_soal,
                        'bobot_nilai' => $q->bobot_nilai,
                        'urutan' => $q->urutan,
                    ]);

                    foreach ($q->options as $o) {
                        Option::create([
                            'id_soal' => $newQuestion->id,
                            'teks_opsi' => $o->teks_opsi,
                            'adalah_benar' => $o->adalah_benar,
                            'urutan' => $o->urutan,
                        ]);
                    }
                }
                $count++;
            }
        });

        return redirect()->back()->with('success', "Berhasil menyalin {$count} ujian beserta soal & opsi ke kelas {$classroom->nama_kelas}.");
    }

    /**
     * Display student progress page for a specific classroom.
     */
    public function progress(Subject $subject, Classroom $classroom)
    {
        $user = auth()->user();
        if ($user->role === 'guru') {
            $teacher = DB::table('guru')->where('id_pengguna', $user->id)->first();
            if ($subject->teacher_id !== ($teacher->id ?? null)) {
                abort(403, 'Anda tidak memiliki hak akses untuk mata pelajaran ini.');
            }
        }

        $students = DB::table('anggota_kelas')
            ->join('siswa', 'anggota_kelas.id_siswa', '=', 'siswa.id')
            ->join('pengguna', 'siswa.id_pengguna', '=', 'pengguna.id')
            ->leftJoin('pendaftaran', function ($join) use ($subject) {
                $join->on('siswa.id', '=', 'pendaftaran.id_siswa')
                    ->where('pendaftaran.id_mata_pelajaran', '=', $subject->id);
            })
            ->where('anggota_kelas.id_kelas', $classroom->id)
            ->select([
                'siswa.id as student_id',
                'pendaftaran.id as enrollment_id',
                'pengguna.nama as student_name',
                'pengguna.email as student_email',
                'siswa.nisn as student_nisn',
                'siswa.foto as student_photo',
                'anggota_kelas.status as classroom_status',
                'pendaftaran.status as enrollment_status',
                'pendaftaran.terdaftar_pada as enrolled_at',
            ])
            ->addSelect([
                'total_materials' => DB::table('materi')
                    ->where('id_mata_pelajaran', $subject->id)
                    ->where(function ($q) use ($classroom) {
                        $q->where('id_kelas', $classroom->id)->orWhereNull('id_kelas');
                    })
                    ->selectRaw('count(*)'),
                'completed_materials' => DB::table('progres_siswa')
                    ->join('pendaftaran', 'progres_siswa.id_pendaftaran', '=', 'pendaftaran.id')
                    ->where('pendaftaran.id_mata_pelajaran', $subject->id)
                    ->whereColumn('pendaftaran.id_siswa', 'siswa.id')
                    ->where('progres_siswa.selesai', true)
                    ->selectRaw('count(*)'),
            ])
            ->orderBy('pengguna.nama', 'asc')
            ->get();

        return Inertia::render('Subjects/ClassroomProgress', [
            'subject' => $subject,
            'classroom' => $classroom,
            'students' => $students,
        ]);
    }
}
