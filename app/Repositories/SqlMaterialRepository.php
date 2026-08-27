<?php

namespace App\Repositories;

use App\Repositories\Interfaces\MaterialRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Uid\Uuid;

class SqlMaterialRepository implements MaterialRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('materi')
            ->join('mata_pelajaran', 'materi.id_mata_pelajaran', '=', 'mata_pelajaran.id')
            ->select([
                'materi.id',
                'materi.id_mata_pelajaran as subject_id',
                'materi.id_kelas as classroom_id',
                'materi.judul as title',
                'materi.tipe_konten as content_type',
                'materi.isi_konten as content_body',
                'materi.deskripsi as description',
                'materi.created_at',
                'mata_pelajaran.judul as subject_title',
                'mata_pelajaran.id_guru as teacher_id',
            ])
            ->join('guru', 'mata_pelajaran.id_guru', '=', 'guru.id')
            ->addSelect(['guru.id_pengguna as teacher_user_id']);

        if (! empty($filters['subject_id'])) {
            $query->where('materi.id_mata_pelajaran', $filters['subject_id']);
        }

        if (! empty($filters['teacher_id'])) {
            $query->where('mata_pelajaran.id_guru', $filters['teacher_id']);
        }

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('materi.judul', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('materi.tipe_konten', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('mata_pelajaran.judul', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('materi.deskripsi', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        $sortField = $filters['sort'] ?? 'materi.created_at';
        $sortDirection = $filters['direction'] ?? 'desc';

        $allowedSorts = [
            'title' => 'materi.judul',
            'type' => 'materi.tipe_konten',
            'subject' => 'mata_pelajaran.judul',
            'date' => 'materi.created_at',
        ];

        if (array_key_exists($sortField, $allowedSorts)) {
            $query->orderBy($allowedSorts[$sortField], $sortDirection);
        } else {
            $query->orderBy('materi.created_at', 'asc');
        }

        return $query
            ->paginate($perPage)
            ->withQueryString()
            ->through(function ($material) {
                if (in_array($material->content_type, ['video', 'document']) && $material->content_body) {
                    $material->content_body_url = Storage::disk('public')->url($material->content_body);
                } else {
                    $material->content_body_url = null;
                }

                return $material;
            });
    }

    public function find(string $id)
    {
        $material = DB::table('materi')
            ->join('mata_pelajaran', 'materi.id_mata_pelajaran', '=', 'mata_pelajaran.id')
            ->where('materi.id', $id)
            ->select([
                'materi.id',
                'materi.id_mata_pelajaran as subject_id',
                'materi.id_kelas as classroom_id',
                'materi.judul as title',
                'materi.tipe_konten as content_type',
                'materi.isi_konten as content_body',
                'materi.deskripsi as description',
                'materi.created_at',
                'mata_pelajaran.judul as subject_title',
                'mata_pelajaran.id_guru as teacher_id',
            ])
            ->first();

        if ($material && in_array($material->content_type, ['video', 'document']) && $material->content_body) {
            $material->content_body_url = Storage::disk('public')->url($material->content_body);
        } else {
            if ($material) {
                $material->content_body_url = null;
            }
        }

        return $material;
    }

    public function getBySubjectId(string $subjectId)
    {
        return DB::table('materi')
            ->where('id_mata_pelajaran', $subjectId)
            ->select([
                'id',
                'id_mata_pelajaran as subject_id',
                'judul as title',
                'tipe_konten as content_type',
                'isi_konten as content_body',
                'deskripsi as description',
                'created_at',
            ])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function create(array $data)
    {
        DB::table('materi')->insert([
            'id' => (string) Uuid::v7(),
            'id_mata_pelajaran' => $data['subject_id'],
            'id_kelas' => $data['classroom_id'] ?? null,
            'judul' => $data['title'],
            'tipe_konten' => $data['content_type'],
            'isi_konten' => $data['content_body'],
            'deskripsi' => $data['description'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function update(string $id, array $data)
    {
        $updateData = [
            'judul' => $data['title'],
            'tipe_konten' => $data['content_type'],
            'isi_konten' => $data['content_body'],
            'deskripsi' => $data['description'] ?? null,
            'updated_at' => now(),
        ];

        if (array_key_exists('classroom_id', $data)) {
            $updateData['id_kelas'] = $data['classroom_id'];
        }

        DB::table('materi')
            ->where('id', $id)
            ->update($updateData);
    }

    public function delete(string $id)
    {
        DB::table('materi')
            ->where('id', $id)
            ->delete();
    }
}
