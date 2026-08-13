<?php

namespace Tests\Unit;

use App\Services\Interfaces\ImageConverterInterface;
use App\Services\WebpImageConverterService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use Tests\TestCase;

class WebpImageConverterServiceTest extends TestCase
{
    protected ImageConverterInterface $converter;

    protected function setUp(): void
    {
        parent::setUp();
        $this->converter = new WebpImageConverterService;
        Storage::fake('public');
    }

    public function test_it_converts_jpg_uploaded_file_to_webp()
    {
        $file = UploadedFile::fake()->image('avatar.jpg', 100, 100);

        $outputPath = $this->converter->convertToWebp($file, 85);

        $this->assertFileExists($outputPath);
        $this->assertStringEndsWith('.webp', $outputPath);

        $info = getimagesize($outputPath);
        $this->assertEquals('image/webp', $info['mime']);

        @unlink($outputPath);
    }

    public function test_it_converts_png_uploaded_file_to_webp_preserving_transparency()
    {
        $file = UploadedFile::fake()->image('logo.png', 120, 120);

        $outputPath = $this->converter->convertToWebp($file, 90);

        $this->assertFileExists($outputPath);
        $this->assertStringEndsWith('.webp', $outputPath);

        $info = getimagesize($outputPath);
        $this->assertEquals('image/webp', $info['mime']);

        @unlink($outputPath);
    }

    public function test_it_converts_and_stores_image_to_storage_disk()
    {
        $file = UploadedFile::fake()->image('photo.png', 200, 200);

        $storedPath = $this->converter->convertAndStore($file, 'teachers/photos', 'public', 80);

        $this->assertStringStartsWith('teachers/photos/', $storedPath);
        $this->assertStringEndsWith('.webp', $storedPath);

        Storage::disk('public')->assertExists($storedPath);
    }

    public function test_it_throws_exception_for_invalid_file()
    {
        $this->expectException(InvalidArgumentException::class);

        $nonExistentPath = sys_get_temp_dir().'/invalid_dummy_file_12345.jpg';
        $this->converter->convertToWebp($nonExistentPath);
    }
}
