<?php

namespace Tests\Unit;

use App\Repositories\Interfaces\TeacherRepositoryInterface;
use App\Services\TeacherService;
use PHPUnit\Framework\TestCase;

class TeacherServiceTest extends TestCase
{
    public function test_insert_teacher()
    {
        $teacherRepositoryMock = $this->createMock(TeacherRepositoryInterface::class);
        $data = [
            'user_id' => 2,
            'nip' => '111111111111111111',
            'specialization' => 'Science',
            'bio' => 'Experienced teacher',
        ];

        // Memastikan repository dipanggil dengan data yang sama persis
        $teacherRepositoryMock->expects($this->once())
            ->method('create')
            ->with($data)
            ->willReturn(true); // Asumsikan mengembalikan true jika berhasil

        $teacherService = new TeacherService($teacherRepositoryMock);
        $result = $teacherService->createTeacher($data);

        $this->assertTrue($result);
    }

    public function test_update_teacher()
    {
        $teacherRepositoryMock = $this->createMock(TeacherRepositoryInterface::class);
        $userId = 2;
        $teacherId = 'teacher-uuid';

        $existingTeacher = (object) [
            'id' => $teacherId,
            'user_id' => $userId,
            'photo' => 'old_photo.jpg',
        ];

        $updateData = [
            'bio' => 'Updated bio',
            'specialization' => 'Mathematics',
        ];

        $teacherRepositoryMock->expects($this->once())
            ->method('getByUserId')
            ->with($userId)
            ->willReturn($existingTeacher);

        $teacherRepositoryMock->expects($this->once())
            ->method('update')
            ->with($teacherId, $updateData);

        $teacherService = new TeacherService($teacherRepositoryMock);
        $teacherService->updateTeacher($updateData, $userId);
    }
}
