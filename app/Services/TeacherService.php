<?php

namespace App\Services;

use App\Repositories\Interfaces\TeacherRepositoryInterface;
use Illuminate\Http\UploadedFile;

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
}
