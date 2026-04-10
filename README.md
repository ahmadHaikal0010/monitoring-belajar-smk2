# Monitoring Belajar SMK (Simona SMK)

[![Laravel Version](https://img.shields.io/badge/Laravel-13.x-red.svg)](https://laravel.com)
[![React Version](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev)
[![Inertia Version](https://img.shields.io/badge/Inertia.js-v3-green.svg)](https://inertiajs.com)

**Simona SMK** (Sistem Informasi Monitoring Progres Belajar SMK) adalah platform manajemen pembelajaran dan monitoring akademik yang dirancang khusus untuk lingkungan Sekolah Menengah Kejuruan (SMK). Aplikasi ini bertujuan untuk memberikan transparansi progres belajar siswa kepada guru secara real-time.

Aplikasi ini merupakan bagian dari **Tugas Akhir** oleh **Ahmad Haikal**.

---

## 🌟 Fitur Utama

### 1. Multi-Role & Authentication
*   **Role-Based Access Control:** Tersedia peran untuk **Admin**, **Guru**, dan **Siswa**.
*   **Secure Auth:** Didukung oleh **Laravel Fortify** dengan fitur Two-Factor Authentication (2FA).
*   **Approval System:** Akun baru (terutama siswa) memerlukan persetujuan dari admin sebelum dapat mengakses dashboard penuh.

### 2. Monitoring Akademik (Guru)
*   **Dashboard Statistik:** Ringkasan jumlah siswa, guru, mata pelajaran, dan materi.
*   **Tracking Progres:** Memantau persentase penyelesaian materi tiap siswa secara mendetail.
*   **Log Aktivitas:** Melihat kapan terakhir kali siswa mengakses materi tertentu (Video, Dokumen, atau URL).

### 3. Manajemen Pembelajaran
*   **Mata Pelajaran:** Pengelolaan kurikulum mata pelajaran SMK.
*   **Materi Multimedia:** Guru dapat mengunggah materi dalam format Dokumen, Video, atau Link URL eksternal.
*   **Status Belajar:** Sistem otomatis melacak status materi (*Not Started*, *In Progress*, *Completed*).

### 4. Manajemen Data Diri
*   **Profil Guru:** Validasi NIP (18 karakter) dan spesialisasi keahlian.
*   **Profil Siswa:** Manajemen NIS dan penempatan kelas (X, XI, XII).
*   **Upload Foto:** Sistem penyimpanan foto profil dengan integrasi storage symlink.

---

## 🛠️ Stack Teknologi

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

## 🏗️ Arsitektur Aplikasi

Proyek ini mengikuti prinsip **Clean Code** dan **SOLID** dengan implementasi:
*   **Repository Pattern:** Memisahkan logika query database dari logika bisnis utama.
*   **Service Layer:** Menangani koordinasi antar entitas dan logika bisnis yang kompleks.
*   **Single Page Application (SPA):** Memberikan pengalaman pengguna yang mulus tanpa reload halaman berkat Inertia.js.

---

## 📂 Gambaran Database

Aplikasi memiliki struktur tabel utama sebagai berikut:
*   `users`: Data kredensial dan role.
*   `teachers` / `students`: Detail profil spesifik tiap role.
*   `subjects`: Daftar mata pelajaran.
*   `materials`: Konten pembelajaran yang diunggah guru.
*   `learning_progress`: Tracking progres per-materi untuk tiap siswa.
*   `student_activities`: Log aktivitas detail (misal: kapan menonton video).

---

## 🚀 Instalasi

1.  **Clone repo:**
    ```bash
    git clone https://github.com/username/monitoring-belajar-smk2.git
    cd monitoring-belajar-smk2
    ```

2.  **Instalasi dependensi:**
    ```bash
    composer install
    npm install
    ```

3.  **Konfigurasi Environment:**
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

4.  **Migrasi & Seed:**
    ```bash
    php artisan migrate --seed
    ```

5.  **Persiapan Storage:**
    ```bash
    php artisan storage:link
    ```

6.  **Jalankan Aplikasi:**
    ```bash
    # Tab terminal 1
    php artisan serve
    
    # Tab terminal 2
    npm run dev
    ```

---

## ✍️ Author

**Ahmad Haikal**
