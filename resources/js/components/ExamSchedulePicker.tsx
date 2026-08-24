import { X } from 'lucide-react';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExamSchedulePickerProps {
    startTime: string;
    endTime: string;
    onStartTimeChange: (val: string) => void;
    onEndTimeChange: (val: string) => void;
}

export function ExamSchedulePicker({
    startTime,
    endTime,
    onStartTimeChange,
    onEndTimeChange,
}: ExamSchedulePickerProps) {
    const hasCustomSchedule = Boolean(startTime || endTime);
    const [overrideMode, setOverrideMode] = useState<'always' | 'custom' | null>(null);

    const scheduleMode = overrideMode ?? (hasCustomSchedule ? 'custom' : 'always');

    const handleModeChange = (mode: 'always' | 'custom') => {
        setOverrideMode(mode);

        if (mode === 'always') {
            onStartTimeChange('');
            onEndTimeChange('');
        }
    };

    const formatHumanReadable = (dateStr?: string) => {
        if (!dateStr) {
return null;
}

        const formatted = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
        const d = new Date(formatted);

        if (isNaN(d.getTime())) {
return null;
}

        return d.toLocaleString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }) + ' WIB';
    };

    return (
        <div className="space-y-4">
            {/* Mode Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => handleModeChange('always')}
                    className={`p-3.5 rounded-lg border text-left transition-colors ${
                        scheduleMode === 'always'
                            ? 'border-primary bg-primary/5 font-medium'
                            : 'border-input bg-background/50 hover:bg-accent/30 text-muted-foreground'
                    }`}
                >
                    <p className="text-sm font-medium text-foreground">Buka Langsung (Tanpa Batas Jadwal)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Dapat dikerjakan siswa kapan saja setelah diterbitkan.
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() => handleModeChange('custom')}
                    className={`p-3.5 rounded-lg border text-left transition-colors ${
                        scheduleMode === 'custom'
                            ? 'border-primary bg-primary/5 font-medium'
                            : 'border-input bg-background/50 hover:bg-accent/30 text-muted-foreground'
                    }`}
                >
                    <p className="text-sm font-medium text-foreground">Atur Jadwal Buka & Tutup Spesifik</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Batasi tanggal dan jam akses pengerjaan siswa.
                    </p>
                </button>
            </div>

            {/* Custom Schedule Inputs */}
            {scheduleMode === 'custom' && (
                <div className="p-4 rounded-lg border bg-background/40 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Waktu Buka */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="start_time" className="text-xs font-medium">
                                    Waktu Buka Ujian
                                </Label>
                                {startTime && (
                                    <button
                                        type="button"
                                        onClick={() => onStartTimeChange('')}
                                        className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-0.5"
                                    >
                                        <X className="h-3 w-3" /> Hapus
                                    </button>
                                )}
                            </div>
                            <Input
                                id="start_time"
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => onStartTimeChange(e.target.value)}
                                className="text-xs h-9"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Waktu ujian mulai dapat diakses oleh siswa.
                            </p>
                        </div>

                        {/* Waktu Tutup */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="end_time" className="text-xs font-medium">
                                    Waktu Tutup Ujian (Opsional)
                                </Label>
                                {endTime && (
                                    <button
                                        type="button"
                                        onClick={() => onEndTimeChange('')}
                                        className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-0.5"
                                    >
                                        <X className="h-3 w-3" /> Hapus
                                    </button>
                                )}
                            </div>
                            <Input
                                id="end_time"
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => onEndTimeChange(e.target.value)}
                                className="text-xs h-9"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Batas akhir siswa dapat memulai sesi ujian baru.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Live Clean Ringkasan Jadwal */}
            <div className="p-3 rounded-lg border bg-accent/20 text-xs space-y-1">
                <p className="font-semibold text-muted-foreground">Ringkasan Akses Siswa:</p>
                {scheduleMode === 'always' ? (
                    <p className="text-foreground">
                        • Ujian terbuka bebas (dapat dikerjakan kapan saja oleh siswa terdaftar).
                    </p>
                ) : (
                    <div className="space-y-1 pt-0.5">
                        <p className="text-foreground">
                            • <span className="font-medium">Buka Ujian:</span>{' '}
                            {startTime ? (
                                <span>{formatHumanReadable(startTime)}</span>
                            ) : (
                                <span className="text-muted-foreground italic">Langsung Buka</span>
                            )}
                        </p>
                        <p className="text-foreground">
                            • <span className="font-medium">Tutup Ujian:</span>{' '}
                            {endTime ? (
                                <span>{formatHumanReadable(endTime)}</span>
                            ) : (
                                <span className="text-muted-foreground italic">Tanpa Batas Tutup</span>
                            )}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
