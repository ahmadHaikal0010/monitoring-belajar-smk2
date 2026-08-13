<?php

namespace App\Services;

use App\Services\Interfaces\ImageConverterInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use RuntimeException;
use Symfony\Component\Uid\Uuid;

class WebpImageConverterService implements ImageConverterInterface
{
    /**
     * Convert an uploaded image file or local file path to WebP format.
     */
    public function convertToWebp(UploadedFile|string $file, int $quality = 80, ?string $customFilename = null): string
    {
        $quality = max(1, min(100, $quality));
        $filePath = $file instanceof UploadedFile ? $file->getRealPath() : $file;

        if (! file_exists($filePath) || ! is_readable($filePath)) {
            throw new InvalidArgumentException("File gambar tidak ditemukan atau tidak dapat dibaca: {$filePath}");
        }

        $imageInfo = @getimagesize($filePath);
        if ($imageInfo === false) {
            throw new InvalidArgumentException("File bukan merupakan format gambar yang valid: {$filePath}");
        }

        $mimeType = $imageInfo['mime'];
        $image = $this->createGdImageFromMime($filePath, $mimeType);

        if (! $image) {
            throw new RuntimeException("Gagal mengolah file gambar dengan tipe MIME: {$mimeType}");
        }

        // Retain alpha channel transparency for PNG / GIF / WebP
        imagealphablending($image, false);
        imagesavealpha($image, true);

        $tempDir = sys_get_temp_dir();
        $filename = ($customFilename ?: (string) Uuid::v7()).'.webp';
        $outputPath = $tempDir.DIRECTORY_SEPARATOR.$filename;

        $result = @imagewebp($image, $outputPath, $quality);
        imagedestroy($image);

        if (! $result || ! file_exists($outputPath)) {
            throw new RuntimeException('Gagal melakukan konversi gambar ke format WebP.');
        }

        return $outputPath;
    }

    /**
     * Convert an image to WebP format and store it directly in Laravel Storage disk.
     */
    public function convertAndStore(UploadedFile|string $file, string $directory, string $disk = 'public', int $quality = 80): string
    {
        $tempWebpPath = $this->convertToWebp($file, $quality);

        try {
            $filename = (string) Uuid::v7().'.webp';
            $targetPath = trim($directory, '/').'/'.$filename;

            $fileContents = file_get_contents($tempWebpPath);
            if ($fileContents === false) {
                throw new RuntimeException('Gagal membaca file WebP sementara.');
            }

            Storage::disk($disk)->put($targetPath, $fileContents);

            return $targetPath;
        } finally {
            if (file_exists($tempWebpPath)) {
                @unlink($tempWebpPath);
            }
        }
    }

    /**
     * Create GD Image resource based on file MIME type.
     */
    protected function createGdImageFromMime(string $filePath, string $mimeType)
    {
        return match ($mimeType) {
            'image/jpeg', 'image/jpg' => @imagecreatefromjpeg($filePath),
            'image/png' => @imagecreatefrompng($filePath),
            'image/gif' => @imagecreatefromgif($filePath),
            'image/webp' => @imagecreatefromwebp($filePath),
            'image/bmp', 'image/x-ms-bmp' => function_exists('imagecreatefrombmp') ? @imagecreatefrombmp($filePath) : @imagecreatefromstring((string) file_get_contents($filePath)),
            default => @imagecreatefromstring((string) file_get_contents($filePath)),
        };
    }
}
