import { Form, Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useState, ReactNode } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import CleanLayout from '@/layouts/auth/clean-layout';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-6">
            <Head title="Register" />

            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Buat Akun Baru
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
                            <Label htmlFor="name" className="text-foreground text-sm font-semibold ml-1">Nama Lengkap</Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    placeholder="Nama lengkap Anda"
                                    className="pl-12 h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-base shadow-sm"
                                />
                            </div>
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="email" className="text-foreground text-sm font-semibold ml-1">Email</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="pl-12 h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-base shadow-sm"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password" className="text-foreground text-sm font-semibold ml-1">Kata Sandi</Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="pl-12 pr-12 h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-base shadow-sm"
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

                        <div className="space-y-1">
                            <Label htmlFor="password_confirmation" className="text-foreground text-sm font-semibold ml-1">Konfirmasi Kata Sandi</Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="pl-12 h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-base shadow-sm"
                                />
                            </div>
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="pt-4">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base font-bold shadow-lg shadow-primary/25 rounded-xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground"
                                    tabIndex={5}
                                    disabled={processing}
                                >
                                    {processing && <Spinner className="mr-2 h-5 w-5 animate-spin" />}
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
                    className="font-bold text-primary hover:underline transition-colors duration-200"
                >
                    Masuk
                </Link>
            </p>
        </div>
    );
}

Register.layout = (page: ReactNode) => <CleanLayout children={page} />;
