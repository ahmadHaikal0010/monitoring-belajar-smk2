<?php

namespace App\Services;

use App\Repositories\Interfaces\TeacherRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Services\Interfaces\ImageConverterInterface;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class TeacherService
{
    public function __construct(
        protected TeacherRepositoryInterface $teacherRepository,
        protected UserRepositoryInterface $userRepository,
        protected ImageConverterInterface $imageConverter
    ) {}

    public function createTeacher(array $data)
    {
        $user = $this->userRepository->find($data['user_id']);

        if ($user->role !== 'guru') {
            throw new Exception('User must have the guru role to be assigned as a teacher.');
        }

        if (! empty($data['photo']) && $data['photo'] instanceof UploadedFile) {
            $data['photo'] = $this->storePhoto($data['photo']);
        }

        return $this->teacherRepository->create($data);
    }

    public function updateTeacher(array $data, int $userId)
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

    public function isProfileCompleted(int $userId): bool
    {
        $data = $this->teacherRepository->getByUserId($userId);

        if (! $data) {
            return false;
        }

        return true;
    }

    private function storePhoto(UploadedFile $file)
    {
        return $this->imageConverter->convertAndStore($file, 'teacher-photos', 'public', 80);
    }

    public function getTeacherByUserId(int $userId)
    {
        return $this->teacherRepository->getByUserId($userId);
    }

    public function getTeacherList(array $filters = [], int $perPage = 10)
    {
        return $this->teacherRepository->getPaginated($filters, $perPage);
    }

    public function getAssignableUsers(array $filter = [], int $perPage = 10)
    {
        return $this->teacherRepository->getAssignableUsers($filter, $perPage);
    }

    public function findTeacher(string $id)
    {
        return $this->teacherRepository->find($id);
    }

    public function updateByAdmin(array $data, string $id)
    {
        $teacher = $this->findTeacher($id);

        if (! empty($data['photo']) && $data['photo'] instanceof UploadedFile) {
            if ($teacher->photo) {
                Storage::disk('public')->delete($teacher->photo);
            }

            $data['photo'] = $this->storePhoto($data['photo']);
        }

        return $this->teacherRepository->update($id, $data);
    }

    public function deleteTeacher(string $id)
    {
        $teacher = $this->findTeacher($id);

        if ($teacher->photo) {
            Storage::disk('public')->delete($teacher->photo);
        }

        return $this->teacherRepository->delete($id);
    }
}
