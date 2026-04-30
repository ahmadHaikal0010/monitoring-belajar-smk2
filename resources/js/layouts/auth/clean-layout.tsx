import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

export default function CleanLayout({ children }: { children: ReactNode }) {
    const { url } = usePage();
    const isRegister = url.startsWith('/register');

    return (
        <div className="flex min-h-screen overflow-hidden bg-background font-sans">
            {/* Decorative Panel - This will slide smoothly because it's persistent */}
            <motion.div
                layout
                transition={{
                    layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
                    opacity: { duration: 0.4 },
                }}
                className="relative z-20 hidden items-center justify-center overflow-hidden bg-primary lg:flex lg:w-1/2"
                style={{ order: isRegister ? 2 : 1 }}
            >
                {/* Moving Background Circles */}
                <div className="absolute inset-0 opacity-20">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute top-20 left-20 h-72 w-72 rounded-full border border-primary-foreground/30"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.15, 1], rotate: [0, -3, 0] }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 1,
                        }}
                        className="absolute right-16 bottom-32 h-96 w-96 rounded-full border border-primary-foreground/20"
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={isRegister ? 'reg-text' : 'log-text'}
                        initial={{ opacity: 0, x: isRegister ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRegister ? -20 : 20 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10 max-w-md px-12 text-center text-primary-foreground"
                    >
                        <h1 className="mb-4 text-4xl font-bold tracking-tight">
                            {isRegister
                                ? 'Sudah Punya Akun?'
                                : 'Selamat Datang'}
                        </h1>
                        <p className="mb-8 text-lg leading-relaxed opacity-80">
                            {isRegister
                                ? 'Masuk ke akun Anda untuk kembali memantau progres pembelajaran siswa.'
                                : 'Daftar untuk mulai menggunakan Dashboard Monitoring Pembelajaran Siswa.'}
                        </p>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                href={isRegister ? '/login' : '/register'}
                                className="inline-flex h-12 items-center justify-center rounded-full border border-primary-foreground/40 bg-transparent px-8 text-base text-primary-foreground transition-all duration-300 hover:bg-primary-foreground/10"
                            >
                                {isRegister ? 'Masuk' : 'Daftar Sekarang'}
                            </Link>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Form Panel */}
            <motion.div
                layout
                transition={{
                    layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
                }}
                className="z-10 flex w-full items-center justify-center px-6 py-12 lg:w-1/2"
                style={{ order: isRegister ? 1 : 2 }}
            >
                <div className="w-full max-w-sm">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={url}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
