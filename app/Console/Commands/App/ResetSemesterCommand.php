<?php

namespace App\Console\Commands\App;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ResetSemesterCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:reset-semester {--force : Memaksa penghapusan tanpa konfirmasi}';

    /**
     * The console command description.
     */
    protected $description = 'Mereset data mata pelajaran, materi, dan pendaftaran siswa untuk pergantian semester baru.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $force = $this->option('force');

        if (! $force && ! $this->confirm('Apakah Anda yakin ingin menghapus SELURUH data mata pelajaran, materi, dan pendaftaran? Tindakan ini tidak dapat dibatalkan.', false)) {
            $this->warn('Proses reset semester dibatalkan.');

            return;
        }

        $this->info('Memulai proses reset semester...');

        try {
            DB::transaction(function () {
                // 1. Bersihkan file materi fisik dari storage
                $this->info('Membersihkan file materi dari penyimpanan...');
                Storage::disk('public')->deleteDirectory('materials');

                // 2. Hapus seluruh data dari tabel subjects
                // Database cascading (onDelete cascade) akan otomatis menghapus:
                // - materials (DB records)
                // - enrollments (DB records)
                $this->info('Menghapus data mata pelajaran, materi, dan pendaftaran dari database...');
                DB::table('subjects')->delete();

                Log::info('Semester Reset: Seluruh data mata pelajaran, materi, dan pendaftaran telah dibersihkan oleh sistem.');
            });

            $this->info('Berhasil! Sistem telah bersih dan siap untuk semester baru.');
        } catch (\Exception $e) {
            Log::error('Semester Reset Failed: '.$e->getMessage());
            $this->error('Terjadi kesalahan saat mereset semester: '.$e->getMessage());
        }
    }
}
