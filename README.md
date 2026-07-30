# Monitoring Belajar SMK (Simona SMK)

[![Laravel Version](https://img.shields.io/badge/Laravel-13.x-red.svg)](https://laravel.com)
[![React Version](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev)
[![Inertia Version](https://img.shields.io/badge/Inertia.js-v3-green.svg)](https://inertiajs.com)

**Simona SMK** (Sistem Informasi Monitoring Progres Belajar SMK) adalah platform manajemen pembelajaran, monitoring akademik, dan pelaksanaan ujian online yang dirancang khusus untuk lingkungan Sekolah Menengah Kejuruan (SMK). Aplikasi ini memberikan transparansi progres belajar dan evaluasi siswa kepada guru secara real-time.

Aplikasi ini merupakan bagian dari **Tugas Akhir** oleh **Ahmad Haikal**.

---

##  Arsitektur Proyek & Batasan Scope

Aplikasi ini dikembangkan dengan sistem **Hybrid Architecture**:

1. **Web Dashboard (Platform Ini):**
   - **Target Pengguna:** Hanya **Administrator** dan **Guru**.
   - **Fungsi:** Manajemen data user, kurikulum (mapel), materi pembelajaran, bank soal/ujian, dan monitoring progres & hasil ujian siswa.
   - **Teknologi:** Laravel 13, Inertia.js v3, dan React 19.
2. **Mobile App (Client Siswa):**
   - **Target Pengguna:** **Siswa**.
   - **Fungsi:** Mengakses materi, mengerjakan tugas & ujian, menyimpan jawaban real-time, dan melihat laporan hasil belajar.
   - **Koneksi:** Terhubung melalui REST API Sanctum yang disediakan oleh server ini.

> **Penting:** Website ini **TIDAK** ditujukan untuk akses siswa. Seluruh instruksi, bahasa, dan alur kerja di web ini dirancang secara profesional untuk kebutuhan manajemen sekolah.

---

##  Fitur Utama

### 1. Multi-Role & Authentication
* **Role-Based Access Control:** Tersedia peran untuk **Admin**, **Guru**, dan **Siswa**.
* **Secure Auth:** Didukung oleh **Laravel Fortify** dengan fitur Two-Factor Authentication (2FA).
* **Approval System:** Akun baru (terutama siswa) memerlukan persetujuan dari admin sebelum dapat mengakses dashboard penuh.

### 2. Monitoring Akademik & Progres Siswa (Guru)
* **Dashboard Statistik:** Ringkasan jumlah siswa, guru, mata pelajaran, materi, dan pendaftaran.
* **Tracking Progres:** Memantau persentase penyelesaian materi tiap siswa secara mendetail.
* **Laporan Evaluasi Ujian:** Menampilkan daftar nilai ujian, status KKM, kelulusan, dan riwayat pengerjaan siswa pada halaman progres enrollment.

### 3. Manajemen Pembelajaran & Materi
* **Mata Pelajaran:** Pengelolaan kurikulum mata pelajaran SMK.
* **Materi Multimedia:** Guru dapat mengunggah materi dalam format Dokumen, Video, atau Link URL eksternal.
* **Status Belajar:** Sistem otomatis melacak status materi (*Not Started*, *In Progress*, *Completed*).

### 4. Sistem Ujian & Bank Soal (Exams)
* **Manajemen Soal (Web Dashboard):** Penyusunan bank soal Pilihan Ganda & Essay, bobot poin, upload gambar pendukung soal, dan pengait materi pembelajaran untuk rekomendasi remedial.
* **Pengaturan Akses & KKM:** Pengacakan urutan soal & opsi jawaban, penetapan nilai KKM, serta pengaturan jadwal buka & tutup ujian (`Asia/Jakarta`).
* **Sesi Pengerjaan Real-time (Mobile API):** Penyimpanan jawaban real-time per-soal, fitur resume ujian saat kendala jaringan, perhitungan waktu server presisi, dan rekomendasi materi terkait.

### 5. Fitur Tugas Siswa & Penilaian Manual (Assignments)
* **Manajemen Tugas (Web Dashboard):** Guru dapat membuat tugas baru, menentukan deskripsi instruksi, tenggat waktu pengumpulan, nilai maksimal, dan tipe berkas yang diterima (Bulk foto/gambar & dokumen PDF).
* **Penilaian Manual Guru:** Guru dapat memeriksa hasil pekerjaan siswa (melihat galeri bulk foto & file PDF), membaca catatan siswa, serta memasukkan nilai angka secara **manual** beserta masukan/feedback.
* **Integrasi Progres Pendaftaran:** Hasil tugas siswa langsung terintegrasi secara otomatis pada halaman progres belajar siswa dengan tampilan Tab Navigation yang teratur.

### 6. Manajemen Data Diri
* **Profil Guru:** Validasi NIP (18 karakter) dan spesialisasi keahlian.
* **Profil Siswa:** Manajemen NIS dan penempatan kelas (X, XI, XII).
* **Upload Foto:** Sistem penyimpanan foto profil dengan integrasi storage symlink.

---

##  Stack Teknologi

| Komponen | Teknologi |
| :--- | :--- |
| **Framework Backend** | Laravel 13 (PHP 8.4) |
| **Library Frontend** | React 19 (TypeScript) |
| **Bridge** | Inertia.js v3 |
| **Styling** | TailwindCSS v4 & Shadcn UI |
| **Icons** | Lucide React |
| **Database** | MySQL |
| **Routing** | Laravel Wayfinder (Type-safe Routes) |

---

##  Instalasi & Persiapan

1. **Clone repo:**
    ```bash
    git clone https://github.com/username/monitoring-belajar-smk2.git
    cd monitoring-belajar-smk2
    ```

2. **Instalasi dependensi:**
    ```bash
    composer install
    npm install
    ```

3. **Konfigurasi Environment:**
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

4. **Migrasi & Seed:**
    ```bash
    php artisan migrate --seed
    ```

5. **Persiapan Storage Symlink:**
    ```bash
    php artisan storage:link
    ```

6. **Jalankan Aplikasi:**
    ```bash
    # Tab terminal 1
    php artisan serve
    
    # Tab terminal 2
    npm run dev
    ```

---

##  Author

**Ahmad Haikal**
