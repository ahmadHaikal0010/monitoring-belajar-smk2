<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ClassroomContentCopyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Helper untuk menyiapkan User Guru beserta data profil Guru di DB.
     */
    private function createTeacher(): array
    {
        $teacherUser = User::factory()->create([
            'peran' => 'guru',
            'disetujui' => true,
        ]);

        $guruId = (string) Str::ulid();
        DB::table('guru')->insert([
            'id' => $guruId,
            'id_pengguna' => $teacherUser->id,
            'nip' => '19900101'.rand(1000, 9999),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return [$teacherUser, $guruId];
    }

    /**
     * Helper untuk membuat kelas yang valid sesuai constraint ERD.
     */
    private function createClassroom(string $jurusanId, string $guruId): Classroom
    {
        return Classroom::create([
            'nama_kelas' => 'X TK 1',
            'id_jurusan' => $jurusanId,
            'id_wali_kelas' => $guruId,
            'tingkat' => '10',
            'rombel' => '1',
            'tahun_ajaran' => '2025/2026',
        ]);
    }

    /**
     * Helper untuk menyiapkan seluruh context testing (Guru, Mapel, Kelas, Pivot).
     */
    private function setupTestEnvironment(): array
    {
        [$teacherUser, $guruId] = $this->createTeacher();

        // 1. Buat Jurusan
        $jurusanId = (string) Str::ulid();
        DB::table('jurusan')->insert([
            'id' => $jurusanId,
            'kode_jurusan' => 'TK-'.strtoupper(Str::random(4)),
            'nama_jurusan' => 'Teknik Komputer',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Buat Subject milik Guru ini
        $subject = Subject::factory()->create([
            'id_guru' => $guruId,
        ]);

        // 3. Buat Kelas
        $classA = $this->createClassroom($jurusanId, $guruId);

        // 4. Hubungkan Kelas dan Subject di tabel pivot kelas_mata_pelajaran
        DB::table('kelas_mata_pelajaran')->insert([
            'id' => (string) Str::ulid(),
            'id_mata_pelajaran' => $subject->id,
            'id_kelas' => $classA->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return [$teacherUser, $subject, $classA];
    }

    #[Test]
    public function teacher_can_view_classroom_materials(): void
    {
        [$teacherUser, $subject, $classA] = $this->setupTestEnvironment();

        $response = $this->actingAs($teacherUser)->get(
            route('teacher.subjects.classrooms.materials', [$subject->id, $classA->id])
        );

        $response->assertOk();
    }

    #[Test]
    public function teacher_can_view_classroom_assignments(): void
    {
        [$teacherUser, $subject, $classA] = $this->setupTestEnvironment();

        $response = $this->actingAs($teacherUser)->get(
            route('teacher.subjects.classrooms.assignments', [$subject->id, $classA->id])
        );

        $response->assertOk();
    }

    #[Test]
    public function teacher_can_view_classroom_exams(): void
    {
        [$teacherUser, $subject, $classA] = $this->setupTestEnvironment();

        $response = $this->actingAs($teacherUser)->get(
            route('teacher.subjects.classrooms.exams', [$subject->id, $classA->id])
        );

        $response->assertOk();
    }
}
