import { Search, User, Check, ChevronsUpDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface TeacherItem {
    id: string;
    name: string;
    nip?: string;
}

interface SearchableTeacherSelectProps {
    teachers: TeacherItem[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    label?: string;
    placeholder?: string;
}

export function SearchableTeacherSelect({
    teachers,
    value,
    onChange,
    error,
    label = 'Guru Pengampu',
    placeholder = 'Pilih Guru...',
}: SearchableTeacherSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedTeacher = teachers.find((t) => t.id === value);

    const filteredTeachers = teachers.filter((t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.nip && t.nip.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <div className="grid gap-2">
            <Label htmlFor="teacher_id" className="flex items-center gap-2 font-medium text-xs text-zinc-700 dark:text-zinc-300">
                <User className="h-4 w-4 text-emerald-500" />
                {label}
            </Label>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={isOpen}
                        className="h-10 w-full justify-between border-zinc-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 rounded-xl"
                    >
                        {selectedTeacher ? (
                            <div className="flex items-center gap-2 overflow-hidden">
                                <User className="h-4 w-4 shrink-0 text-emerald-500" />
                                <span className="truncate font-medium text-xs">
                                    {selectedTeacher.name} {selectedTeacher.nip ? `(NIP: ${selectedTeacher.nip})` : ''}
                                </span>
                            </div>
                        ) : (
                            <span className="text-xs text-zinc-400">
                                {placeholder}
                            </span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-[calc(100vw-3rem)] max-h-72 overflow-hidden p-0 md:w-[480px] rounded-xl"
                    align="start"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex items-center border-b p-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            ref={inputRef}
                            placeholder="Cari berdasarkan nama atau NIP..."
                            className="h-9 border-none bg-transparent focus-visible:ring-0 text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {value && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    onChange('');
                                    setIsOpen(false);
                                }}
                                className="h-7 text-xs text-rose-500 hover:text-rose-700"
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                    <div className="max-h-56 overflow-y-auto p-1">
                        {filteredTeachers.length > 0 ? (
                            filteredTeachers.map((teacher) => {
                                const isSelected = teacher.id === value;

                                return (
                                    <button
                                        key={teacher.id}
                                        type="button"
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                                            isSelected ? 'bg-zinc-100 font-semibold dark:bg-zinc-800' : ''
                                        }`}
                                        onClick={() => {
                                            onChange(teacher.id);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <User className="h-4 w-4 text-zinc-400" />
                                            <span className="truncate">
                                                {teacher.name} {teacher.nip ? `<${teacher.nip}>` : ''}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-emerald-500" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-4 text-center text-xs text-zinc-500">
                                Guru tidak ditemukan.
                            </div>
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
            <InputError message={error} />
        </div>
    );
}
