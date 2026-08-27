<?php

namespace App\Repositories\Interfaces;

interface SubjectRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10);

    public function create(array $data);

    public function find(string $id);

    public function update(string $id, array $data);

    public function delete(string $id);

    public function getTeacherSubjects(string $teacherId);

    public function getMaterials(string $id);

    public function syncClassrooms(string $subjectId, array $classroomIds);

    public function getClassrooms(string $subjectId);

    public function getAssignments(string $subjectId);

    public function getExams(string $subjectId);
}
