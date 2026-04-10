import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Image as ImageIcon, AlertCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/teacher';
import type { Auth } from '@/types/auth';

export default function CreateTeacher() {
    const { auth } = usePage().props as { auth: Auth };
    
    const { data, setData, post, processing, errors, hasErrors } = useForm({
        nip: '',
        specialization: '',
        photo: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            forceFormData: true, // Memastikan pengiriman data multipart/form-data untuk upload foto
        });
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
            <Head title="Lengkapi Profil Guru" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                {hasErrors && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>Ada kesalahan pada formulir. Silakan periksa kembali data Anda.</span>
                    </motion.div>
                )}

                <Card className="border-none shadow-2xl bg-card/70 backdrop-blur-xl">
                    <CardHeader className="space-y-2 text-center pb-8 border-b bg-muted/30 rounded-t-xl">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 rotate-3 hover:rotate-0 transition-transform duration-300 shadow-inner">
                            <GraduationCap className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-extrabold tracking-tight">Halo, {auth.user.name}!</CardTitle>
                        <CardDescription className="text-base font-medium">
                            Hampir selesai! Silakan lengkapi profil guru Anda untuk memulai.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2 group">
                                <Label htmlFor="nip" className="flex items-center gap-2 text-sm font-semibold ml-1 group-focus-within:text-primary transition-colors">
                                    <Briefcase className="w-4 h-4" />
                                    NIP (Nomor Induk Pegawai)
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="nip"
                                        name="nip"
                                        value={data.nip}
                                        onChange={(e) => setData('nip', e.target.value)}
                                        placeholder="Contoh: 198001012005011001"
                                        className="h-12 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                                        required
                                    />
                                </div>
                                <InputError message={errors.nip} />
                            </div>

                            <div className="space-y-2 group">
                                <Label htmlFor="specialization" className="flex items-center gap-2 text-sm font-semibold ml-1 group-focus-within:text-primary transition-colors">
                                    <GraduationCap className="w-4 h-4" />
                                    Bidang Keahlian / Spesialisasi
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="specialization"
                                        name="specialization"
                                        value={data.specialization}
                                        onChange={(e) => setData('specialization', e.target.value)}
                                        placeholder="Contoh: Rekayasa Perangkat Lunak"
                                        className="h-12 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                                    />
                                </div>
                                <InputError message={errors.specialization} />
                            </div>

                            <div className="space-y-2 group">
                                <Label htmlFor="photo" className="flex items-center gap-2 text-sm font-semibold ml-1 group-focus-within:text-primary transition-colors">
                                    <ImageIcon className="w-4 h-4" />
                                    Foto Profil (Opsional)
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="photo"
                                        name="photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                        className="h-12 pt-2.5 cursor-pointer bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all duration-200 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1 ml-1 font-medium italic">
                                    Format: JPG, PNG, WEBP (Maks: 2MB).
                                </p>
                                <InputError message={errors.photo} />
                            </div>

                            <div className="pt-6">
                                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-bold shadow-xl shadow-primary/20 rounded-xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground group"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Spinner className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <span className="flex items-center">
                                                Simpan & Lanjutkan
                                                <motion.span
                                                    className="ml-2"
                                                    animate={{ x: [0, 4, 0] }}
                                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                                >
                                                    →
                                                </motion.span>
                                            </span>
                                        )}
                                    </Button>
                                </motion.div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
