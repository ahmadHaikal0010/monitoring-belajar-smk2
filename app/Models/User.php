<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['nama', 'email', 'kata_sandi', 'peran', 'disetujui', 'email_diverifikasi_pada', 'name', 'password', 'role', 'is_approved', 'email_verified_at'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $table = 'pengguna';

    protected $fillable = [
        'nama',
        'email',
        'kata_sandi',
        'peran',
        'disetujui',
        'email_diverifikasi_pada',
        'name',
        'password',
        'role',
        'is_approved',
        'email_verified_at',
    ];

    protected $hidden = [
        'kata_sandi',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected $appends = [
        'name',
        'role',
        'is_approved',
        'email_verified_at',
    ];

    // Auth compatibility accessors
    public function getNameAttribute(): ?string
    {
        return $this->attributes['nama'] ?? null;
    }

    public function setNameAttribute($value): void
    {
        $this->attributes['nama'] = $value;
    }

    public function getPasswordAttribute(): ?string
    {
        return $this->attributes['kata_sandi'] ?? null;
    }

    public function setPasswordAttribute($value): void
    {
        if (is_null($value)) {
            return;
        }

        $this->attributes['kata_sandi'] = Hash::needsRehash($value) ? Hash::make($value) : $value;
    }

    public function getEmailVerifiedAtAttribute()
    {
        return $this->attributes['email_diverifikasi_pada'] ?? null;
    }

    public function setEmailVerifiedAtAttribute($value): void
    {
        $this->attributes['email_diverifikasi_pada'] = $value;
    }

    public function getAuthPasswordName(): string
    {
        return 'kata_sandi';
    }

    public function getAuthPassword(): string
    {
        return $this->kata_sandi;
    }

    public function getRoleAttribute(): ?string
    {
        return $this->attributes['peran'] ?? null;
    }

    public function setRoleAttribute($value): void
    {
        $this->attributes['peran'] = $value;
    }

    public function getIsApprovedAttribute(): bool
    {
        return (bool) ($this->attributes['disetujui'] ?? false);
    }

    public function setIsApprovedAttribute($value): void
    {
        $this->attributes['disetujui'] = (bool) $value;
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class, 'id_pengguna');
    }

    public function student()
    {
        return $this->hasOne(Student::class, 'id_pengguna');
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_diverifikasi_pada' => 'datetime',
            'disetujui' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
