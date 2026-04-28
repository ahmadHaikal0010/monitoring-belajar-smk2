import { Head, router, useForm, setLayoutProps, Link } from '@inertiajs/react';
import { 
    Search, 
    User, 
    ArrowLeft, 
    Save, 
    GraduationCap, 
    Fingerprint, 
    Info,
    Check,
    ChevronsUpDown,
    Loader2
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
import admin from '@/routes/admin';

interface User {
    id: number;
    name: string;
    email: string;
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

interface Props {
    assignableUsers: PaginatedData<User>;
    filters: {
        search?: string;
    };
}

export default function CreateTeacher({ assignableUsers, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Daftar Guru',
                href: admin.teachers.index.url(),
            },
            {
                title: 'Tambah Guru',
                href: admin.teachers.create.url(),
            },
        ],
    });

    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        nip: '',
        specialization: '',
        bio: '',
        photo: null as File | null,
    });

    // Fokus otomatis ke input saat dropdown dibuka
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle searchable select logic
    const handleSearch = useCallback((value: string) => {
        setIsSearching(true);
        router.get(
            admin.teachers.create.url(),
            { search: value },
            { 
                preserveState: true, 
                preserveScroll: true,
                only: ['assignableUsers'],
                onFinish: () => setIsSearching(false)
            }
        );
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                handleSearch(searchTerm);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, handleSearch, filters.search]);

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setData('user_id', user.id.toString());
        setIsOpen(false);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(admin.teachers.store.url());
    };

    return (
        <>
            <Head title="Tambah Guru Baru" />

            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="shrink-0">
                        <Link href={admin.teachers.index.url()}>
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tambah Guru Baru</h1>
                        <p className="text-muted-foreground">Hubungkan akun user yang sudah ada ke profil guru baru.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="grid gap-6">
                    <Card className="p-6 border-none shadow-xl bg-card/50 backdrop-blur-sm">
                        <div className="grid gap-6">
                            {/* User Selection (Searchable) */}
                            <div className="grid gap-2">
                                <Label htmlFor="user_id" className="text-sm font-semibold">Pilih Akun User</Label>
                                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            role="combobox" 
                                            aria-expanded={isOpen}
                                            className="w-full justify-between h-12 bg-background/50 border-zinc-200 dark:border-zinc-800"
                                        >
                                            {selectedUser ? (
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <User className="w-4 h-4 shrink-0 text-primary" />
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="truncate font-medium">{selectedUser.name}</span>
                                                        <span className="truncate text-[10px] text-muted-foreground">{selectedUser.email}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Cari user berdasarkan nama atau email...</span>
                                            )}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent 
                                        className="w-[calc(100vw-3rem)] md:w-[600px] p-0" 
                                        align="start"
                                        onCloseAutoFocus={(e) => e.preventDefault()}
                                    >
                                        <div className="flex items-center border-b p-2">
                                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                            <Input
                                                ref={inputRef}
                                                placeholder="Ketik untuk mencari user..."
                                                className="h-9 border-none focus-visible:ring-0 bg-transparent"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                            {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto p-1">
                                            {assignableUsers.data.length > 0 ? (
                                                assignableUsers.data.map((user) => (
                                                    <DropdownMenuItem 
                                                        key={user.id}
                                                        onSelect={() => handleSelectUser(user)}
                                                        className="flex items-center justify-between p-3 cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-foreground transition-colors"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">{user.name}</span>
                                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                                        </div>
                                                        {selectedUser?.id === user.id && <Check className="h-4 w-4 text-primary" />}
                                                    </DropdownMenuItem>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    User tidak ditemukan atau sudah menjadi guru.
                                                </div>
                                            )}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <InputError message={errors.user_id} />
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                                    <Info className="w-3 h-3" />
                                    Hanya menampilkan akun yang belum terdaftar sebagai guru.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* NIP */}
                                <div className="grid gap-2">
                                    <Label htmlFor="nip" className="text-sm font-semibold">NIP (18 Karakter)</Label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            id="nip" 
                                            placeholder="Contoh: 198001012005011001" 
                                            className="pl-9 h-11 bg-background/50 border-zinc-200 dark:border-zinc-800"
                                            value={data.nip}
                                            onChange={e => setData('nip', e.target.value)}
                                            maxLength={18}
                                        />
                                    </div>
                                    <InputError message={errors.nip} />
                                </div>

                                {/* Specialization */}
                                <div className="grid gap-2">
                                    <Label htmlFor="specialization" className="text-sm font-semibold">Bidang Keahlian</Label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            id="specialization" 
                                            placeholder="Contoh: Teknik Komputer" 
                                            className="pl-9 h-11 bg-background/50 border-zinc-200 dark:border-zinc-800"
                                            value={data.specialization}
                                            onChange={e => setData('specialization', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.specialization} />
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="grid gap-2">
                                <Label htmlFor="bio" className="text-sm font-semibold">Bio Singkat</Label>
                                <textarea 
                                    id="bio"
                                    rows={3}
                                    placeholder="Ceritakan sedikit tentang latar belakang guru..."
                                    className="flex w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.bio}
                                    onChange={e => setData('bio', e.target.value)}
                                />
                                <InputError message={errors.bio} />
                            </div>

                            {/* Photo Upload */}
                            <div className="grid gap-2">
                                <Label htmlFor="photo" className="text-sm font-semibold">Foto Profil</Label>
                                <Input 
                                    id="photo" 
                                    type="file" 
                                    accept="image/*"
                                    className="h-11 bg-background/50 border-zinc-200 dark:border-zinc-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                    onChange={e => setData('photo', e.target.files ? e.target.files[0] : null)}
                                />
                                <InputError message={errors.photo} />
                                <p className="text-[11px] text-muted-foreground">Format: JPG, PNG, WEBP. Maks: 2MB.</p>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" asChild disabled={processing}>
                            <Link href={admin.teachers.index.url()}>Batal</Link>
                        </Button>
                        <Button className="gap-2 px-8 shadow-lg shadow-primary/20" disabled={processing}>
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Simpan Data Guru
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
