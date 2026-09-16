# Monitoring Belajar SMK (Simona SMK)

[![Laravel Version](https://img.shields.io/badge/Laravel-13.x-red.svg)](https://laravel.com)
[![React Version](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev)
[![Inertia Version](https://img.shields.io/badge/Inertia.js-v3-green.svg)](https://inertiajs.com)
[![TailwindCSS Version](https://img.shields.io/badge/TailwindCSS-v4-blueviolet.svg)](https://tailwindcss.com)

**Simona SMK** (Sistem Informasi Monitoring Progres Belajar SMK) adalah platform manajemen pembelajaran, monitoring akademik, dan pelaksanaan ujian online yang dirancang khusus untuk lingkungan Sekolah Menengah Kejuruan (SMK). Platform ini memberikan transparansi progres belajar, manajemen kelas/rombel, serta evaluasi ujian siswa secara real-time.

Aplikasi ini merupakan bagian dari **Tugas Akhir** oleh **Ahmad Haikal**.

---

## 🏗️ Arsitektur Proyek

Aplikasi ini dikembangkan dengan pendekatan **Multi-Channel Architecture**:

1. **Web Platform (Utama):**
   - **Target Pengguna:** **Administrator**, **Guru**, dan **Siswa** (Portal Web Siswa).
   - **Fungsi:** 
     - **Admin:** Manajemen data user, import massal guru via CSV, manajemen Jurusan (Major), Rombel/Kelas (Classroom), dan penempatan siswa (Enrollment).
     - **Guru:** Manajemen kurikulum & mata pelajaran, penyusunan materi & bank soal, penilaian tugas manual (bulk foto & PDF), monitoring progres siswa per kelas, dan ekspor laporan nilai.
     - **Siswa:** Katalog mata pelajaran, pembaca materi interaktif, pengumpulan tugas, pengerjaan ujian online berbasis web real-time, dan edit profil data diri.
   - **Teknologi:** Laravel 13, Inertia.js v3, dan React 19.
2. **Mobile App (Client Siswa):**
   - **Target Pengguna:** **Siswa**.
   - **Fungsi:** Mengakses materi, mengerjakan tugas & ujian online, penyimpanan jawaban real-time, dan melihat laporan hasil belajar.
   - **Koneksi:** Terhubung melalui REST API Sanctum yang disediakan oleh server ini.

---

## ✨ Fitur Utama

### 1. Multi-Role & Autentikasi Modern
* **Role-Based Access Control:** Hak akses yang teratur untuk **Admin**, **Guru**, dan **Siswa**.
* **Keamanan Akun:** Didukung oleh **Laravel Fortify** dengan opsi Two-Factor Authentication (2FA) dan dukungan fitur *Remember Me* untuk sesi login yang nyaman dan aman.
* **Approval System:** Akun siswa baru memerlukan persetujuan dari admin sebelum dapat mengakses seluruh fitur pembelajaran.

### 2. Portal Siswa Web (Student Web Portal) 🎓
* **Katalog Mata Pelajaran:** Siswa dapat menjelajahi daftar mata pelajaran yang diikuti sesuai jurusan dan kelas.
* **Pembaca Materi Interaktif:** Mendukung tampilan dokumen, pemutar video pembelajaran, dan tautan eksternal lengkap dengan fitur *"Tandai Selesai"*.
* **Pengumpulan Tugas Flexibel:** Siswa dapat mengunggah tugas dalam bentuk galeri banyak foto (*bulk images*) maupun berkas PDF dilengkapi catatan siswa.
* **Ujian Online Real-time:** Sesi pengerjaan ujian berbasis web dengan hitung mundur waktu server (`Asia/Jakarta`), penyimpanan otomatis jawaban (*auto-save*), penandaan soal (*flagging*), serta analisis hasil ujian beserta rekomendasi materi remedial jika terdapat jawaban salah.
* **Profil Siswa:** Pengaturan data pribadi dan unggah pasfoto/avatar siswa.

### 3. Manajemen Jurusan, Rombel & Kelas (Admin) 🏫
* **Kelola Jurusan (Majors):** Pengelolaan data jurusan/program keahlian di sekolah.
* **Kelola Rombel (Classrooms):** Pengelolaan kelas/rombel lengkap dengan tingkatan (X, XI, XII), jurusan, dan penunjukan Wali Kelas.
* **Penempatan Siswa (Class Enrollment):** Fitur alokasi dan pemindahan siswa ke dalam kelas/rombel secara efisien per tahun ajaran.

### 4. Import Massal Guru via CSV 📥
* **Import Data Guru:** Kemudahan pendaftaran akun guru secara massal menggunakan berkas CSV.
* **Template Standardized:** Tersedia fitur unduh template CSV standar untuk mempermudah pengisian data guru.

### 5. Monitoring Akademik & Evaluasi (Guru) 📊
* **Centralized Subject Workspace (`/teacher/subjects/{id}`):** Seluruh manajemen materi, tugas, ujian, dan progres siswa terintegrasi dalam satu tampilan sub-rute per kelas yang rapi.
* **Tracking Progres Real-time:** Visualisasi persentase penyelesaian materi dan pencarian siswa berbasis nama, NISN, atau email.
* **Ekspor Laporan (Excel & Print):** Fitur ekspor rekapitulasi progres belajar dan nilai siswa per kelas ke format Excel (`.xls`) atau tampilan siap cetak (*print-friendly HTML*).
* **Salin Konten Antar-Kelas:** Kemudahan menyalin materi, tugas, dan ujian dari satu kelas ke kelas lainnya.

### 6. Sistem Ujian & Bank Soal (Exams) 📝
* **Manajemen Bank Soal:** Penyusunan soal Pilihan Ganda & Essay, pengacakan opsi & urutan soal, bobot nilai, serta pengait materi rekomendasi remedial.
* **Pengaturan Akses & KKM:** Penetapan batas nilai KKM dan jadwal buka/tutup ujian otomatis berdasarkan zona waktu server.

### 7. Pengumpulan & Penilaian Tugas (Assignments) 📂
* **Penilaian Manual Guru:** Antarmuka khusus bagi guru untuk memeriksa kiriman tugas siswa, galeri foto, PDF viewer, serta input nilai dan masukan/feedback.

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

## 🚀 Instalasi & Persiapan

1. **Clone Repository:**
    ```bash
    git clone https://github.com/username/monitoring-belajar-smk2.git
    cd monitoring-belajar-smk2
    ```

2. **Instalasi Dependensi:**
    ```bash
    composer install
    npm install
    ```

3. **Konfigurasi Environment:**
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

4. **Migrasi & Seed Database:**
    ```bash
    php artisan migrate --seed
    ```

5. **Persiapan Storage Symlink:**
    ```bash
    php artisan storage:link
    ```

6. **Jalankan Aplikasi Development:**
    ```bash
    # Tab terminal 1: Server Backend Laravel
    php artisan serve
    
    # Tab terminal 2: Frontend Asset Bundler
    npm run dev
    ```

---

## 👤 Author

**Ahmad Haikal**
