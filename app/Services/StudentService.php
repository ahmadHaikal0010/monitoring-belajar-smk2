<?php

namespace App\Services;

use App\Repositories\Interfaces\StudentRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Services\Interfaces\ImageConverterInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class StudentService
{
    public function __construct(
        protected StudentRepositoryInterface $studentRepository,
        protected UserRepositoryInterface $userRepository,
        protected ImageConverterInterface $imageConverter
    ) {}

    public function getStudentByUserId(string|int $userId)
    {
        return $this->studentRepository->findByUserId($userId);
    }

    public function getStudentList(array $filters = [], int $perPage = 10)
    {
        return $this->studentRepository->getPaginated($filters, $perPage);
    }

    public function getAssignableUsers(array $filters = [], int $perPage = 10)
    {
        return $this->studentRepository->getAssignableUsers($filters, $perPage);
    }

    public function findStudent(string $id)
    {
        return $this->studentRepository->find($id);
    }

    public function createStudent(array $data)
    {
        $user = $this->userRepository->find($data['user_id']);

        if ($user->role !== 'siswa') {
            abort(422, 'User must have the siswa role to be assigned as a student.');
        }

        if (! empty($data['photo']) && $data['photo'] instanceof UploadedFile) {
            $data['photo'] = $this->storePhoto($data['photo']);
        }

        return $this->studentRepository->create($data);
    }

    public function updateStudentProfile(string|int $userId, array $data)
    {
        $student = $this->studentRepository->findByUserId($userId);

        if (! $student) {
            abort(404, 'Data siswa tidak ditemukan.');
        }

        DB::transaction(function () use ($userId, $student, $data) {
            $this->userRepository->update($userId, [
                'name' => $data['name'],
                'email' => $data['email'],
            ]);

            if (! empty($data['photo']) && $data['photo'] instanceof UploadedFile) {
                if ($student->photo) {
                    Storage::disk('public')->delete($student->photo);
                }

                $data['photo'] = $this->storePhoto($data['photo']);
            }

            $this->studentRepository->update($student->id, [
                'nisn' => $data['nisn'] ?? $student->nisn,
                'address' => $data['address'] ?? $student->address,
                'photo' => $data['photo'] ?? $student->photo,
            ]);
        });
    }

    public function updateByAdmin(array $data, string $id)
    {
        $student = $this->findStudent($id);

        if (! empty($data['photo']) && $data['photo'] instanceof UploadedFile) {
            if ($student->photo) {
                Storage::disk('public')->delete($student->photo);
            }

            $data['photo'] = $this->storePhoto($data['photo']);
        }

        return $this->studentRepository->update($id, $data);
    }

    public function deleteStudent(string $id)
    {
        $student = $this->findStudent($id);

        if ($student && $student->photo) {
            Storage::disk('public')->delete($student->photo);
        }

        return $this->studentRepository->delete($id);
    }

    private function storePhoto(UploadedFile $file)
    {
        return $this->imageConverter->convertAndStore($file, 'student-photos', 'public', 80);
    }

    public function updateStudent(string $studentId, array $data)
    {
        $student = $this->findStudent($studentId);

        if (! $student) {
            abort(404, 'Data siswa tidak ditemukan.');
        }

        DB::transaction(function () use ($student, $data) {
            if (! empty($data['name'])) {
                $userId = $student->user_id ?? $student->id_pengguna;

                $this->userRepository->update($userId, [
                    'nama' => $data['name'],
                    'name' => $data['name'],
                ]);
            }

            $updateFields = [
                'nisn' => $data['nisn'] ?? $student->nisn,
                'address' => $data['address'] ?? $student->address,
            ];

            if (! empty($data['photo']) && $data['photo'] instanceof UploadedFile) {
                if ($student->photo && Storage::disk('public')->exists($student->photo)) {
                    Storage::disk('public')->delete($student->photo);
                }

                $updateFields['photo'] = $this->storePhoto($data['photo']);
            }

            $this->studentRepository->update($student->id, $updateFields);
        });
    }

    public function importStudentsFromCsv(UploadedFile $file): array
    {
        $filePath = $file->getRealPath();

        // Deteksi otomatis separator (, atau ;)
        $firstLine = file_exists($filePath) ? fgets(fopen($filePath, 'r')) : '';
        $delimiter = (substr_count($firstLine, ';') > substr_count($firstLine, ',')) ? ';' : ',';

        $handle = fopen($filePath, 'r');
        if (! $handle) {
            throw new \Exception('Gagal membaca berkas CSV.');
        }

        $header = fgetcsv($handle, 1000, $delimiter, '"', '\\');
        if (! $header) {
            fclose($handle);
            throw new \Exception('Berkas CSV kosong.');
        }

        // Hapus BOM UTF-8 jika ada
        if (isset($header[0])) {
            $header[0] = preg_replace('/\x{EF}\x{BB}\x{BF}/u', '', $header[0]);
        }

        // Normalisasi header ke huruf kecil tanpa spasi
        $header = array_map(fn ($col) => strtolower(trim($col)), $header);

        $imported = 0;
        $skipped = [];
        $lineNumber = 1;

        while (($row = fgetcsv($handle, 1000, $delimiter, '"', '\\')) !== false) {
            $lineNumber++;

            if (empty(array_filter($row))) {
                continue;
            }

            if (count($row) < count($header)) {
                $row = array_pad($row, count($header), '');
            }

            $rowCombined = array_combine($header, array_map('trim', array_slice($row, 0, count($header))));

            // Ubah semua key baris ke huruf kecil untuk keamanan
            $rowData = [];
            foreach ($rowCombined as $key => $val) {
                $rowData[strtolower($key)] = $val;
            }

            $nama = $rowData['nama'] ?? null;
            $email = $rowData['email'] ?? null;
            $nisn = $rowData['nisn'] ?? null;
            $alamat = $rowData['alamat'] ?? '';
            $namaKelas = $rowData['kelas'] ?? null;

            if (! $nama || ! $email || ! $nisn) {
                $skipped[] = [
                    'line' => $lineNumber,
                    'data' => 'Nama: '.($nama ?: '-').', Email: '.($email ?: '-').', NISN: '.($nisn ?: '-'),
                    'reason' => 'Kolom nama, email, atau NISN tidak boleh kosong.',
                ];

                continue;
            }

            if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $skipped[] = [
                    'line' => $lineNumber,
                    'data' => "Nama: {$nama}, Email: {$email}",
                    'reason' => 'Format alamat email tidak valid.',
                ];

                continue;
            }

            if ($this->studentRepository->isEmailExists($email)) {
                $skipped[] = [
                    'line' => $lineNumber,
                    'data' => "Nama: {$nama}, Email: {$email}",
                    'reason' => "Email '{$email}' sudah terdaftar di sistem.",
                ];

                continue;
            }

            if ($this->studentRepository->isNisnExists($nisn)) {
                $skipped[] = [
                    'line' => $lineNumber,
                    'data' => "Nama: {$nama}, NISN: {$nisn}",
                    'reason' => "NISN '{$nisn}' sudah terdaftar di sistem.",
                ];

                continue;
            }

            $classId = null;
            if ($namaKelas) {
                $kelas = $this->studentRepository->findClassByName($namaKelas);
                if (! $kelas) {
                    $skipped[] = [
                        'line' => $lineNumber,
                        'data' => "Nama: {$nama}, Kelas: {$namaKelas}",
                        'reason' => "Kelas '{$namaKelas}' tidak ditemukan di database.",
                    ];

                    continue;
                }
                $classId = $kelas->id;
            }

            try {
                $this->studentRepository->createStudentWithUser(
                    [
                        'nama' => $nama,
                        'email' => $email,
                        'kata_sandi' => Hash::make('password123'),
                    ],
                    [
                        'nisn' => $nisn,
                        'alamat' => $alamat,
                    ],
                    $classId
                );
                $imported++;
            } catch (\Exception $e) {
                $skipped[] = [
                    'line' => $lineNumber,
                    'data' => "Nama: {$nama}, Email: {$email}, NISN: {$nisn}",
                    'reason' => 'Gagal menyimpan data: '.$e->getMessage(),
                ];
            }
        }

        fclose($handle);

        return [
            'imported' => $imported,
            'skipped_count' => count($skipped),
            'skipped_items' => $skipped,
        ];
    }
}
