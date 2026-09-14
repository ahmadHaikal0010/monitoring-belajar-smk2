<?php

namespace App\Services;

use App\Repositories\Interfaces\StudentRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Services\Interfaces\ImageConverterInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class StudentService
{
    public function __construct(
        protected StudentRepositoryInterface $studentRepository,
        protected UserRepositoryInterface $userRepository,
        protected ImageConverterInterface $imageConverter
    ) {}

    public function getStudentByUserId(string|int $userId)
    {
        return $this->studentRepository->findByUserId($userId);
    }

    public function getStudentList(array $filters = [], int $perPage = 10)
    {
        return $this->studentRepository->getPaginated($filters, $perPage);
    }

    public function getAssignableUsers(array $filters = [], int $perPage = 10)
    {
        return $this->studentRepository->getAssignableUsers($filters, $perPage);
    }

    public function findStudent(string $id)
    {
        return $this->studentRepository->find($id);
    }

    public function createStudent(array $data)
    {
        $user = $this->userRepository->find($data['user_id']);

        if ($user->role !== 'siswa') {
            abort(422, 'User must have the siswa role to be assigned as a student.');
        }

        if (! empty($data['photo']) && $data['photo'] instanceof UploadedFile) {
            $data['photo'] = $this->storePhoto($data['photo']);
        }

        return $this->studentRepository->create($data);
    }

    public function updateStudentProfile(string|int $userId, array $data)
    {
        $student = $this->studentRepository->findByUserId($userId);

        if (! $student) {
            abort(404, 'Data siswa tidak ditemukan.');
        }

        DB::transaction(function () use ($userId, $student, $data) {
            // Update User data (name, email)
            $this->userRepository->update($userId, [
                'name' => $data['name'],
                'email' => $data['email'],
            ]);

            // Handle Photo
            if (! empty($data['photo']) && $data['photo'] instanceof UploadedFile) {
                if ($student->photo) {
                    Storage::disk('public')->delete($student->photo);
                }

                $data['photo'] = $this->storePhoto($data['photo']);
            }

            // Update Student data
            $this->studentRepository->update($student->id, [
                'nisn' => $data['nisn'] ?? $student->nisn,
                'address' => $data['address'] ?? $student->address,
                'photo' => $data['photo'] ?? $student->photo,
            ]);
        });
    }

    public function updateByAdmin(array $data, string $id)
    {
        $student = $this->findStudent($id);

        if (! empty($data['photo']) && $data['photo'] instanceof UploadedFile) {
            if ($student->photo) {
                Storage::disk('public')->delete($student->photo);
            }

            $data['photo'] = $this->storePhoto($data['photo']);
        }

        return $this->studentRepository->update($id, $data);
    }

    public function deleteStudent(string $id)
    {
        $student = $this->findStudent($id);

        if ($student && $student->photo) {
            Storage::disk('public')->delete($student->photo);
        }

        return $this->studentRepository->delete($id);
    }

    private function storePhoto(UploadedFile $file)
    {
        return $this->imageConverter->convertAndStore($file, 'student-photos', 'public', 80);
    }

    /**
     * Update student profile from Student Web Controller
     */
    public function updateStudent(string $studentId, array $data)
    {
        $student = $this->findStudent($studentId);

        if (! $student) {
            abort(404, 'Data siswa tidak ditemukan.');
        }

        DB::transaction(function () use ($student, $data) {
            // 1. Update nama pada tabel pengguna jika ada
            if (! empty($data['name'])) {
                $userId = $student->user_id ?? $student->id_pengguna;

                $this->userRepository->update($userId, [
                    'nama' => $data['name'],
                    'name' => $data['name'],
                ]);
            }

            // 2. Siapkan array update untuk tabel siswa
            $updateFields = [
                'nisn' => $data['nisn'] ?? $student->nisn,
                'address' => $data['address'] ?? $student->address,
            ];

            // 3. Olah upload foto baru jika dikirim dari controller
            if (! empty($data['photo']) && $data['photo'] instanceof UploadedFile) {
                // Hapus foto lama di storage jika ada
                if ($student->photo && Storage::disk('public')->exists($student->photo)) {
                    Storage::disk('public')->delete($student->photo);
                }

                // Simpan foto baru dan tambahkan path ke array update
                $updateFields['photo'] = $this->storePhoto($data['photo']);
            }

            // 4. Update tabel siswa via repository
            $this->studentRepository->update($student->id, $updateFields);
        });
    }
}
