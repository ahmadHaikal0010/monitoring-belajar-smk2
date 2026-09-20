<?php

namespace App\Repositories;

use App\Repositories\Interfaces\StudentRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\Uid\Uuid;

class SqlStudentRepository implements StudentRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('siswa')
            ->join('pengguna', 'siswa.id_pengguna', '=', 'pengguna.id')
            ->select([
                'siswa.id',
                'siswa.nisn',
                'siswa.alamat as address',
                'siswa.foto as photo',
                'pengguna.nama as user_name',
                'pengguna.email as user_email',
                'siswa.created_at',
            ]);

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('pengguna.nama', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('siswa.nisn', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('pengguna.email', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        $sortField = $filters['sort'] ?? 'pengguna.nama';
        $sortDirection = $filters['direction'] ?? 'asc';

        $sortFieldMap = [
            'users.name' => 'pengguna.nama',
            'students.nisn' => 'siswa.nisn',
            'students.created_at' => 'siswa.created_at',
        ];

        $dbSortField = $sortFieldMap[$sortField] ?? ($sortFieldMap[$sortField] ?? 'pengguna.nama');
        $query->orderBy($dbSortField, $sortDirection);

        return $query->paginate($perPage)
            ->withQueryString()
            ->through(function ($student) {
                $student->photo_url = $this->formatPhotoUrl($student->photo);

                return $student;
            });
    }

    public function getAssignableUsers(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('pengguna')
            ->leftJoin('siswa', 'pengguna.id', '=', 'siswa.id_pengguna')
            ->whereNull('siswa.id_pengguna')
            ->where('pengguna.peran', 'siswa')
            ->where('pengguna.disetujui', true)
            ->select(['pengguna.id', 'pengguna.nama as name', 'pengguna.email']);

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('pengguna.nama', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('pengguna.email', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        return $query->paginate($perPage)
            ->withQueryString();
    }

    public function find(string $id)
    {
        $student = DB::table('siswa')
            ->where('id', $id)
            ->first();

        if ($student) {
            if (! isset($student->id_kelas) || ! $student->id_kelas) {
                $enrollment = DB::table('anggota_kelas')
                    ->where('id_siswa', $student->id)
                    ->where('status', 'aktif')
                    ->first();
                if ($enrollment) {
                    $student->id_kelas = $enrollment->id_kelas;
                }
            }

            $student->user = DB::table('pengguna')
                ->where('id', $student->id_pengguna)
                ->select(['id', 'nama as name', 'email'])
                ->first();

            $student->user_id = $student->id_pengguna;
            $student->address = $student->alamat;
            $student->photo = $student->foto;
            $student->photo_url = $this->formatPhotoUrl($student->photo);
        }

        return $student;
    }

    private function formatPhotoUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return url('storage/'.ltrim($path, '/'));
    }

    public function findByUserId(string|int $userId)
    {
        $student = DB::table('siswa')
            ->where('id_pengguna', $userId)
            ->first();

        if ($student) {
            if (! isset($student->id_kelas) || ! $student->id_kelas) {
                $enrollment = DB::table('anggota_kelas')
                    ->where('id_siswa', $student->id)
                    ->where('status', 'aktif')
                    ->first();
                if ($enrollment) {
                    $student->id_kelas = $enrollment->id_kelas;
                }
            }

            $student->user_id = $student->id_pengguna;
            $student->address = $student->alamat;
            $student->photo = $student->foto;
        }

        return $student;
    }

    public function create(array $data)
    {
        DB::table('siswa')->insert([
            'id' => (string) Uuid::v7(),
            'id_pengguna' => $data['user_id'],
            'nisn' => $data['nisn'],
            'alamat' => $data['address'],
            'foto' => $data['photo'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function update(string $id, array $data)
    {
        $updateData = [];

        if (array_key_exists('nisn', $data)) {
            $updateData['nisn'] = $data['nisn'];
        }

        if (array_key_exists('address', $data)) {
            $updateData['alamat'] = $data['address'];
        }

        if (array_key_exists('photo', $data)) {
            $updateData['foto'] = $data['photo'];
        }

        if (! empty($updateData)) {
            $updateData['updated_at'] = now();
            DB::table('siswa')
                ->where('id', $id)
                ->update($updateData);
        }
    }

    public function delete(string $id)
    {
        DB::table('siswa')->where('id', $id)->delete();
    }

    public function findClassByName(string $className): ?object
    {
        return DB::table('kelas')
            ->where('nama_kelas', trim($className))
            ->first();
    }

    public function isEmailExists(string $email): bool
    {
        return DB::table('pengguna')
            ->where('email', trim($email))
            ->exists();
    }

    public function isNisnExists(string $nisn): bool
    {
        return DB::table('siswa')
            ->where('nisn', trim($nisn))
            ->exists();
    }

    public function createStudentWithUser(array $userData, array $studentData, ?string $classId): void
    {
        DB::transaction(function () use ($userData, $studentData, $classId) {
            // 1. Insert ke tabel pengguna
            $userId = DB::table('pengguna')->insertGetId([
                'nama' => $userData['nama'],
                'email' => $userData['email'],
                'kata_sandi' => $userData['kata_sandi'],
                'peran' => 'siswa',
                'disetujui' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 2. Insert ke tabel siswa
            $siswaId = (string) Str::orderedUuid();
            DB::table('siswa')->insert([
                'id' => $siswaId,
                'id_pengguna' => $userId,
                'id_kelas' => $classId,
                'nisn' => $studentData['nisn'],
                'alamat' => $studentData['alamat'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 3. Insert ke tabel anggota_kelas jika kelas terikat
            if ($classId) {
                DB::table('anggota_kelas')->insert([
                    'id' => (string) Str::orderedUuid(),
                    'id_kelas' => $classId,
                    'id_siswa' => $siswaId,
                    'status' => 'aktif',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });
    }
}
