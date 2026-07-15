import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import heic2any from 'heic2any';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useJobQueue } from '../../shell/jobs';
import { toolShortcutPath } from '../../routing/paths';
import { useToast } from '../../shell/toast';
import { ProgressBar, ResultCard, StateHint } from '../_shared/_shared';
import { downloadBlob } from '../_shared/pdf/io';

type HeicToolProps = {
    tool: Tool;
};

type FormatTarget = 'jpg' | 'png';

type HeicPayload = {
    file: File;
    target: FormatTarget;
};

type ConvertedFile = {
    blob: Blob;
    filename: string;
};

async function convertHeic(payload: HeicPayload): Promise<ConvertedFile> {
    const result = await heic2any({
        blob: payload.file,
        toType: payload.target === 'jpg' ? 'image/jpeg' : 'image/png',
        quality: 0.92,
    });
    const blob = (Array.isArray(result) ? result[0] : result) as Blob;
    const ext = payload.target === 'jpg' ? 'jpg' : 'png';
    const base = payload.file.name.replace(/\.(heic|heif)$/i, '') || 'foto';
    return { blob, filename: `${base}.${ext}` };
}

export function HeicTool({ tool }: HeicToolProps) {
    const location = useLocation();
    const route = `${location.pathname}${location.search}`;
    const shortcutRoute = toolShortcutPath(tool.id);

    const [fileEntries, setFileEntries] = useState<{ id: string; file: File }[]>([]);
    const [target, setTarget] = useState<FormatTarget>('jpg');
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [jobProgress, setJobProgress] = useState(0);
    const [jobDoneCount, setJobDoneCount] = useState(0);
    const [jobStatus, setJobStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const convertedRef = useRef<Map<string, ConvertedFile>>(new Map());
    const { toast } = useToast();
    const { enqueueBatch, reattachBatch, getResumableJobForRoute, canResumeJob, pauseJob, resumeJob } =
        useJobQueue();

    const working = jobStatus === 'running';
    const files = fileEntries.map((entry) => entry.file.name);

    function syncFromJob(job: { id: string; status: string; progress: number; items: { status: string }[] }) {
        setActiveJobId(job.id);
        setJobProgress(job.progress);
        setJobDoneCount(job.items.filter((item) => item.status === 'done').length);
        if (job.status === 'running' || job.status === 'queued') setJobStatus('running');
        else if (job.status === 'paused') setJobStatus('paused');
        else if (job.status === 'completed') setJobStatus('completed');
        else setJobStatus('idle');
    }

    function buildProcessor() {
        return async (payload: HeicPayload, meta: { itemId: string }) => {
            const converted = await convertHeic(payload);
            convertedRef.current.set(meta.itemId, converted);
        };
    }

    function appendFiles(list: FileList) {
        const next = Array.from(list).map((file) => ({
            id: crypto.randomUUID(),
            file,
        }));
        if (!next.length) return;
        setFileEntries((prev) => [...prev, ...next]);
        setJobDoneCount(0);
        setJobStatus('idle');
        convertedRef.current.clear();
    }

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((incoming) => appendFiles(incoming));

    useEffect(() => {
        const resumable =
            getResumableJobForRoute(route) ?? getResumableJobForRoute(shortcutRoute);
        if (!resumable || activeJobId === resumable.id) return;
        syncFromJob(resumable);

        if (!canResumeJob(resumable.id) && fileEntries.length === resumable.items.length) {
            reattachBatch({
                jobId: resumable.id,
                payloads: fileEntries.map((entry) => ({ file: entry.file, target })),
                processor: buildProcessor(),
                onStatusChange: syncFromJob,
            });
        }
    }, [
        activeJobId,
        canResumeJob,
        fileEntries,
        getResumableJobForRoute,
        reattachBatch,
        route,
        shortcutRoute,
        target,
    ]);

    function startConvert() {
        if (!fileEntries.length || working) return;

        const items = fileEntries.map((entry) => ({
            id: entry.id,
            label: entry.file.name,
        }));
        const payloads = fileEntries.map((entry) => ({ file: entry.file, target }));

        const jobId = enqueueBatch({
            context: {
                label: `${tool.title} · ${target.toUpperCase()}`,
                toolId: tool.id,
                toolSlug: tool.slug,
                route: route || shortcutRoute,
            },
            items,
            payloads,
            processor: buildProcessor(),
            onStatusChange: syncFromJob,
        });

        setActiveJobId(jobId);
        setJobStatus('running');
        setJobProgress(0);
        setJobDoneCount(0);
    }

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-3xl space-y-4 px-4 py-6 md:px-6" aria-busy={working}>
            <section
                className="ms-dropzone rounded-xl p-6 text-center"
                data-drag={dragOver}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <p className="font-display text-[20px] font-bold tracking-[-0.02em]">HEIC-Fotos hierher ziehen</p>
                <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                    Mehrere Dateien werden in der Warteschlange verarbeitet — du kannst wegnavigieren.
                </p>
                <button type="button" className="ms-btn mt-4" onClick={() => fileInputRef.current?.click()}>
                    Dateien auswählen
                </button>
                <input
                    ref={fileInputRef}
                    className="ms-sr-only"
                    type="file"
                    multiple
                    accept=".heic,.heif"
                    onChange={(e) => {
                        if (e.target.files) appendFiles(e.target.files);
                    }}
                />
            </section>

            {files.length ? (
                <div className="flex flex-wrap gap-2">
                    {files.map((name, idx) => (
                        <span key={`${name}-${idx}`} className="ms-badge bg-[var(--color-chip)] px-3 py-1 text-[12px]">
                            {name}
                        </span>
                    ))}
                </div>
            ) : null}

            <section className="grid gap-4 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm md:grid-cols-[1fr_auto] md:items-center">
                <div className="inline-flex rounded-[999px] border-2 border-black bg-white p-1">
                    <button
                        type="button"
                        className="ms-focus rounded-[999px] px-4 py-1 font-display text-[13px] font-bold"
                        style={{ background: target === 'jpg' ? 'var(--color-info)' : 'transparent' }}
                        onClick={() => setTarget('jpg')}
                        disabled={working}
                    >
                        JPG
                    </button>
                    <button
                        type="button"
                        className="ms-focus rounded-[999px] px-4 py-1 font-display text-[13px] font-bold"
                        style={{ background: target === 'png' ? 'var(--color-info)' : 'transparent' }}
                        onClick={() => setTarget('png')}
                        disabled={working}
                    >
                        PNG
                    </button>
                </div>
                <div className="mx-auto h-[150px] w-[150px] rounded-lg border-2 border-black shadow-brutal-sm md:mx-0">
                    <div
                        className="h-full w-full rounded-md"
                        style={{ background: 'linear-gradient(135deg,#ffd0f0,#dfe6ff)' }}
                        aria-label="Vorschau"
                    />
                </div>
            </section>

            {working || jobStatus === 'paused' ? (
                <div className="space-y-2">
                    <ProgressBar value={jobProgress} max={1} />
                    <p className="text-center text-[12px] text-[var(--color-ink-soft)]">
                        {jobDoneCount} / {fileEntries.length} fertig
                        {jobStatus === 'paused' ? ' · pausiert' : ''}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {working && activeJobId ? (
                            <button type="button" className="ms-btn text-[12px]" onClick={() => pauseJob(activeJobId)}>
                                Pause
                            </button>
                        ) : null}
                        {jobStatus === 'paused' && activeJobId && canResumeJob(activeJobId) ? (
                            <button type="button" className="ms-btn text-[12px]" onClick={() => resumeJob(activeJobId)}>
                                Fortsetzen
                            </button>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {!working && jobStatus === 'completed' && jobDoneCount > 0 ? (
                <ResultCard tone="success" heading={`Fertig: ${jobDoneCount} Dateien konvertiert`}>
                    <button
                        type="button"
                        className="ms-btn-primary"
                        onClick={() => {
                            for (const converted of convertedRef.current.values()) {
                                downloadBlob(converted.blob, converted.filename);
                            }
                            toast({ message: 'Downloads gestartet', variant: 'success' });
                        }}
                    >
                        {jobDoneCount} Dateien herunterladen
                    </button>
                </ResultCard>
            ) : null}

            <button
                type="button"
                className="ms-btn-primary w-full"
                disabled={!fileEntries.length || working}
                onClick={startConvert}
            >
                {fileEntries.length} Fotos umwandeln
            </button>

            <StateHint>
                Ziel-Format: {target.toUpperCase()} · Läuft client-seitig in der Warteschlange — auch im Hintergrund mit
                System-Benachrichtigung (Einstellungen).
            </StateHint>
        </div>
    );
}
