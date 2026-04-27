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
                'nip' => '111111111111111111',
                'photo' => 'teacher_photo.jpg',
                'bio' => 'Experienced science teacher',
                'specialization' => 'Science',
            ]));

        $teacherService = new TeacherService($teacherRepositoryMock);
        $teacherService->createTeacher([
            'user_id' => 2,
            'nip' => '111111111111111111',
            'photo' => 'teacher_photo.jpg',
            'bio' => 'Experienced science teacher',
            'specialization' => 'Science',
        ]);
    }
}
