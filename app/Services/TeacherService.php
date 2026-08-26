<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\User;
use App\Repositories\Interfaces\TeacherRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Services\Interfaces\ImageConverterInterface;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\Csv;
use PhpOffice\PhpSpreadsheet\Reader\Xls;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;

class TeacherService
{
    public function __construct(
        protected TeacherRepositoryInterface $teacherRepository,
        protected UserRepositoryInterface $userRepository,
        protected ImageConverterInterface $imageConverter
    ) {}

    public function importTeachersFromCsv(UploadedFile $file): array
    {
        try {
            $ext = strtolower($file->getClientOriginalExtension());
            if ($ext === 'xls') {
                $reader = new Xls;
            } elseif ($ext === 'xlsx') {
                $reader = new Xlsx;
            } elseif ($ext === 'csv' || $ext === 'txt') {
                $reader = new Csv;
                $firstLine = file_get_contents($file->getRealPath(), false, null, 0, 500);
                if ($firstLine && strpos($firstLine, ';') !== false) {
                    $reader->setDelimiter(';');
                } else {
                    $reader->setDelimiter(',');
                }
            } else {
                $reader = IOFactory::createReaderForFile($file->getRealPath());
            }

            $spreadsheet = $reader->load($file->getRealPath());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray(null, true, true, false);
        } catch (Exception $e) {
            throw new Exception('Gagal membaca berkas spreadsheet (CSV/Excel): '.$e->getMessage());
        }

        if (empty($rows)) {
            throw new Exception('Format berkas spreadsheet tidak valid atau kosong.');
        }

        $rawHeader = array_shift($rows);
        $header = array_map(function ($h) {
            return strtolower(trim(preg_replace('/\x{FEFF}/u', '', (string) $h)));
        }, $rawHeader);

        $nipIdx = array_search('nip', $header);
        $namaIdx = array_search('nama', $header);
        if ($namaIdx === false) {
            $namaIdx = array_search('name', $header);
        }
        $emailIdx = array_search('email', $header);
        $spesialisasiIdx = array_search('spesialisasi', $header);
        if ($spesialisasiIdx === false) {
            $spesialisasiIdx = array_search('specialization', $header);
        }
        $bioIdx = array_search('bio', $header);

        if ($nipIdx === false || $namaIdx === false || $emailIdx === false) {
            throw new Exception('Header berkas (CSV/Excel) harus memiliki kolom: nip, nama, email.');
        }

        $imported = 0;
        $skipped = 0;
        $errors = [];
        $rowNumber = 1;

        foreach ($rows as $row) {
            $rowNumber++;
            if (empty(array_filter($row, fn ($val) => ! is_null($val) && trim((string) $val) !== ''))) {
                continue;
            }

            $rawNip = isset($row[$nipIdx]) ? trim((string) $row[$nipIdx]) : '';
            $rawNama = isset($row[$namaIdx]) ? trim((string) $row[$namaIdx]) : '';
            $rawEmail = isset($row[$emailIdx]) ? trim((string) $row[$emailIdx]) : '';
            $rawSpesialisasi = ($spesialisasiIdx !== false && isset($row[$spesialisasiIdx])) ? trim((string) $row[$spesialisasiIdx]) : null;
            $rawBio = ($bioIdx !== false && isset($row[$bioIdx])) ? trim((string) $row[$bioIdx]) : null;

            // Handle Excel scientific notation (e.g. "1.23123123123123E+17") via string expansion to avoid float binary rounding artifacts
            $cleanNip = str_replace(['"', "'"], '', $rawNip);
            $cleanNip = preg_replace('/\.0+$/', '', $cleanNip);

            if (preg_match('/^(\d+)\.(\d+)[eE]\+(\d+)$/i', $cleanNip, $m)) {
                $integerPart = $m[1];
                $decimalPart = $m[2];
                $exponent = (int) $m[3];
                $combinedDigits = $integerPart.$decimalPart;
                $cleanNip = str_pad($combinedDigits, $exponent + strlen($integerPart), '0');
            } elseif (preg_match('/^[+-]?\d*(\.\d+)?[eE][+-]?\d+$/', $cleanNip)) {
                $cleanNip = sprintf('%.0f', (float) $cleanNip);
            }

            // Sanitize and limit lengths to prevent SQL truncation errors
            $nip = substr(trim(str_replace(' ', '', $cleanNip)), 0, 18);
            $nama = substr(trim(str_replace(['"', "'"], '', $rawNama)), 0, 255);
            $email = substr(trim(str_replace(['"', "'", ' '], '', $rawEmail)), 0, 255);
            $spesialisasi = $rawSpesialisasi ? substr(trim(str_replace(['"', "'"], '', $rawSpesialisasi)), 0, 255) : null;
            $bio = $rawBio ? substr(trim(str_replace(['"', "'"], '', $rawBio)), 0, 255) : null;

            if (empty($nip) || empty($nama) || empty($email)) {
                $errors[] = "Baris {$rowNumber}: NIP, nama, atau email kosong.";
                $skipped++;

                continue;
            }

            $existingUser = User::where('email', $email)->first();
            $existingTeacher = Teacher::where('nip', $nip)->first();

            if ($existingUser || $existingTeacher) {
                $errors[] = "Baris {$rowNumber}: NIP '{$nip}' atau Email '{$email}' sudah terdaftar.";
                $skipped++;

                continue;
            }

            try {
                DB::transaction(function () use ($nama, $email, $nip, $spesialisasi, $bio, &$imported) {
                    $user = User::create([
                        'nama' => $nama,
                        'email' => $email,
                        'kata_sandi' => Hash::make('password123'),
                        'peran' => 'guru',
                        'disetujui' => true,
                    ]);

                    Teacher::create([
                        'id_pengguna' => $user->id,
                        'nip' => $nip,
                        'spesialisasi' => $spesialisasi,
                        'bio' => $bio,
                    ]);

                    $imported++;
                });
            } catch (Exception $e) {
                $errors[] = "Baris {$rowNumber}: Gagal menyimpan data ({$e->getMessage()}).";
                $skipped++;
            }
        }

        return [
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors,
        ];
    }

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

    public function updateTeacher(array $data, string|int $userId)
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

    public function isProfileCompleted(string|int $userId): bool
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

    public function getTeacherByUserId(string|int $userId)
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
