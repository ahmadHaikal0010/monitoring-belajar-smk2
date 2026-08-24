import { Form, Head, Link } from '@inertiajs/react';
import { Eye, EyeOff, Lock, User, Mail, MapPin, Hash, GraduationCap, AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import CleanLayout from '@/layouts/auth/clean-layout';
import { store } from '@/routes/register';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="space-y-6">
            <Head title="Pendaftaran Akun Siswa" />

            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
                <div className="space-y-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Pendaftaran Akun Siswa
                        </h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Sistem Monitoring Belajar SMK Negeri 2 Lubuk Basung
                        </p>
                    </div>
                </div>

                <Form
                    {...store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                    className="space-y-4"
                >
                    {({ processing, hasErrors, errors }) => (
                        <>
                            {hasErrors && (
                                <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
                                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                                    <span>Mohon periksa kembali data pendaftaran yang Anda masukkan.</span>
                                </div>
                            )}

                            {/* Nama Lengkap */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                    Nama Lengkap Siswa
                                </Label>
                                <div className="relative">
                                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        required
                                        autoFocus
                                        placeholder="Contoh: Budi"
                                        className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pl-9 text-sm focus:bg-white dark:border-zinc-800 dark:bg-zinc-800/50 dark:focus:bg-zinc-900"
                                    />
                                </div>
                                {errors.name && <p className="text-[11px] text-rose-600">{errors.name}</p>}
                            </div>

                            {/* NISN */}
                            <div className="space-y-1.5">
                                <Label htmlFor="nisn" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                    NISN (10 Digit Angka)
                                </Label>
                                <div className="relative">
                                    <Hash className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <Input
                                        id="nisn"
                                        type="text"
                                        name="nisn"
                                        maxLength={10}
                                        required
                                        placeholder="0012345678"
                                        className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pl-9 text-sm focus:bg-white dark:border-zinc-800 dark:bg-zinc-800/50 dark:focus:bg-zinc-900 font-mono"
                                    />
                                </div>
                                {errors.nisn && <p className="text-[11px] text-rose-600">{errors.nisn}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                    Alamat Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="siswa@sekolah.sch.id"
                                        className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pl-9 text-sm focus:bg-white dark:border-zinc-800 dark:bg-zinc-800/50 dark:focus:bg-zinc-900"
                                    />
                                </div>
                                {errors.email && <p className="text-[11px] text-rose-600">{errors.email}</p>}
                            </div>

                            {/* Alamat */}
                            <div className="space-y-1.5">
                                <Label htmlFor="alamat" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                    Alamat Tempat Tinggal
                                </Label>
                                <div className="relative">
                                    <MapPin className="absolute top-3 left-3 h-4 w-4 text-zinc-400" />
                                    <Textarea
                                        id="alamat"
                                        name="alamat"
                                        required
                                        rows={2}
                                        placeholder="Jl. Lubuk Basung No. 12..."
                                        className="rounded-xl border-zinc-200 bg-zinc-50/50 pl-9 text-sm focus:bg-white dark:border-zinc-800 dark:bg-zinc-800/50 dark:focus:bg-zinc-900 resize-none"
                                    />
                                </div>
                                {errors.alamat && <p className="text-[11px] text-rose-600">{errors.alamat}</p>}
                            </div>

                            {/* Password */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                        Kata Sandi
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            placeholder="••••••••"
                                            className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pr-9 pl-9 text-sm focus:bg-white dark:border-zinc-800 dark:bg-zinc-800/50 dark:focus:bg-zinc-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none dark:hover:text-zinc-200"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-[11px] text-rose-600">{errors.password}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password_confirmation" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                        Konfirmasi Kata Sandi
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            placeholder="••••••••"
                                            className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pr-9 pl-9 text-sm focus:bg-white dark:border-zinc-800 dark:bg-zinc-800/50 dark:focus:bg-zinc-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none dark:hover:text-zinc-200"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="h-10 w-full rounded-xl bg-zinc-900 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                                    disabled={processing}
                                >
                                    {processing && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                                    Daftar Akun Siswa
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="border-t border-zinc-100 pt-4 text-center text-xs dark:border-zinc-800">
                    <span className="text-zinc-500 dark:text-zinc-400">Sudah memiliki akun? </span>
                    <Link
                        href="/login"
                        className="font-semibold text-zinc-900 underline hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
                    >
                        Masuk Portal
                    </Link>
                </div>
            </div>

            <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
                © Monitoring Belajar SMK Negeri 2 Lubuk Basung
            </p>
        </div>
    );
}

Register.layout = (page: ReactNode) => <CleanLayout children={page} />;
