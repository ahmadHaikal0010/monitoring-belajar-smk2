<?php

namespace App\Services;

use App\Repositories\Interfaces\EnrollmentRepositoryInterface;
use App\Repositories\Interfaces\SubjectRepositoryInterface;
use Illuminate\Support\Facades\DB;

class EnrollmentService
{
    protected EnrollmentRepositoryInterface $enrollmentRepository;

    protected SubjectRepositoryInterface $subjectRepository;

    public function __construct(
        EnrollmentRepositoryInterface $enrollmentRepository,
        SubjectRepositoryInterface $subjectRepository
    ) {
        $this->enrollmentRepository = $enrollmentRepository;
        $this->subjectRepository = $subjectRepository;
    }

    public function getEnrollmentList(array $filters = [], int $perPage = 10)
    {
        return $this->enrollmentRepository->getPaginated($filters, $perPage);
    }

    public function findEnrollment(string $id)
    {
        return $this->enrollmentRepository->find($id);
    }

    public function deleteEnrollment(string $id)
    {
        return $this->enrollmentRepository->delete($id);
    }

    public function checkEnrollment(string $studentId, string $subjectId): bool
    {
        return $this->enrollmentRepository->isEnrolled($studentId, $subjectId);
    }

    public function enrollByCode(string $studentId, string $code)
    {
        $subject = DB::table('subjects')->where('code', $code)->first();

        if (! $subject) {
            abort(404, 'Mata pelajaran dengan kode tersebut tidak ditemukan.');
        }

        if ($this->enrollmentRepository->isEnrolled($studentId, $subject->id)) {
            abort(422, 'Anda sudah terdaftar di mata pelajaran ini.');
        }

        return $this->enrollmentRepository->enroll($studentId, $subject->id);
    }

    public function getStudentSubjects(string $studentId)
    {
        return $this->enrollmentRepository->getStudentEnrollments($studentId);
    }
}
