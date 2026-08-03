<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ReportExportService
{
    /**
     * Export rekap laporan pembelajaran per mata pelajaran.
     *
     * @param array{
     *     include_materials?: bool,
     *     include_exams?: bool,
     *     include_assignments?: bool,
     *     format?: string
     * } $options
     * @return Response
     */
    public function exportSubjectReport(string $subjectId, array $options = [])
    {
        $includeMaterials = ! empty($options['include_materials']);
        $includeExams = ! empty($options['include_exams']);
        $includeAssignments = ! empty($options['include_assignments']);
        $format = $options['format'] ?? 'excel';

        // 1. Ambil data Mata Pelajaran & Pengajar
        $subject = DB::table('subjects')
            ->leftJoin('teachers', 'subjects.teacher_id', '=', 'teachers.id')
            ->leftJoin('users', 'teachers.user_id', '=', 'users.id')
            ->where('subjects.id', $subjectId)
            ->select([
                'subjects.id',
                'subjects.title',
                'subjects.code',
                'subjects.description',
                'users.name as teacher_name',
                'teachers.nip as teacher_nip',
            ])
            ->first();

        if (! $subject) {
            abort(404, 'Mata pelajaran tidak ditemukan.');
        }

        // 2. Ambil seluruh siswa terdaftar pada mata pelajaran ini
        $enrollments = DB::table('enrollments')
            ->join('students', 'enrollments.student_id', '=', 'students.id')
            ->join('users', 'students.user_id', '=', 'users.id')
            ->where('enrollments.subject_id', $subjectId)
            ->select([
                'enrollments.id as enrollment_id',
                'enrollments.student_id',
                'enrollments.status as enrollment_status',
                'users.name as student_name',
                'users.email as student_email',
                'students.nisn',
                'students.address',
            ])
            ->orderBy('users.name', 'asc')
            ->get();

        // 3. Ambil data Materi (jika dicentang)
        $materials = collect();
        $studentProgressMap = [];
        if ($includeMaterials) {
            $materials = DB::table('materials')
                ->where('subject_id', $subjectId)
                ->select(['id', 'title', 'content_type'])
                ->orderBy('created_at', 'asc')
                ->get();

            $progressRows = DB::table('student_progress')
                ->join('enrollments', 'student_progress.enrollment_id', '=', 'enrollments.id')
                ->where('enrollments.subject_id', $subjectId)
                ->where('student_progress.is_completed', true)
                ->select(['enrollments.student_id', 'student_progress.material_id'])
                ->get();

            foreach ($progressRows as $row) {
                $studentProgressMap[$row->student_id][$row->material_id] = true;
            }
        }

        // 4. Ambil data Ujian (jika dicentang)
        $exams = collect();
        $studentExamsMap = [];
        if ($includeExams) {
            $exams = DB::table('exams')
                ->where('subject_id', $subjectId)
                ->where('status', 'published')
                ->select(['id', 'title', 'pass_score', 'duration'])
                ->orderBy('created_at', 'asc')
                ->get();

            $examSessions = DB::table('exam_sessions')
                ->join('exams', 'exam_sessions.exam_id', '=', 'exams.id')
                ->where('exams.subject_id', $subjectId)
                ->where('exams.status', 'published')
                ->select([
                    'exam_sessions.student_id',
                    'exam_sessions.exam_id',
                    'exam_sessions.status as session_status',
                    'exam_sessions.total_score',
                    'exams.pass_score',
                ])
                ->get();

            foreach ($examSessions as $session) {
                $studentExamsMap[$session->student_id][$session->exam_id] = [
                    'status' => $session->session_status,
                    'score' => $session->total_score,
                    'pass_score' => $session->pass_score,
                    'is_passed' => $session->total_score !== null ? ((float) $session->total_score >= (float) $session->pass_score) : false,
                ];
            }
        }

        // 5. Ambil data Tugas (jika dicentang)
        $assignments = collect();
        $studentAssignmentsMap = [];
        if ($includeAssignments) {
            $assignments = DB::table('assignments')
                ->where('subject_id', $subjectId)
                ->where('status', 'published')
                ->select(['id', 'title', 'max_score', 'due_date'])
                ->orderBy('created_at', 'asc')
                ->get();

            $submissions = DB::table('assignment_submissions')
                ->join('assignments', 'assignment_submissions.assignment_id', '=', 'assignments.id')
                ->where('assignments.subject_id', $subjectId)
                ->where('assignments.status', 'published')
                ->select([
                    'assignment_submissions.student_id',
                    'assignment_submissions.assignment_id',
                    'assignment_submissions.status as submission_status',
                    'assignment_submissions.score',
                    'assignments.max_score',
                ])
                ->get();

            foreach ($submissions as $sub) {
                $studentAssignmentsMap[$sub->student_id][$sub->assignment_id] = [
                    'status' => $sub->submission_status,
                    'score' => $sub->score,
                    'max_score' => $sub->max_score,
                ];
            }
        }

        // 6. Generate HTML Content
        $html = $this->buildReportHtml(
            $subject,
            $enrollments,
            $materials,
            $studentProgressMap,
            $exams,
            $studentExamsMap,
            $assignments,
            $studentAssignmentsMap,
            $includeMaterials,
            $includeExams,
            $includeAssignments,
            $format
        );

        $filename = 'Rekap_Pembelajaran_'.str_replace(' ', '_', $subject->code ?: $subject->title).'_'.date('Ymd_His');

        if ($format === 'print') {
            return response($html, 200, [
                'Content-Type' => 'text/html; charset=UTF-8',
            ]);
        }

        // Default: Excel Spreadsheet (.xls)
        return response($html, 200, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'.xls"',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Build clean HTML template with styles for Excel / PDF Print.
     */
    private function buildReportHtml(
        $subject,
        $enrollments,
        $materials,
        $studentProgressMap,
        $exams,
        $studentExamsMap,
        $assignments,
        $studentAssignmentsMap,
        $includeMaterials,
        $includeExams,
        $includeAssignments,
        $format
    ): string {
        $dateFormatted = date('d F Y, H:i').' WIB';

        // Styles
        $tableStyle = 'border-collapse: collapse; width: 100%; margin-bottom: 25px; border: 1px solid #334155;';
        $thStyle = 'border: 1px solid #334155; background-color: #cbd5e1; color: #0f172a; font-weight: bold; text-align: center; padding: 7px 10px; font-size: 11px; text-transform: uppercase;';
        $tdStyle = 'border: 1px solid #475569; padding: 6px 10px; font-size: 11px; color: #1e293b;';
        $tdCenterStyle = 'border: 1px solid #475569; padding: 6px 10px; font-size: 11px; text-align: center; color: #1e293b;';

        $badgeSuccess = 'background-color: #dcfce7; color: #15803d; border: 1px solid #86efac; font-weight: bold; padding: 2px 8px; border-radius: 4px; display: inline-block;';
        $badgeDanger = 'background-color: #ffe4e6; color: #be123c; border: 1px solid #fca5a5; font-weight: bold; padding: 2px 8px; border-radius: 4px; display: inline-block;';
        $badgeWarning = 'background-color: #fef3c7; color: #b45309; border: 1px solid #fde047; font-weight: bold; padding: 2px 8px; border-radius: 4px; display: inline-block;';

        ob_start();
        ?>
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Rekap Laporan Pembelajaran - <?= htmlspecialchars($subject->title) ?></title>
    <!--[if gte mso 9]>
    <xml>
        <x:ExcelWorkbook>
            <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                    <x:Name>Rekap Laporan</x:Name>
                    <x:WorksheetOptions>
                        <x:DisplayGridlines/>
                    </x:WorksheetOptions>
                </x:ExcelWorksheet>
            </x:ExcelWorksheets>
        </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            color: #1f2937;
            margin: 20px;
            background-color: #ffffff;
        }
        .header-box {
            margin-bottom: 20px;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
        }
        .header-box h2 {
            margin: 0 0 5px 0;
            font-size: 18px;
            color: #0f172a;
            text-transform: uppercase;
        }
        .header-box p {
            margin: 2px 0;
            font-size: 12px;
            color: #4b5563;
        }
        .section-title {
            font-size: 13px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            color: #0f172a;
            border-left: 4px solid #0284c7;
            padding-left: 8px;
        }
        @media print {
            .no-print { display: none !important; }
            body { margin: 0; }
        }
    </style>
</head>
<body>

    <?php if ($format === 'print') { ?>
        <div class="no-print" style="margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #0f172a; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                🖨️ Cetak / Simpan PDF
            </button>
        </div>
    <?php } ?>

    <div class="header-box">
        <h2>LAPORAN REKAPITULASI PEMBELAJARAN SISWA</h2>
        <p><strong>SMK NEGERI 2 LUBUK BASUNG</strong></p>
        <p><strong>Mata Pelajaran:</strong> <?= htmlspecialchars($subject->title) ?> (<?= htmlspecialchars($subject->code ?: '-') ?>)</p>
        <p><strong>Guru Pengampu:</strong> <?= htmlspecialchars($subject->teacher_name ?: '-') ?> <?= $subject->teacher_nip ? '(NIP. '.$subject->teacher_nip.')' : '' ?></p>
        <p><strong>Tanggal Ekspor:</strong> <?= $dateFormatted ?></p>
    </div>

    <!-- TABEL 1: REKAP RINGKASAN UTAMA -->
    <div class="section-title">1. RINGKASAN CAPAIAN BELAJAR SISWA</div>
    <table border="1" cellpadding="6" cellspacing="0" style="<?= $tableStyle ?>">
        <thead>
            <tr>
                <th style="<?= $thStyle ?> width: 40px;">No</th>
                <th style="<?= $thStyle ?>">NISN</th>
                <th style="<?= $thStyle ?>">Nama Siswa</th>
                <th style="<?= $thStyle ?>">Alamat</th>
                <?php if ($includeMaterials) { ?>
                    <th style="<?= $thStyle ?>">Progres Materi</th>
                <?php } ?>
                <?php if ($includeExams) { ?>
                    <th style="<?= $thStyle ?>">Rata-rata Ujian</th>
                    <th style="<?= $thStyle ?>">Status KKM</th>
                <?php } ?>
                <?php if ($includeAssignments) { ?>
                    <th style="<?= $thStyle ?>">Rata-rata Tugas</th>
                <?php } ?>
                <th style="<?= $thStyle ?>">Status Pendaftaran</th>
            </tr>
        </thead>
        <tbody>
            <?php if (count($enrollments) > 0) { ?>
                <?php foreach ($enrollments as $idx => $student) { ?>
                    <?php
                    // Progress Materi
                    $completedCount = 0;
                    $totalMat = count($materials);
                    if ($totalMat > 0) {
                        foreach ($materials as $m) {
                            if (! empty($studentProgressMap[$student->student_id][$m->id])) {
                                $completedCount++;
                            }
                        }
                    }
                    $matPercent = $totalMat > 0 ? round(($completedCount / $totalMat) * 100) : 0;

                    // Ujian
                    $examScores = [];
                    $allPassed = true;
                    if (count($exams) > 0) {
                        foreach ($exams as $e) {
                            $exData = $studentExamsMap[$student->student_id][$e->id] ?? null;
                            if ($exData && $exData['score'] !== null) {
                                $examScores[] = (float) $exData['score'];
                                if (! $exData['is_passed']) {
                                    $allPassed = false;
                                }
                            } else {
                                $allPassed = false;
                            }
                        }
                    }
                    $avgExam = count($examScores) > 0 ? round(array_sum($examScores) / count($examScores), 1) : null;

                    // Tugas
                    $asgScores = [];
                    if (count($assignments) > 0) {
                        foreach ($assignments as $a) {
                            $asgData = $studentAssignmentsMap[$student->student_id][$a->id] ?? null;
                            if ($asgData && $asgData['score'] !== null) {
                                $asgScores[] = (float) $asgData['score'];
                            }
                        }
                    }
                    $avgAsg = count($asgScores) > 0 ? round(array_sum($asgScores) / count($asgScores), 1) : null;
                    ?>
                    <tr>
                        <td style="<?= $tdCenterStyle ?>"><?= $idx + 1 ?></td>
                        <td style="<?= $tdStyle ?> mso-number-format:'\@';"><?= htmlspecialchars($student->nisn ?: '-') ?></td>
                        <td style="<?= $tdStyle ?>"><strong><?= htmlspecialchars($student->student_name) ?></strong></td>
                        <td style="<?= $tdCenterStyle ?>"><?= htmlspecialchars($student->address ?: '-') ?></td>

                        <?php if ($includeMaterials) { ?>
                            <td style="<?= $tdCenterStyle ?>">
                                <?= $matPercent ?>% (<?= $completedCount ?>/<?= $totalMat ?>)
                            </td>
                        <?php } ?>

                        <?php if ($includeExams) { ?>
                            <td style="<?= $tdCenterStyle ?> font-weight: bold;">
                                <?= $avgExam !== null ? $avgExam : '-' ?>
                            </td>
                            <td style="<?= $tdCenterStyle ?>">
                                <?php if ($avgExam === null) { ?>
                                    <span style="<?= $badgeWarning ?>">Belum Ikut</span>
                                <?php } elseif ($allPassed) { ?>
                                    <span style="<?= $badgeSuccess ?>">LULUS KKM</span>
                                <?php } else { ?>
                                    <span style="<?= $badgeDanger ?>">REMEDIAL</span>
                                <?php } ?>
                            </td>
                        <?php } ?>

                        <?php if ($includeAssignments) { ?>
                            <td style="<?= $tdCenterStyle ?> font-weight: bold;">
                                <?= $avgAsg !== null ? $avgAsg : '-' ?>
                            </td>
                        <?php } ?>

                        <td style="<?= $tdCenterStyle ?>">
                            <span style="<?= $badgeSuccess ?>"><?= strtoupper($student->enrollment_status) ?></span>
                        </td>
                    </tr>
                <?php } ?>
            <?php } else { ?>
                <tr>
                    <td colspan="8" style="<?= $tdCenterStyle ?>">Belum ada siswa yang terdaftar pada mata pelajaran ini.</td>
                </tr>
            <?php } ?>
        </tbody>
    </table>

    <!-- TABEL 2: DETAIL MATERI (JIKA DICENTANG) -->
    <?php if ($includeMaterials && count($materials) > 0) { ?>
        <div class="section-title">2. DETAIL STATUS PENYELESAIAN MATERI PEMBELAJARAN</div>
        <table border="1" cellpadding="6" cellspacing="0" style="<?= $tableStyle ?>">
            <thead>
                <tr>
                    <th style="<?= $thStyle ?> width: 40px;">No</th>
                    <th style="<?= $thStyle ?>">Nama Siswa</th>
                    <?php foreach ($materials as $m) { ?>
                        <th style="<?= $thStyle ?>"><?= htmlspecialchars($m->title) ?></th>
                    <?php } ?>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($enrollments as $idx => $student) { ?>
                    <tr>
                        <td style="<?= $tdCenterStyle ?>"><?= $idx + 1 ?></td>
                        <td style="<?= $tdStyle ?>"><?= htmlspecialchars($student->student_name) ?></td>
                        <?php foreach ($materials as $m) { ?>
                            <?php $isDone = ! empty($studentProgressMap[$student->student_id][$m->id]); ?>
                            <td style="<?= $tdCenterStyle ?>">
                                <?php if ($isDone) { ?>
                                    <span style="<?= $badgeSuccess ?>">SELESAI</span>
                                <?php } else { ?>
                                    <span style="<?= $badgeDanger ?>">BELUM</span>
                                <?php } ?>
                            </td>
                        <?php } ?>
                    </tr>
                <?php } ?>
            </tbody>
        </table>
    <?php } ?>

    <!-- TABEL 3: DETAIL UJIAN ONLINE (JIKA DICENTANG) -->
    <?php if ($includeExams && count($exams) > 0) { ?>
        <div class="section-title">3. DETAIL HASIL UJIAN ONLINE SISWA</div>
        <table border="1" cellpadding="6" cellspacing="0" style="<?= $tableStyle ?>">
            <thead>
                <tr>
                    <th style="<?= $thStyle ?> width: 40px;">No</th>
                    <th style="<?= $thStyle ?>">Nama Siswa</th>
                    <?php foreach ($exams as $e) { ?>
                        <th style="<?= $thStyle ?>"><?= htmlspecialchars($e->title) ?> (KKM: <?= $e->pass_score ?>)</th>
                    <?php } ?>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($enrollments as $idx => $student) { ?>
                    <tr>
                        <td style="<?= $tdCenterStyle ?>"><?= $idx + 1 ?></td>
                        <td style="<?= $tdStyle ?>"><?= htmlspecialchars($student->student_name) ?></td>
                        <?php foreach ($exams as $e) { ?>
                            <?php $ex = $studentExamsMap[$student->student_id][$e->id] ?? null; ?>
                            <td style="<?= $tdCenterStyle ?>">
                                <?php if (! $ex || $ex['score'] === null) { ?>
                                    <span style="<?= $badgeWarning ?>">Belum Ikut</span>
                                <?php } elseif ($ex['is_passed']) { ?>
                                    <span style="<?= $badgeSuccess ?>"><?= $ex['score'] ?> (Lulus)</span>
                                <?php } else { ?>
                                    <span style="<?= $badgeDanger ?>"><?= $ex['score'] ?> (Remedial)</span>
                                <?php } ?>
                            </td>
                        <?php } ?>
                    </tr>
                <?php } ?>
            </tbody>
        </table>
    <?php } ?>

    <!-- TABEL 4: DETAIL TUGAS SISWA (JIKA DICENTANG) -->
    <?php if ($includeAssignments && count($assignments) > 0) { ?>
        <div class="section-title">4. DETAIL PENGUMPULAN & NILAI TUGAS SISWA</div>
        <table border="1" cellpadding="6" cellspacing="0" style="<?= $tableStyle ?>">
            <thead>
                <tr>
                    <th style="<?= $thStyle ?> width: 40px;">No</th>
                    <th style="<?= $thStyle ?>">Nama Siswa</th>
                    <?php foreach ($assignments as $a) { ?>
                        <th style="<?= $thStyle ?>"><?= htmlspecialchars($a->title) ?> (Max: <?= $a->max_score ?>)</th>
                    <?php } ?>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($enrollments as $idx => $student) { ?>
                    <tr>
                        <td style="<?= $tdCenterStyle ?>"><?= $idx + 1 ?></td>
                        <td style="<?= $tdStyle ?>"><?= htmlspecialchars($student->student_name) ?></td>
                        <?php foreach ($assignments as $a) { ?>
                            <?php $sub = $studentAssignmentsMap[$student->student_id][$a->id] ?? null; ?>
                            <td style="<?= $tdCenterStyle ?>">
                                <?php if (! $sub) { ?>
                                    <span style="<?= $badgeDanger ?>">Belum Mengumpul</span>
                                <?php } elseif ($sub['status'] === 'graded') { ?>
                                    <span style="<?= $badgeSuccess ?>"><?= $sub['score'] ?> / <?= $a->max_score ?></span>
                                <?php } else { ?>
                                    <span style="<?= $badgeWarning ?>">Perlu Dinilai</span>
                                <?php } ?>
                            </td>
                        <?php } ?>
                    </tr>
                <?php } ?>
            </tbody>
        </table>
    <?php } ?>

</body>
</html>
        <?php
        return ob_get_clean();
    }
}
