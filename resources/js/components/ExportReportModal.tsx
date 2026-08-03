import { Download, FileSpreadsheet, Printer, CheckSquare } from 'lucide-react';
import { useState } from 'react';
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

interface Props {
    isOpen: boolean;
    onClose: () => void;
    subjectId: string;
    subjectTitle: string;
}

export function ExportReportModal({ isOpen, onClose, subjectId, subjectTitle }: Props) {
    const [includeMaterials, setIncludeMaterials] = useState(true);
    const [includeExams, setIncludeExams] = useState(true);
    const [includeAssignments, setIncludeAssignments] = useState(true);
    const [format, setFormat] = useState<'excel' | 'print'>('excel');

    const handleExport = () => {
        const queryParams = new URLSearchParams({
            include_materials: includeMaterials ? '1' : '0',
            include_exams: includeExams ? '1' : '0',
            include_assignments: includeAssignments ? '1' : '0',
            format: format,
        });

        const exportUrl = `/admin/subjects/${subjectId}/export?${queryParams.toString()}`;
        window.open(exportUrl, '_blank');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <span>Export Rekap Laporan</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground pt-1">
                        Atur komponen data yang ingin diikutsertakan dalam laporan untuk mata pelajaran:{' '}
                        <strong className="text-foreground">{subjectTitle}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-3">
                    {/* Komponen Data Checkboxes */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                            <CheckSquare className="h-4 w-4 text-primary" />
                            Pilih Komponen Laporan
                        </Label>

                        <div className="grid gap-2.5">
                            <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card/50 hover:bg-card cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={includeMaterials}
                                        onChange={(e) => setIncludeMaterials(e.target.checked)}
                                        className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold block">Materi Pembelajaran</span>
                                        <span className="text-xs text-muted-foreground">Persentase & detail status penyelesaian materi per siswa</span>
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card/50 hover:bg-card cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={includeExams}
                                        onChange={(e) => setIncludeExams(e.target.checked)}
                                        className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold block">Hasil Ujian Online</span>
                                        <span className="text-xs text-muted-foreground">Nilai per ujian, status KKM (Lulus/Remedial), & rata-rata</span>
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card/50 hover:bg-card cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={includeAssignments}
                                        onChange={(e) => setIncludeAssignments(e.target.checked)}
                                        className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold block">Hasil Tugas Siswa</span>
                                        <span className="text-xs text-muted-foreground">Nilai tugas manual, status pengumpulan, & rata-rata</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Format File Selection */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                            Pilih Format Keluaran File
                        </Label>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormat('excel')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center ${
                                    format === 'excel'
                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                        : 'border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:bg-accent'
                                }`}
                            >
                                <FileSpreadsheet className="h-6 w-6 mb-1.5 text-emerald-600" />
                                <span className="font-bold text-xs">Excel Spreadsheet</span>
                                <span className="text-[10px] text-muted-foreground">Format .xls Matriks</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormat('print')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center ${
                                    format === 'print'
                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                        : 'border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:bg-accent'
                                }`}
                            >
                                <Printer className="h-6 w-6 mb-1.5 text-blue-600" />
                                <span className="font-bold text-xs">Printable PDF</span>
                                <span className="text-[10px] text-muted-foreground">Cetak / PDF Siap Pakai</span>
                            </button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={!includeMaterials && !includeExams && !includeAssignments}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                    >
                        <Download className="h-4 w-4" />
                        <span>Unduh / Cetak Laporan</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
