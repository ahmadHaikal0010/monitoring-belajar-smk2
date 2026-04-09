import { Form, Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import InputError from '@/components/input-error';
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
                <p className="text-sm text-muted-foreground leading-relaxed">
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
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground text-sm font-semibold ml-1">Email</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="pl-12 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-base shadow-sm"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <Label htmlFor="password" className="text-foreground text-sm font-semibold">Kata Sandi</Label>
                                {canResetPassword && (
                                    <Link href={request()} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors duration-200" tabIndex={5}>
                                        Lupa kata sandi?
                                    </Link>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="pl-12 pr-12 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-base shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <div className="pt-2">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 rounded-xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground"
                                    tabIndex={4}
                                    disabled={processing}
                                >
                                    {processing && <Spinner className="mr-2 h-5 w-5 animate-spin" />}
                                    Masuk
                                </Button>
                            </motion.div>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/20 py-3 rounded-xl border border-green-100 dark:border-green-900/30">
                    {status}
                </div>
            )}

            {canRegister && (
                <p className="text-center text-sm text-muted-foreground lg:hidden">
                    Belum punya akun?{' '}
                    <Link
                        href={register()}
                        className="font-bold text-primary hover:underline transition-colors duration-200"
                    >
                        Daftar
                    </Link>
                </p>
            )}
        </div>
    );
}

Login.layout = (page: ReactNode) => <CleanLayout children={page} />;
