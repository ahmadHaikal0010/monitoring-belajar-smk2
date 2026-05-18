<?php

namespace App\Services;

use App\Repositories\Interfaces\StudentRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class StudentService
{
    protected StudentRepositoryInterface $studentRepository;

    protected UserRepositoryInterface $userRepository;

    public function __construct(
        StudentRepositoryInterface $studentRepository,
        UserRepositoryInterface $userRepository
    ) {
        $this->studentRepository = $studentRepository;
        $this->userRepository = $userRepository;
    }

    public function getStudentByUserId(int $userId)
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

    public function updateStudentProfile(int $userId, array $data)
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
        $filename = uniqid().'.'.$file->getClientOriginalExtension();

        return $file->storeAs('student-photos', $filename, 'public');
    }
}
