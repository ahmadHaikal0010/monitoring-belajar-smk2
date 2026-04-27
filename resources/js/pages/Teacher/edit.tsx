import { Head, useForm, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Image as ImageIcon, AlertCircle, FileText, ArrowLeft, Settings2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update, profile } from '@/routes/teacher';

interface Teacher {
    id: string;
    nip: string;
    specialization: string;
    bio: string;
    photo_url?: string;
}

interface EditTeacherProps {
    teacher: Teacher;
}

export default function EditTeacher({ teacher }: EditTeacherProps) {
    const { data, setData, post, processing, errors, hasErrors } = useForm({
        nip: teacher.nip || '',
        specialization: teacher.specialization || '',
        bio: teacher.bio || '',
        photo: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(update.url(), {
            forceFormData: true,
        });
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
            <Head title="Ubah Profil Guru" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                <div className="mb-6">
                    <Button asChild variant="ghost" size="sm" className="hover:bg-transparent p-0 text-muted-foreground hover:text-foreground transition-colors">
                        <Link href={profile.url()} className="flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Profil
                        </Link>
                    </Button>
                </div>

                {hasErrors && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>Ada beberapa data yang kurang tepat. Silakan periksa kolom yang berwarna merah.</span>
                    </motion.div>
                )}

                <Card className="border-none shadow-2xl bg-card/70 backdrop-blur-xl">
                    <CardHeader className="space-y-2 text-center pb-8 border-b bg-muted/30 rounded-t-xl">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 rotate-3 hover:rotate-0 transition-transform duration-300 shadow-inner">
                            <Settings2 className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-extrabold tracking-tight">Ubah Profil</CardTitle>
                        <CardDescription className="text-base font-medium">
                            Perbarui informasi profil guru Anda di bawah ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 text-left">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2 group">
                                <Label htmlFor="nip" className="flex items-center gap-2 text-sm font-semibold ml-1 text-muted-foreground">
                                    <Briefcase className="w-4 h-4" />
                                    NIP (Nomor Induk Pegawai)
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="nip"
                                        name="nip"
                                        value={data.nip}
                                        disabled
                                        className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl cursor-not-allowed opacity-70"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1 ml-1 font-medium italic">
                                    NIP tidak dapat diubah. Hubungi admin jika terdapat kesalahan.
                                </p>
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
                                        required
                                    />
                                </div>
                                <InputError message={errors.specialization} />
                            </div>

                            <div className="space-y-2 group">
                                <Label htmlFor="bio" className="flex items-center gap-2 text-sm font-semibold ml-1 group-focus-within:text-primary transition-colors">
                                    <FileText className="w-4 h-4" />
                                    Bio Singkat (Opsional)
                                </Label>
                                <div className="relative">
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={data.bio}
                                        onChange={(e) => setData('bio', e.target.value)}
                                        placeholder="Ceritakan sedikit tentang pengalaman atau profil mengajar Anda..."
                                        className="min-h-[100px] w-full bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all duration-200 p-3 text-sm outline-none border resize-none"
                                        maxLength={255}
                                    />
                                    <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground font-medium">
                                        {data.bio.length}/255
                                    </div>
                                </div>
                                <InputError message={errors.bio} />
                            </div>

                            <div className="space-y-2 group">
                                <Label htmlFor="photo" className="flex items-center gap-2 text-sm font-semibold ml-1 group-focus-within:text-primary transition-colors">
                                    <ImageIcon className="w-4 h-4" />
                                    Foto Profil Baru (Opsional)
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
                                    Biarkan kosong jika tidak ingin mengubah foto. Format: JPG, PNG, WEBP (Maks: 2MB).
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
                                                Simpan Perubahan
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

// Tambahkan Settings2 ke import lucide-react jika belum ada
