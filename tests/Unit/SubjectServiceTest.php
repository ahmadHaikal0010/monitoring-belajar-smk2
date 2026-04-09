<?php

namespace Tests\Unit;

require_once __DIR__.'/../../vendor/phpunit/phpunit/src/Event/Events/TestRunner/WarningTriggeredSubscriber.php';
require_once __DIR__.'/../../vendor/phpunit/phpunit/src/Event/Events/TestRunner/WarningTriggered.php';

use App\Repositories\Interfaces\SubjectRepositoryInterface;
use App\Services\SubjectService;
use PHPUnit\Framework\TestCase;

class SubjectServiceTest extends TestCase
{
    public function test_store_subject()
    {
        // membuat mock
        $subjectRepositoryMock = $this->createMock(SubjectRepositoryInterface::class);

        // mengatur ekspektasi pada mock
        $subjectRepositoryMock->expects($this->once())
            ->method('create')
            ->with($this->equalTo([
                'name' => 'Mathematics',
                'description' => 'Study of numbers and shapes',
            ]));

        // membuat instance SubjectService dengan mock repository
        $subjectService = new SubjectService($subjectRepositoryMock);
        $subjectService->createSubject([
            'name' => 'Mathematics',
            'description' => 'Study of numbers and shapes',
        ]);
    }
}
