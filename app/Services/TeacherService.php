<?php

namespace App\Services;

use App\Repositories\Interfaces\TeacherRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class TeacherService
{
    protected $teacherRepository;

    public function __construct(TeacherRepositoryInterface $teacherRepository)
    {
        $this->teacherRepository = $teacherRepository;
    }

    public function createTeacher($data)
    {
        if (! empty($data['photo']) && $data['photo'] instanceof UploadedFile) {
            $data['photo'] = $this->storePhoto($data['photo']);
        }

        return $this->teacherRepository->create($data);
    }

    public function updateTeacher($data, $userId)
    {
        $teacher = $this->teacherRepository->getByUserId($userId);

        if (! empty($data['photo']) && $data['photo'] instanceof UploadedFile) {
            if ($teacher->photo) {
                Storage::disk('public')->delete($teacher->photo);
            }

            $data['photo'] = $this->storePhoto($data['photo']);
        }

        return $this->teacherRepository->update($teacher->id, $data);
    }

    public function isProfileCompleted($userId): bool
    {
        $data = $this->teacherRepository->getByUserId($userId);

        if (! $data) {
            return false;
        }

        return true;
    }

    private function storePhoto($file)
    {
        $filename = uniqid().'.'.$file->getClientOriginalExtension();

        return $file->storeAs('teacher-photos', $filename, 'public');
    }

    public function getTeacherByUserId($userId)
    {
        return $this->teacherRepository->getByUserId($userId);
    }

    public function getTeacherList($perPage = 10)
    {
        return $this->teacherRepository->getPaginated($perPage);
    }
}
