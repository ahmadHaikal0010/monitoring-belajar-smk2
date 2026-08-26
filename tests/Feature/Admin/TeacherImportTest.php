<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class TeacherImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_download_csv_template()
    {
        $admin = User::factory()->create([
            'peran' => 'admin',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.teachers.import-template'));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    public function test_admin_can_import_teachers_from_csv()
    {
        $admin = User::factory()->create([
            'peran' => 'admin',
        ]);

        $csvContent = "nip,nama,email,spesialisasi,bio\n"
            ."199501012023011001,Budi Rahardjo,budirahardjo@example.com,TKJ,Guru TKJ\n"
            ."199602022023012002,Siti Aminah,sitiaminah@example.com,RPL,Guru RPL\n";

        $file = UploadedFile::fake()->createWithContent('guru.csv', $csvContent);

        $response = $this->actingAs($admin)->post(route('admin.teachers.import'), [
            'file' => $file,
        ]);

        $response->assertRedirect(route('admin.teachers.index'));

        $this->assertDatabaseHas('pengguna', [
            'email' => 'budirahardjo@example.com',
            'nama' => 'Budi Rahardjo',
            'peran' => 'guru',
        ]);

        $this->assertDatabaseHas('guru', [
            'nip' => '199501012023011001',
            'spesialisasi' => 'TKJ',
        ]);

        $this->assertDatabaseHas('pengguna', [
            'email' => 'sitiaminah@example.com',
            'nama' => 'Siti Aminah',
            'peran' => 'guru',
        ]);

        $this->assertDatabaseHas('guru', [
            'nip' => '199602022023012002',
            'spesialisasi' => 'RPL',
        ]);
    }

    public function test_import_handles_long_nip_gracefully()
    {
        $admin = User::factory()->create([
            'peran' => 'admin',
        ]);

        $csvContent = "nip,nama,email,spesialisasi,bio\n"
            ."1995010120230110019999,Guru NIP Panjang,longnip@example.com,Multi,Guru\n";

        $file = UploadedFile::fake()->createWithContent('guru_long.csv', $csvContent);

        $response = $this->actingAs($admin)->post(route('admin.teachers.import'), [
            'file' => $file,
        ]);

        $response->assertRedirect(route('admin.teachers.index'));

        $this->assertDatabaseHas('guru', [
            'nip' => '199501012023011001',
        ]);
    }

    public function test_import_converts_excel_scientific_notation_nip()
    {
        $admin = User::factory()->create([
            'peran' => 'admin',
        ]);

        // Scientific notation string exported by Excel
        $csvContent = "nip,nama,email,spesialisasi,bio\n"
            ."1.99501012023011E+17,Guru Eksponen,exponent@example.com,TKJ,Guru\n";

        $file = UploadedFile::fake()->createWithContent('guru_exp.csv', $csvContent);

        $response = $this->actingAs($admin)->post(route('admin.teachers.import'), [
            'file' => $file,
        ]);

        $response->assertRedirect(route('admin.teachers.index'));

        $this->assertDatabaseHas('guru', [
            'nip' => '199501012023010000',
        ]);
    }
}
