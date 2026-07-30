import { Form, Head, Link } from '@inertiajs/react';
import { Eye, EyeOff, Mail, Lock, GraduationCap, AlertCircle, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import CleanLayout from '@/layouts/auth/clean-layout';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({
    status,
    canResetPassword,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-6">
            <Head title="Masuk Portal Web" />

            {/* Clean Card Container */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Masuk Portal Web
                        </h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Sistem Monitoring Belajar SMK Negeri 2 Lubuk Basung
                        </p>
                    </div>
                </div>

                {/* Minimalist Mobile Notice */}
                <div className="flex items-start gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3.5 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                    <Info className="h-4 w-4 shrink-0 text-zinc-500 mt-0.5" />
                    <div>
                        Portal ini khusus untuk <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Guru & Administrator</strong>.
                    </div>
                </div>

                {/* Status Message */}
                {status && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-center text-xs font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {status}
                    </div>
                )}

                {/* Form */}
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="space-y-4"
                >
                    {({ processing, hasErrors }) => (
                        <>
                            {hasErrors && (
                                <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
                                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                                    <span>Email atau kata sandi yang Anda masukkan tidak cocok.</span>
                                </div>
                            )}

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
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="nama@email.com"
                                        className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pl-9 text-sm focus:bg-white dark:border-zinc-800 dark:bg-zinc-800/50 dark:focus:bg-zinc-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <Link
                                            href={request()}
                                            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                            tabIndex={5}
                                        >

                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={2}
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
                                    tabIndex={4}
                                    disabled={processing}
                                >
                                    {processing && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                                    Masuk ke Portal
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

Login.layout = (page: ReactNode) => <CleanLayout children={page} />;
