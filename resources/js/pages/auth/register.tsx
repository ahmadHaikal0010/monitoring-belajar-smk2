import { Form, Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import CleanLayout from '@/layouts/auth/clean-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-6">
            <Head title="Register" />

            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Buat Akun Baru
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Daftar untuk mulai memantau pembelajaran siswa
                    <br />
                    SMK Negeri 2 Lubuk Basung
                </p>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                className="space-y-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-1">
                            <Label
                                htmlFor="name"
                                className="ml-1 text-sm font-semibold text-foreground"
                            >
                                Nama Lengkap
                            </Label>
                            <div className="group relative">
                                <User className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    placeholder="Nama lengkap Anda"
                                    className="h-11 rounded-xl border-zinc-200 bg-white pl-12 text-base shadow-sm transition-all duration-200 focus:ring-4 focus:ring-primary/10 dark:border-zinc-800 dark:bg-zinc-900"
                                />
                            </div>
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-1">
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
                                    tabIndex={2}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="h-11 rounded-xl border-zinc-200 bg-white pl-12 text-base shadow-sm transition-all duration-200 focus:ring-4 focus:ring-primary/10 dark:border-zinc-800 dark:bg-zinc-900"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-1">
                            <Label
                                htmlFor="password"
                                className="ml-1 text-sm font-semibold text-foreground"
                            >
                                Kata Sandi
                            </Label>
                            <div className="group relative">
                                <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="h-11 rounded-xl border-zinc-200 bg-white pr-12 pl-12 text-base shadow-sm transition-all duration-200 focus:ring-4 focus:ring-primary/10 dark:border-zinc-800 dark:bg-zinc-900"
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
                            <InputError message={errors.password} />
                        </div>

                        <div className="space-y-1">
                            <Label
                                htmlFor="password_confirmation"
                                className="ml-1 text-sm font-semibold text-foreground"
                            >
                                Konfirmasi Kata Sandi
                            </Label>
                            <div className="group relative">
                                <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="h-11 rounded-xl border-zinc-200 bg-white pl-12 text-base shadow-sm transition-all duration-200 focus:ring-4 focus:ring-primary/10 dark:border-zinc-800 dark:bg-zinc-900"
                                />
                            </div>
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <div className="pt-4">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    type="submit"
                                    className="h-11 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary/90"
                                    tabIndex={5}
                                    disabled={processing}
                                >
                                    {processing && (
                                        <Spinner className="mr-2 h-5 w-5 animate-spin" />
                                    )}
                                    Buat Akun
                                </Button>
                            </motion.div>
                        </div>
                    </>
                )}
            </Form>

            <p className="text-center text-sm text-muted-foreground lg:hidden">
                Sudah punya akun?{' '}
                <Link
                    href={login()}
                    className="font-bold text-primary transition-colors duration-200 hover:underline"
                >
                    Masuk
                </Link>
            </p>
        </div>
    );
}

Register.layout = (page: ReactNode) => <CleanLayout children={page} />;
