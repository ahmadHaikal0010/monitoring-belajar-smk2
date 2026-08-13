<?php

namespace App\Services\Interfaces;

use Illuminate\Http\UploadedFile;

interface ImageConverterInterface
{
    /**
     * Convert an uploaded image file or local file path to WebP format.
     *
     * @param  UploadedFile|string  $file  Uploaded file instance or file path string.
     * @param  int  $quality  WebP compression quality (1-100). Default is 80.
     * @param  string|null  $customFilename  Optional custom filename without extension.
     * @return string Absolute file path of the converted temporary WebP file.
     */
    public function convertToWebp(UploadedFile|string $file, int $quality = 80, ?string $customFilename = null): string;

    /**
     * Convert an image to WebP format and store it directly in Laravel Storage disk.
     *
     * @param  UploadedFile|string  $file  Uploaded file instance or file path string.
     * @param  string  $directory  Storage directory path (e.g. 'photos', 'questions').
     * @param  string  $disk  Storage disk (default: 'public').
     * @param  int  $quality  WebP compression quality (1-100). Default is 80.
     * @return string Relative storage path of stored WebP file.
     */
    public function convertAndStore(UploadedFile|string $file, string $directory, string $disk = 'public', int $quality = 80): string;
}
