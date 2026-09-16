import { Head, Link, useForm, setLayoutProps, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    BookOpen,
    FileText,
    AlertCircle,
    Loader2,
    X,
    Search,
    User,
    Check,
    ChevronsUpDown,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Teacher {
    id: number;
    nip: string | null;
    specialization: string | null;
    photo?: string | null;
    user_name: string;
    user_email: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface CreateSubjectProps {
    teachers?: PaginatedData<Teacher>;
    filters?: {
        search?: string;
    };
    role?: string;
}

export default function CreateSubject({
    teachers,
    filters = {},
    role,
}: CreateSubjectProps) {
    const { flash } = usePage().props as any;
    const [showError, setShowError] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        teacher_id: '',
    });

    useEffect(() => {
        setLayoutProps({
            breadcrumbs: [
                {
                    title: 'Mata Pelajaran',
                    href: '/teacher/subjects',
                },
                {
                    title: 'Tambah Mapel',
                    href: '/teacher/subjects/create',
                },
            ],
        });
    }, []);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSearch = useCallback((value: string) => {
        setIsSearching(true);
        router.get(
            '/teacher/subjects/create',
            { search: value },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['teachers', 'filters'],
                onFinish: () => setIsSearching(false),
            },
        );
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                handleSearch(searchTerm);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, handleSearch, filters.search]);

    const handleSelectTeacher = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setData('teacher_id', teacher.id.toString());
        setIsOpen(false);
    };

    useEffect(() => {
        if (flash?.error) {
            const showTimer = setTimeout(() => setShowError(true), 0);
            const hideTimer = setTimeout(() => setShowError(false), 5000);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [flash?.error]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/teacher/subjects');
    };

    return (
        <>
            <Head title="Tambah Mata Pelajaran" />

            <div className="mx-auto flex max-w-6xl w-full flex-col gap-6 p-6">
                <AnimatePresence>
                    {showError && flash?.error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full"
                        >
                            <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive w-full">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5" />
                                    <p className="text-sm font-medium">
                                        {flash.error}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowError(false)}
                                    className="transition-opacity hover:opacity-70"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-4 w-full">
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="shrink-0"
                    >
                        <Link href="/teacher/subjects">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Tambah Mata Pelajaran
                    </h1>
                </div>

                <form onSubmit={submit} className="grid gap-6 w-full">
                    <Card className="w-full p-6 border-none shadow-xl bg-card/50 backdrop-blur-sm">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="title"
                                    className="flex items-center gap-2 text-sm font-semibold"
                                >
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    Nama Mata Pelajaran
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="Contoh: Pemrograman Dasar"
                                    className="h-11 border-zinc-200 bg-background/50 dark:border-zinc-800"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.title} />
                            </div>

                            {role === 'admin' && teachers && (
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="teacher_id"
                                        className="flex items-center gap-2 text-sm font-semibold"
                                    >
                                        <User className="h-4 w-4 text-primary" />
                                        Pilih Guru Pengampu
                                    </Label>
                                    <DropdownMenu
                                        open={isOpen}
                                        onOpenChange={setIsOpen}
                                    >
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={isOpen}
                                                className="h-12 w-full justify-between border-zinc-200 bg-background/50 dark:border-zinc-800"
                                            >
                                                {selectedTeacher ? (
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <User className="h-4 w-4 shrink-0 text-primary" />
                                                        <div className="flex flex-col items-start text-left">
                                                            <span className="truncate font-medium">
                                                                {selectedTeacher.user_name}
                                                            </span>
                                                            <span className="truncate text-[10px] text-muted-foreground">
                                                                {selectedTeacher.nip ? `NIP: ${selectedTeacher.nip} • ` : ''}
                                                                {selectedTeacher.user_email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        Cari guru berdasarkan nama, NIP, spesialisasi, atau email...
                                                    </span>
                                                )}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="w-[calc(100vw-3rem)] p-0 md:w-[600px]"
                                            align="start"
                                            onCloseAutoFocus={(e) =>
                                                e.preventDefault()
                                            }
                                        >
                                            <div className="flex items-center border-b p-2">
                                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                <Input
                                                    ref={inputRef}
                                                    placeholder="Ketik untuk mencari guru..."
                                                    className="h-9 border-none bg-transparent focus-visible:ring-0"
                                                    value={searchTerm}
                                                    onChange={(e) =>
                                                        setSearchTerm(
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                />
                                                {isSearching && (
                                                    <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto p-1">
                                                {teachers.data && teachers.data.length > 0 ? (
                                                    teachers.data.map(
                                                        (teacher) => (
                                                            <DropdownMenuItem
                                                                key={teacher.id}
                                                                onSelect={() =>
                                                                    handleSelectTeacher(
                                                                        teacher,
                                                                    )
                                                                }
                                                                className="flex cursor-pointer items-center justify-between p-3 transition-colors focus:bg-zinc-100 focus:text-foreground dark:focus:bg-zinc-800"
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold">
                                                                        {teacher.user_name}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {teacher.nip ? `NIP: ${teacher.nip} • ` : ''}
                                                                        {teacher.user_email}
                                                                        {teacher.specialization ? ` • ${teacher.specialization}` : ''}
                                                                    </span>
                                                                </div>
                                                                {selectedTeacher?.id ===
                                                                    teacher.id && (
                                                                    <Check className="h-4 w-4 text-primary" />
                                                                )}
                                                            </DropdownMenuItem>
                                                        ),
                                                    )
                                                ) : (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                                        Guru tidak ditemukan.
                                                    </div>
                                                )}
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <InputError message={errors.teacher_id} />
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="description"
                                    className="flex items-center gap-2 text-sm font-semibold"
                                >
                                    <FileText className="h-4 w-4 text-primary" />
                                    Deskripsi Singkat
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Ringkasan materi..."
                                    className="min-h-[150px] resize-none border-zinc-200 bg-background/50 dark:border-zinc-800"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3 w-full">
                        <Button variant="ghost" asChild disabled={processing}>
                            <Link href="/teacher/subjects">Batal</Link>
                        </Button>
                        <Button
                            className="gap-2 px-8 shadow-lg shadow-primary/20"
                            disabled={processing}
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Simpan Mata Pelajaran
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
