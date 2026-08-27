import {
    Download,
    FileSpreadsheet,
    Printer,
    CheckSquare,
    BookOpen,
    FileQuestion,
    FileText,
    ChevronDown,
    ChevronUp,
    Loader2,
    Video,
    File,
    School,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface MaterialOption {
    id: string;
    title: string;
    content_type: string;
}

interface ExamOption {
    id: string;
    title: string;
    pass_score: number;
    duration: number;
}

interface AssignmentOption {
    id: string;
    title: string;
    max_score: number;
    due_date?: string;
}

interface ExportOptionsResponse {
    subject: {
        id: string;
        title: string;
        code?: string;
    };
    materials: MaterialOption[];
    exams: ExamOption[];
    assignments: AssignmentOption[];
}

interface ClassroomOption {
    id: string;
    name: string;
    major_code?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    subjectId: string;
    subjectTitle: string;
    classrooms?: ClassroomOption[];
    classroomId?: string;
}

const EMPTY_CLASSROOMS: ClassroomOption[] = [];

export function ExportReportModal({
    isOpen,
    onClose,
    subjectId,
    subjectTitle,
    classrooms = EMPTY_CLASSROOMS,
    classroomId,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [materials, setMaterials] = useState<MaterialOption[]>([]);
    const [exams, setExams] = useState<ExamOption[]>([]);
    const [assignments, setAssignments] = useState<AssignmentOption[]>([]);

    const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set());
    const [selectedExams, setSelectedExams] = useState<Set<string>>(new Set());
    const [selectedAssignments, setSelectedAssignments] = useState<Set<string>>(new Set());

    // Accordions default to CLOSED as requested
    const [expandedMaterials, setExpandedMaterials] = useState(false);
    const [expandedExams, setExpandedExams] = useState(false);
    const [expandedAssignments, setExpandedAssignments] = useState(false);

    // Classroom checkboxes selection state (supports multi-selection)
    const [selectedClassroomIds, setSelectedClassroomIds] = useState<Set<string>>(new Set());
    const [format, setFormat] = useState<'excel' | 'print'>('excel');

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (classroomId) {
            setSelectedClassroomIds((prev) => {
                if (prev.size === 1 && prev.has(classroomId)) {
                    return prev;
                }

                return new Set([classroomId]);
            });
        } else if (classrooms.length > 0) {
            const newIds = classrooms.map((c) => c.id);
            setSelectedClassroomIds((prev) => {
                if (prev.size === newIds.length && newIds.every((id) => prev.has(id))) {
                    return prev;
                }

                return new Set(newIds);
            });
        } else {
            setSelectedClassroomIds((prev) => {
                if (prev.size === 0) {
                    return prev;
                }

                return new Set();
            });
        }
    }, [isOpen, classroomId, classrooms]);

    const fetchExportOptions = useCallback(async () => {
        setLoading(true);

        try {
            const res = await fetch(`/admin/subjects/${subjectId}/export-options`);

            if (res.ok) {
                const data: ExportOptionsResponse = await res.json();
                setMaterials(data.materials || []);
                setExams(data.exams || []);
                setAssignments(data.assignments || []);

                setSelectedMaterials(new Set((data.materials || []).map((m) => m.id)));
                setSelectedExams(new Set((data.exams || []).map((e) => e.id)));
                setSelectedAssignments(new Set((data.assignments || []).map((a) => a.id)));
            }
        } catch (error) {
            console.error('Failed to load export options:', error);
        } finally {
            setLoading(false);
        }
    }, [subjectId]);

    useEffect(() => {
        if (isOpen && subjectId) {
            fetchExportOptions();
        }
    }, [isOpen, subjectId, fetchExportOptions]);

    // Classroom Toggles
    const toggleAllClassrooms = (checked: boolean) => {
        if (checked) {
            setSelectedClassroomIds(new Set(classrooms.map((c) => c.id)));
        } else {
            setSelectedClassroomIds(new Set());
        }
    };

    const toggleClassroom = (id: string) => {
        const next = new Set(selectedClassroomIds);

        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }

        setSelectedClassroomIds(next);
    };

    // Master Component Toggles
    const toggleAllMaterials = (checked: boolean) => {
        if (checked) {
            setSelectedMaterials(new Set(materials.map((m) => m.id)));
        } else {
            setSelectedMaterials(new Set());
        }
    };

    const toggleAllExams = (checked: boolean) => {
        if (checked) {
            setSelectedExams(new Set(exams.map((e) => e.id)));
        } else {
            setSelectedExams(new Set());
        }
    };

    const toggleAllAssignments = (checked: boolean) => {
        if (checked) {
            setSelectedAssignments(new Set(assignments.map((a) => a.id)));
        } else {
            setSelectedAssignments(new Set());
        }
    };

    // Single Toggles
    const toggleMaterial = (id: string) => {
        const next = new Set(selectedMaterials);

        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }

        setSelectedMaterials(next);
    };

    const toggleExam = (id: string) => {
        const next = new Set(selectedExams);

        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }

        setSelectedExams(next);
    };

    const toggleAssignment = (id: string) => {
        const next = new Set(selectedAssignments);

        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }

        setSelectedAssignments(next);
    };

    const totalItemsSelected =
        selectedMaterials.size + selectedExams.size + selectedAssignments.size;

    const handleExport = () => {
        const queryParams = new URLSearchParams();

        if (selectedMaterials.size > 0) {
            queryParams.set('include_materials', '1');
            queryParams.set('material_ids', Array.from(selectedMaterials).join(','));
        } else {
            queryParams.set('include_materials', '0');
        }

        if (selectedExams.size > 0) {
            queryParams.set('include_exams', '1');
            queryParams.set('exam_ids', Array.from(selectedExams).join(','));
        } else {
            queryParams.set('include_exams', '0');
        }

        if (selectedAssignments.size > 0) {
            queryParams.set('include_assignments', '1');
            queryParams.set('assignment_ids', Array.from(selectedAssignments).join(','));
        } else {
            queryParams.set('include_assignments', '0');
        }

        if (classroomId) {
            queryParams.set('classroom_ids', classroomId);
        } else if (selectedClassroomIds.size > 0) {
            queryParams.set('classroom_ids', Array.from(selectedClassroomIds).join(','));
        }

        queryParams.set('format', format);

        const exportUrl = `/admin/subjects/${subjectId}/export?${queryParams.toString()}`;

        if (format === 'print') {
            window.open(exportUrl, '_blank');
        } else {
            const link = document.createElement('a');
            link.href = exportUrl;
            link.setAttribute('download', '');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        onClose();
    };

    const canExport =
        !loading &&
        totalItemsSelected > 0 &&
        (!classrooms.length || classroomId || selectedClassroomIds.size > 0);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b border-border">
                    <DialogTitle className="flex items-center gap-2.5 text-xl font-bold">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Download className="h-5 w-5" />
                        </div>
                        <span>Export Rekap Laporan</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground pt-1">
                        Pilih komponen materi, ujian, dan tugas yang ingin dicetak dalam laporan untuk:{' '}
                        <strong className="text-foreground">{subjectTitle}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                            <span className="text-sm font-medium">Memuat opsi materi, ujian & tugas...</span>
                        </div>
                    ) : (
                        <>
                            {/* Classroom Selection Checkboxes (Multi-select) */}
                            {classrooms.length > 0 && !classroomId && (
                                <div className="rounded-xl border border-border bg-card/50 overflow-hidden transition-all space-y-0">
                                    <div className="flex items-center justify-between p-3.5 bg-accent/40 border-b border-border/60">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="master-classrooms"
                                                checked={selectedClassroomIds.size === classrooms.length}
                                                onChange={(e) => toggleAllClassrooms(e.target.checked)}
                                                className="h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                            />
                                            <label htmlFor="master-classrooms" className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                                                <School className="h-4 w-4 text-primary" />
                                                <span>Pilih Rombel Kelas Diajar</span>
                                            </label>
                                        </div>
                                        <Badge variant="outline" className="text-xs font-semibold">
                                            {selectedClassroomIds.size} / {classrooms.length} Kelas Dipilih
                                        </Badge>
                                    </div>

                                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                                        {classrooms.map((c) => {
                                            const isSelected = selectedClassroomIds.has(c.id);

                                            return (
                                                <label
                                                    key={c.id}
                                                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all text-xs ${
                                                        isSelected
                                                            ? 'border-emerald-500/50 bg-emerald-500/5 font-semibold text-emerald-950 dark:text-emerald-200'
                                                            : 'border-border hover:bg-accent/60 text-muted-foreground'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleClassroom(c.id)}
                                                            className="h-3.5 w-3.5 rounded border-input text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                                                        />
                                                        <span className="truncate font-medium">Kelas {c.name}</span>
                                                    </div>
                                                    {c.major_code && (
                                                        <Badge variant="outline" className="text-[10px] py-0 h-5 shrink-0">
                                                            {c.major_code}
                                                        </Badge>
                                                    )}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Format File Selection */}
                            <div className="space-y-2.5">
                                <Label className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                    Pilih Format Keluaran File
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormat('excel')}
                                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                                            format === 'excel'
                                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                                                : 'border-border text-muted-foreground hover:bg-accent'
                                        }`}
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0 shadow-sm">
                                            <FileSpreadsheet className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-sm block leading-snug">Excel (.xls)</span>
                                            <span className="text-[11px] text-muted-foreground">Matriks Spreadsheet</span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormat('print')}
                                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                                            format === 'print'
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                                                : 'border-border text-muted-foreground hover:bg-accent'
                                        }`}
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0 shadow-sm">
                                            <Printer className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-sm block leading-snug">Printable PDF</span>
                                            <span className="text-[11px] text-muted-foreground">Dokumen PDF Siap Cetak</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Selection Sections Header */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                        <CheckSquare className="h-4 w-4 text-primary" />
                                        Pilih Spesifik Item Laporan
                                    </Label>
                                    <Badge variant="outline" className="text-xs font-semibold">
                                        {totalItemsSelected} item dipilih
                                    </Badge>
                                </div>

                                {/* SECTION 1: MATERI (Default CLOSED) */}
                                <div className="rounded-xl border border-border bg-card/50 overflow-hidden transition-all">
                                    <div className="flex items-center justify-between p-3.5 bg-accent/40 border-b border-border/60">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="master-materials"
                                                checked={materials.length > 0 && selectedMaterials.size === materials.length}
                                                onChange={(e) => toggleAllMaterials(e.target.checked)}
                                                disabled={materials.length === 0}
                                                className="h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                            />
                                            <label htmlFor="master-materials" className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                                                <BookOpen className="h-4 w-4 text-emerald-600" />
                                                <span>Materi Pembelajaran</span>
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                                    {selectedMaterials.size} / {materials.length}
                                                </Badge>
                                            </label>
                                        </div>
                                        {materials.length > 0 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                onClick={() => setExpandedMaterials(!expandedMaterials)}
                                            >
                                                {expandedMaterials ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>
                                        )}
                                    </div>

                                    {expandedMaterials && (
                                        <div className="p-3 space-y-1.5 max-h-48 overflow-y-auto">
                                            {materials.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic p-2 text-center">Belum ada materi pembelajaran pada mata pelajaran ini.</p>
                                            ) : (
                                                materials.map((m) => (
                                                    <label
                                                        key={m.id}
                                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/60 cursor-pointer transition-colors text-xs"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedMaterials.has(m.id)}
                                                                onChange={() => toggleMaterial(m.id)}
                                                                className="h-3.5 w-3.5 rounded border-input text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                                                            />
                                                            <span className="truncate font-medium text-foreground">{m.title}</span>
                                                        </div>
                                                        <Badge variant="outline" className="text-[10px] shrink-0 capitalize gap-1 py-0 h-5">
                                                            {m.content_type === 'video' ? <Video className="h-2.5 w-2.5 text-blue-500" /> : <File className="h-2.5 w-2.5 text-amber-500" />}
                                                            {m.content_type}
                                                        </Badge>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 2: UJIAN (Default CLOSED) */}
                                <div className="rounded-xl border border-border bg-card/50 overflow-hidden transition-all">
                                    <div className="flex items-center justify-between p-3.5 bg-accent/40 border-b border-border/60">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="master-exams"
                                                checked={exams.length > 0 && selectedExams.size === exams.length}
                                                onChange={(e) => toggleAllExams(e.target.checked)}
                                                disabled={exams.length === 0}
                                                className="h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                            />
                                            <label htmlFor="master-exams" className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                                                <FileQuestion className="h-4 w-4 text-purple-600" />
                                                <span>Ujian Online</span>
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                                    {selectedExams.size} / {exams.length}
                                                </Badge>
                                            </label>
                                        </div>
                                        {exams.length > 0 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                onClick={() => setExpandedExams(!expandedExams)}
                                            >
                                                {expandedExams ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>
                                        )}
                                    </div>

                                    {expandedExams && (
                                        <div className="p-3 space-y-1.5 max-h-48 overflow-y-auto">
                                            {exams.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic p-2 text-center">Belum ada ujian online dipublikasikan pada mata pelajaran ini.</p>
                                            ) : (
                                                exams.map((e) => (
                                                    <label
                                                        key={e.id}
                                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/60 cursor-pointer transition-colors text-xs"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedExams.has(e.id)}
                                                                onChange={() => toggleExam(e.id)}
                                                                className="h-3.5 w-3.5 rounded border-input text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                                                            />
                                                            <span className="truncate font-medium text-foreground">{e.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <Badge variant="outline" className="text-[10px] py-0 h-5">
                                                                KKM: {e.pass_score}
                                                            </Badge>
                                                            <Badge variant="secondary" className="text-[10px] py-0 h-5">
                                                                {e.duration} menit
                                                            </Badge>
                                                        </div>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 3: TUGAS (Default CLOSED) */}
                                <div className="rounded-xl border border-border bg-card/50 overflow-hidden transition-all">
                                    <div className="flex items-center justify-between p-3.5 bg-accent/40 border-b border-border/60">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="master-assignments"
                                                checked={assignments.length > 0 && selectedAssignments.size === assignments.length}
                                                onChange={(e) => toggleAllAssignments(e.target.checked)}
                                                disabled={assignments.length === 0}
                                                className="h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                            />
                                            <label htmlFor="master-assignments" className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                                                <FileText className="h-4 w-4 text-amber-600" />
                                                <span>Tugas Siswa</span>
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                                    {selectedAssignments.size} / {assignments.length}
                                                </Badge>
                                            </label>
                                        </div>
                                        {assignments.length > 0 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                onClick={() => setExpandedAssignments(!expandedAssignments)}
                                            >
                                                {expandedAssignments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>
                                        )}
                                    </div>

                                    {expandedAssignments && (
                                        <div className="p-3 space-y-1.5 max-h-48 overflow-y-auto">
                                            {assignments.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic p-2 text-center">Belum ada tugas dipublikasikan pada mata pelajaran ini.</p>
                                            ) : (
                                                assignments.map((a) => (
                                                    <label
                                                        key={a.id}
                                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/60 cursor-pointer transition-colors text-xs"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedAssignments.has(a.id)}
                                                                onChange={() => toggleAssignment(a.id)}
                                                                className="h-3.5 w-3.5 rounded border-input text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                                                            />
                                                            <span className="truncate font-medium text-foreground">{a.title}</span>
                                                        </div>
                                                        <Badge variant="outline" className="text-[10px] shrink-0 py-0 h-5">
                                                            Max Score: {a.max_score}
                                                        </Badge>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="p-6 pt-4 border-t border-border flex-row items-center justify-between gap-3 sm:gap-0">
                    <div className="text-xs text-muted-foreground">
                        {totalItemsSelected === 0 ? (
                            <span className="text-destructive font-semibold">Pilih minimal 1 item untuk diexport.</span>
                        ) : classrooms.length > 0 && !classroomId && selectedClassroomIds.size === 0 ? (
                            <span className="text-destructive font-semibold">Pilih minimal 1 rombel kelas.</span>
                        ) : (
                            <span>{totalItemsSelected} item siap diexport</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button
                            onClick={handleExport}
                            disabled={!canExport}
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                        >
                            <Download className="h-4 w-4" />
                            <span>Unduh / Cetak Laporan</span>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ExportReportModal;
