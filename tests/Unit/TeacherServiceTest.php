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

        $teacherRepositoryMock->expects($this->once())
            ->method('create')
            ->with($this->equalTo([
                'user_id' => 2,
                'nip' => '123456789',
                'specialization' => 'Science',
                'photo' => 'teacher_photo.jpg',
            ]));

        $teacherService = new TeacherService($teacherRepositoryMock);
        $teacherService->createTeacher([
            'user_id' => 2,
            'nip' => '123456789',
            'specialization' => 'Science',
            'photo' => 'teacher_photo.jpg',
        ]);
    }
}
