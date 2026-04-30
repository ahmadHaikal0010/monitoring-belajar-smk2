import { Form, Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import CleanLayout from '@/layouts/auth/clean-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-8">
            <Head title="Log in" />

            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Masuk ke Akun
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Monitoring Pembelajaran Siswa
                    <br />
                    SMK Negeri 2 Lubuk Basung
                </p>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="space-y-5"
            >
                {({ processing, hasErrors }) => (
                    <>
                        {hasErrors && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-900/20 dark:bg-red-900/10 dark:text-red-400"
                            >
                                <Mail className="h-5 w-5 flex-shrink-0" />
                                <span>
                                    Email atau kata sandi yang Anda masukkan
                                    salah.
                                </span>
                            </motion.div>
                        )}
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="ml-1 text-sm font-semibold text-foreground"
                            >
                                Email
                            </Label>
                            <div className="group relative">
                                <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="h-12 rounded-xl border-zinc-200 bg-white pl-12 text-base shadow-sm transition-all duration-200 focus:ring-4 focus:ring-primary/10 dark:border-zinc-800 dark:bg-zinc-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="ml-1 flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-semibold text-foreground"
                                >
                                    Kata Sandi
                                </Label>
                                {canResetPassword && (
                                    <Link
                                        href={request()}
                                        className="text-xs font-semibold text-primary transition-colors duration-200 hover:text-primary/80"
                                        tabIndex={5}
                                    >
                                        Lupa kata sandi?
                                    </Link>
                                )}
                            </div>
                            <div className="group relative">
                                <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-12 rounded-xl border-zinc-200 bg-white pr-12 pl-12 text-base shadow-sm transition-all duration-200 focus:ring-4 focus:ring-primary/10 dark:border-zinc-800 dark:bg-zinc-900"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 hover:text-primary focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    type="submit"
                                    className="h-12 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary/90"
                                    tabIndex={4}
                                    disabled={processing}
                                >
                                    {processing && (
                                        <Spinner className="mr-2 h-5 w-5 animate-spin" />
                                    )}
                                    Masuk
                                </Button>
                            </motion.div>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 rounded-xl border border-green-100 bg-green-50 py-3 text-center text-sm font-medium text-green-600 dark:border-green-900/30 dark:bg-green-900/20">
                    {status}
                </div>
            )}

            {canRegister && (
                <p className="text-center text-sm text-muted-foreground lg:hidden">
                    Belum punya akun?{' '}
                    <Link
                        href={register()}
                        className="font-bold text-primary transition-colors duration-200 hover:underline"
                    >
                        Daftar
                    </Link>
                </p>
            )}
        </div>
    );
}

Login.layout = (page: ReactNode) => <CleanLayout children={page} />;
