import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, Lock, GraduationCap, AlertCircle, ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import CleanLayout from '@/layouts/auth/clean-layout';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-6">
            <Head title="Konfirmasi Kata Sandi" />

            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Konfirmasi Kata Sandi
                        </h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Sistem Monitoring Belajar SMK Negeri 2 Lubuk Basung
                        </p>
                    </div>
                </div>

                {/* Security Info Notice */}
                <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                        Ini adalah area terproteksi. Silakan masukkan kata sandi Anda untuk melanjutkan.
                    </div>
                </div>

                {/* Form */}
                <Form {...store.form()} resetOnSuccess={['password']} className="space-y-4">
                    {({ processing, errors, hasErrors }) => (
                        <>
                            {hasErrors && (
                                <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
                                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                                    <span>{errors.password || 'Kata sandi yang Anda masukkan salah.'}</span>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                    Kata Sandi Saat Ini
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoFocus
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pr-9 pl-9 text-sm focus:bg-white dark:border-zinc-800 dark:bg-zinc-800/50 dark:focus:bg-zinc-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none dark:hover:text-zinc-200"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="h-10 w-full rounded-xl bg-zinc-900 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                                    disabled={processing}
                                >
                                    {processing && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                                    Konfirmasi Kata Sandi
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            {/* Footer Copyright */}
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
                © Monitoring Belajar SMK Negeri 2 Lubuk Basung
            </p>
        </div>
    );
}

ConfirmPassword.layout = (page: ReactNode) => <CleanLayout children={page} />;
