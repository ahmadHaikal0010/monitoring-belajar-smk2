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

    private function storePhoto(UploadedFile $file)
    {
        $filename = uniqid().'.'.$file->getClientOriginalExtension();

        return $file->storeAs('student-photos', $filename, 'public');
    }
}
