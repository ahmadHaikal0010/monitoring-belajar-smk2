<?php

namespace App\Http\Controllers;

use App\Http\Requests\Exam\StoreExamRequest;
use App\Http\Requests\Exam\StoreQuestionRequest;
use App\Http\Requests\Exam\UpdateExamRequest;
use App\Services\ExamService;
use App\Services\SubjectService;
use App\Services\TeacherService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ExamController extends Controller
{
    public function __construct(
        protected ExamService $examService,
        protected SubjectService $subjectService,
        protected TeacherService $teacherService
    ) {}

    public function index()
    {
        $filters = request()->only(['search', 'sort', 'direction', 'subject_id', 'status']);
        $user = auth()->user();

        if ($user->role === 'guru') {
            $teacher = $this->teacherService->getTeacherByUserId($user->id);
            $filters['teacher_id'] = $teacher->id ?? null;
        }

        if (! empty($filters['subject_id'])) {
            $selectedSubject = $this->subjectService->getSubjectById($filters['subject_id']);

            if ($user->role === 'guru' && ($selectedSubject->teacher_id ?? null) !== ($filters['teacher_id'] ?? null)) {
                return redirect()->route('teacher.exams.index')
                    ->with('error', 'Anda tidak memiliki hak akses untuk mata pelajaran tersebut.');
            }

            $exams = $this->examService->getPaginatedExams($filters);

            return Inertia::render('Exams/index', [
                'exams' => $exams,
                'selectedSubject' => $selectedSubject,
                'filters' => $filters,
                'mode' => 'exams',
            ]);
        }

        $subjects = $this->subjectService->getSubjectList($filters, 12);

        return Inertia::render('Exams/index', [
            'subjects' => $subjects,
            'filters' => $filters,
            'mode' => 'subjects',
        ]);
    }

    public function create()
    {
        $subjectId = request('subject_id');

        if (! $subjectId) {
            return redirect()->route('teacher.exams.index')
                ->with('error', 'Silakan pilih mata pelajaran terlebih dahulu.');
        }

        $subject = $this->subjectService->getSubjectById($subjectId);
        $teacher = $this->teacherService->getTeacherByUserId(auth()->id());

        if (auth()->user()->role === 'guru' && $subject->teacher_id !== $teacher->id) {
            return Inertia::render('unauthorized', [
                'message' => 'Anda tidak memiliki wewenang untuk menambahkan ujian pada mata pelajaran ini.',
            ]);
        }

        return Inertia::render('Exams/create', [
            'subject' => $subject,
        ]);
    }

    public function store(StoreExamRequest $request)
    {
        $data = $request->validated();
        $subject = $this->subjectService->getSubjectById($data['subject_id']);

        if (auth()->user()->role === 'guru') {
            $teacher = $this->teacherService->getTeacherByUserId(auth()->id());
            if ($subject->teacher_id !== $teacher->id) {
                abort(403, 'Tindakan tidak diizinkan.');
            }
            $data['teacher_id'] = $teacher->id;
        } else {
            $data['teacher_id'] = $subject->teacher_id;
        }

        try {
            $this->examService->createExam($data);

            return redirect()->route('teacher.exams.index', ['subject_id' => $data['subject_id']])
                ->with('success', 'Ujian baru berhasil dibuat.');
        } catch (Exception $e) {
            Log::error('Error creating exam: '.$e->getMessage());

            return redirect()->route('teacher.exams.index', ['subject_id' => $data['subject_id']])
                ->with('error', 'Terjadi kesalahan saat membuat ujian. Silakan coba lagi.');
        }
    }

    public function show(string $id)
    {
        $exam = $this->examService->findExamWithDetails($id);

        if (! $exam) {
            return redirect()->route('teacher.exams.index')
                ->with('error', 'Ujian tidak ditemukan.');
        }

        $materials = DB::table('materials')
            ->where('subject_id', $exam->subject_id)
            ->select(['id', 'title'])
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Exams/show', [
            'exam' => $exam,
            'materials' => $materials,
        ]);
    }

    public function edit(string $id)
    {
        $exam = $this->examService->findExam($id);

        if (! $exam) {
            return redirect()->route('teacher.exams.index')
                ->with('error', 'Ujian tidak ditemukan.');
        }

        $subject = $this->subjectService->getSubjectById($exam->subject_id);

        return Inertia::render('Exams/edit', [
            'exam' => $exam,
            'subject' => $subject,
        ]);
    }

    public function update(UpdateExamRequest $request, string $id)
    {
        $exam = $this->examService->findExam($id);
        if (! $exam) {
            return redirect()->route('teacher.exams.index')->with('error', 'Ujian tidak ditemukan.');
        }

        $data = $request->validated();

        try {
            $this->examService->updateExam($id, $data);

            return redirect()->route('teacher.exams.show', $id)
                ->with('success', 'Pengaturan ujian berhasil diperbarui.');
        } catch (Exception $e) {
            Log::error('Error updating exam: '.$e->getMessage());

            return redirect()->route('teacher.exams.show', $id)
                ->with('error', 'Terjadi kesalahan saat memperbarui ujian.');
        }
    }

    public function destroy(string $id)
    {
        $exam = $this->examService->findExam($id);
        $subjectId = $exam->subject_id ?? null;

        try {
            $this->examService->deleteExam($id);

            return redirect()->route('teacher.exams.index', ['subject_id' => $subjectId])
                ->with('success', 'Ujian telah berhasil dihapus.');
        } catch (Exception $e) {
            Log::error('Error deleting exam: '.$e->getMessage());

            return redirect()->route('teacher.exams.index', ['subject_id' => $subjectId])
                ->with('error', 'Terjadi kesalahan saat menghapus ujian.');
        }
    }

    public function storeQuestion(StoreQuestionRequest $request, string $examId)
    {
        $data = $request->validated();
        $imageFile = $request->file('image');

        $optionsData = $data['options'] ?? [];

        try {
            $this->examService->addQuestionToExam(
                $examId,
                [
                    'question_text' => $data['question_text'],
                    'material_id' => $data['material_id'] ?? null,
                    'question_type' => $data['question_type'],
                    'score' => $data['score'],
                ],
                $imageFile,
                $optionsData
            );

            return redirect()->route('teacher.exams.show', $examId)
                ->with('success', 'Soal berhasil ditambahkan ke ujian.');
        } catch (Exception $e) {
            Log::error('Error adding question to exam: '.$e->getMessage());

            return redirect()->route('teacher.exams.show', $examId)
                ->with('error', 'Gagal menambahkan soal.');
        }
    }

    public function updateQuestion(StoreQuestionRequest $request, string $examId, string $questionId)
    {
        $data = $request->validated();
        $imageFile = $request->file('image');
        $optionsData = $data['options'] ?? [];

        try {
            $this->examService->updateQuestion(
                $questionId,
                [
                    'question_text' => $data['question_text'],
                    'material_id' => $data['material_id'] ?? null,
                    'question_type' => $data['question_type'],
                    'score' => $data['score'],
                    'remove_image' => $data['remove_image'] ?? false,
                ],
                $imageFile,
                $optionsData
            );

            return redirect()->route('teacher.exams.show', $examId)
                ->with('success', 'Soal berhasil diperbarui.');
        } catch (Exception $e) {
            Log::error('Error updating question: '.$e->getMessage());

            return redirect()->route('teacher.exams.show', $examId)
                ->with('error', 'Gagal memperbarui soal.');
        }
    }

    public function destroyQuestion(string $examId, string $questionId)
    {
        try {
            $this->examService->deleteQuestion($questionId);

            return redirect()->route('teacher.exams.show', $examId)
                ->with('success', 'Soal berhasil dihapus.');
        } catch (Exception $e) {
            Log::error('Error deleting question: '.$e->getMessage());

            return redirect()->route('teacher.exams.show', $examId)
                ->with('error', 'Gagal menghapus soal.');
        }
    }
}
