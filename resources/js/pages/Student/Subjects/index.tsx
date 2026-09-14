import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    BookOpen,
    CheckCircle2,
    PlusCircle,
    MinusCircle,
    User,
    Check,
    X,
    Filter,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SubjectItem {
    id: string;
    title: string;
    code: string;
    description?: string;
    teacher_name: string;
    teacher_email?: string;
    is_enrolled: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    links?: PaginationLink[];
    current_page?: number;
    last_page?: number;
    total?: number;
    from?: number;
    to?: number;
}

interface Props {
    subjects: PaginatedData<SubjectItem> | SubjectItem[];
    filters: {
        search: string;
        enrolled_only: boolean;
    };
    has_classroom: boolean;
}

export default function StudentSubjectsIndex({ subjects, filters, has_classroom }: Props) {
    const { flash } = usePage().props as any;
    const [dismissedFlash, setDismissedFlash] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [enrolledOnly, setEnrolledOnly] = useState(filters.enrolled_only ?? true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [subjectToUnenroll, setSubjectToUnenroll] = useState<SubjectItem | null>(null);

    const flashMessage = flash?.success || flash?.error;
    const showSuccess = Boolean(flashMessage && dismissedFlash !== flashMessage);

    const subjectsList: SubjectItem[] = Array.isArray(subjects)
        ? subjects
        : subjects?.data || [];

    const paginationLinks = !Array.isArray(subjects) ? subjects?.links || [] : [];

    useEffect(() => {
        if (flashMessage) {
            const timer = setTimeout(() => {
                setDismissedFlash(flashMessage);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    useEffect(() => {
        setLayoutProps({
            breadcrumbs: [
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Katalog Mata Pelajaran', href: '#' },
            ],
        });
    }, []);

    const handleSearch = (query: string, enrolled: boolean) => {
        setSearchQuery(query);
        setEnrolledOnly(enrolled);

        router.get(
            '/student/subjects',
            { search: query, enrolled_only: enrolled ? '1' : '0' },
            { preserveState: true, replace: true }
        );
    };

    const handleToggleEnroll = (subjectId: string) => {
        setProcessingId(subjectId);
        router.post(
            `/student/subjects/${subjectId}/toggle-enroll`,
            {},
            {
                onFinish: () => setProcessingId(null),
            }
        );
    };

    const handleCardClick = (item: SubjectItem) => {
        if (item.is_enrolled) {
            router.visit(`/student/subjects/${item.id}`);
        }
    };

    return (
        <>
            <Head title="Katalog Mata Pelajaran - Siswa" />

            <div className="flex flex-col gap-6 p-6">
                {/* Flash Alert Banner */}
                <AnimatePresence>
                    {showSuccess && (flash?.success || flash?.error) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div className={cn(
                                "mb-2 flex items-start gap-3 rounded-xl border p-4 shadow-sm backdrop-blur-sm",
                                flash?.success
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                                    : "border-destructive/20 bg-destructive/10 text-destructive"
                            )}>
                                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {flash.success || flash.error}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDismissedFlash(flashMessage)}
                                    className="rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Page Banner Header */}
                <div className="rounded-2xl bg-white border border-zinc-200/80 dark:border-zinc-800 dark:bg-zinc-900 p-6 text-foreground shadow-sm relative overflow-hidden">
                    <div className="relative z-10 space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-zinc-900 dark:text-white">
                            Katalog Mata Pelajaran SMK
                        </h1>
                        <p className="text-sm text-muted-foreground max-w-xl">
                            Pilih dan daftarkan mata pelajaran sesuai kelas Anda untuk mengakses materi pembelajaran, tugas harian, dan ujian online.
                        </p>
                    </div>
                </div>

                {!has_classroom && (
                    <Card className="border-amber-200 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-950/20 p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-base font-semibold text-amber-900 dark:text-amber-200">
                                    Anda Belum Dimasukkan ke Dalam Kelas
                                </h4>
                                <p className="text-xs text-amber-700 dark:text-amber-300/80 leading-relaxed">
                                    Mata pelajaran yang ditampilkan disesuaikan dengan kurikulum kelas Anda. Silakan hubungi wali kelas atau pihak administrator sekolah untuk mendaftarkan akun Anda ke dalam kelas.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari mata pelajaran atau pengajar..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value, enrolledOnly)}
                            className="pl-9 h-9 text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant={!enrolledOnly ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleSearch(searchQuery, false)}
                            className="text-xs h-9 gap-1.5 flex-1 sm:flex-initial"
                        >
                            <Filter className="h-3.5 w-3.5" />
                            <span>Semua Mapel Kelas</span>
                        </Button>
                        <Button
                            variant={enrolledOnly ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleSearch(searchQuery, true)}
                            className="text-xs h-9 gap-1.5 flex-1 sm:flex-initial"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Terdaftar Saya</span>
                        </Button>
                    </div>
                </div>

                {/* Subject Cards Grid */}
                {subjectsList.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subjectsList.map((item) => (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card
                                        onClick={() => handleCardClick(item)}
                                        className={cn(
                                            "h-full flex flex-col justify-between p-6 border border-zinc-200/80 dark:border-zinc-800 bg-card/60 shadow-lg backdrop-blur-sm transition-all relative overflow-hidden group",
                                            item.is_enrolled ? "cursor-pointer hover:shadow-xl hover:border-primary/50" : ""
                                        )}
                                    >
                                        <div className="space-y-4">
                                            {/* Top Badges */}
                                            <div className="flex items-center justify-between gap-2">
                                                <Badge className="bg-primary/10 text-primary font-mono font-bold border-none text-[11px]">
                                                    {item.code}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-[10px] font-semibold",
                                                        item.is_enrolled
                                                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200"
                                                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                                    )}
                                                >
                                                    {item.is_enrolled ? 'Terdaftar' : 'Belum Terdaftar'}
                                                </Badge>
                                            </div>

                                            {/* Title & Description */}
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[32px]">
                                                    {item.description || 'Tidak ada deskripsi tambahan.'}
                                                </p>
                                            </div>

                                            {/* Teacher Info */}
                                            <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs text-muted-foreground">
                                                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                    <User className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-foreground truncate">{item.teacher_name}</p>
                                                    {item.teacher_email && (
                                                        <p className="text-[10px] text-muted-foreground truncate">{item.teacher_email}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="pt-6 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                                            {item.is_enrolled ? (
                                                <>
                                                    <Button
                                                        asChild
                                                        className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-white shadow-md text-xs h-9"
                                                    >
                                                        <Link href={`/student/subjects/${item.id}`}>
                                                            <BookOpen className="h-4 w-4" />
                                                            <span>Buka Pelajaran</span>
                                                        </Link>
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={processingId === item.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSubjectToUnenroll(item);
                                                        }}
                                                        className="text-xs h-9 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                        title="Lepas Pendaftaran"
                                                    >
                                                        <MinusCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    disabled={processingId === item.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleEnroll(item.id);
                                                    }}
                                                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md text-xs h-9"
                                                >
                                                    <PlusCircle className="h-4 w-4" />
                                                    <span>Daftar Mata Pelajaran</span>
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination Links */}
                        {paginationLinks.length > 3 && (
                            <div className="flex items-center justify-center gap-1.5 pt-4">
                                {paginationLinks.map((link, idx) => {
                                    const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;');
                                    const isNext = link.label.includes('Next') || link.label.includes('&raquo;');

                                    let label = link.label;

                                    if (isPrev) {
label = '';
}

                                    if (isNext) {
label = '';
}

                                    return (
                                        <Button
                                            key={idx}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            asChild={!!link.url}
                                            className="h-8 min-w-8 text-xs"
                                        >
                                            {link.url ? (
                                                <Link href={link.url} preserveState replace>
                                                    {isPrev ? <ChevronLeft className="h-4 w-4" /> : isNext ? <ChevronRight className="h-4 w-4" /> : <span dangerouslySetInnerHTML={{ __html: label }} />}
                                                </Link>
                                            ) : (
                                                <span>
                                                    {isPrev ? <ChevronLeft className="h-4 w-4" /> : isNext ? <ChevronRight className="h-4 w-4" /> : <span dangerouslySetInnerHTML={{ __html: label }} />}
                                                </span>
                                            )}
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <Card className="p-12 text-center bg-card/50 border-none shadow-xl backdrop-blur-sm space-y-3">
                        <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold">Mata Pelajaran Tidak Ditemukan</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            {searchQuery
                                ? `Tidak ada mata pelajaran yang cocok dengan kata kunci "${searchQuery}".`
                                : enrolledOnly
                                ? 'Anda belum mendaftar ke mata pelajaran manapun. Klik tombol "Semua Mapel Kelas" untuk melihat mata pelajaran yang dapat Anda ikuti.'
                                : 'Belum ada mata pelajaran yang tersedia untuk kelas Anda saat ini.'}
                        </p>
                    </Card>
                )}
            </div>

            {/* Unenroll Confirmation Modal */}
            <Dialog open={Boolean(subjectToUnenroll)} onOpenChange={(open) => !open && setSubjectToUnenroll(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 text-destructive mb-1">
                            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                            </div>
                            <DialogTitle className="text-lg font-bold">
                                Melepaskan Pendaftaran?
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                            Apakah Anda yakin ingin melepaskan pendaftaran dari mata pelajaran{' '}
                            <span className="font-semibold text-foreground">{subjectToUnenroll?.title}</span>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 my-2 text-xs text-destructive space-y-1.5">
                        <p className="font-semibold flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            Peringatan Penghapusan Data Progres:
                        </p>
                        <p className="leading-relaxed opacity-90">
                            Melepaskan pendaftaran akan menghapus secara permanen seluruh catatan pendaftaran dan riwayat akses Anda pada mata pelajaran ini.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSubjectToUnenroll(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={processingId === subjectToUnenroll?.id}
                            onClick={() => {
                                if (subjectToUnenroll) {
                                    handleToggleEnroll(subjectToUnenroll.id);
                                    setSubjectToUnenroll(null);
                                }
                            }}
                        >
                            {processingId === subjectToUnenroll?.id ? 'Memproses...' : 'Ya, Lepas Pendaftaran'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
