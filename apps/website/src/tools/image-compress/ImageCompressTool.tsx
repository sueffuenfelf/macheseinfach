import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { toolShortcutPath } from '../../routing/paths';
import { useJobQueue } from '../../shell/jobs';
import { useToast } from '../../shell/toast';
import { PageHead } from '../../seo/PageHead';
import { ProgressBar, ResultCard, StateHint } from '../_shared/_shared';
import { compressImage } from '../_shared/image/compress';
import { getFormat, IMAGE_FORMATS } from '../_shared/image/formats';
import { outputFilename } from '../_shared/image/convert';
import { downloadBlob } from '../_shared/pdf/io';
import type { ImageFormatId } from '../_shared/image/types';
import { ContinueWithNextTool, useImageToolSession } from '../_shared/image/useImageToolSession';

type ImageCompressToolProps = {
    tool: Tool;
};

type CompressPayload = {
    file: File;
    quality: number;
    format: ImageFormatId;
};

type ProcessedFile = {
    blob: Blob;
    filename: string;
};

const OUTPUT_FORMATS = (['jpg', 'png', 'webp'] as const).filter(
    (id) => IMAGE_FORMATS[id].status === 'live',
);

export function ImageCompressTool({ tool }: ImageCompressToolProps) {
    const location = useLocation();
    const route = `${location.pathname}${location.search}`;
    const shortcutRoute = toolShortcutPath(tool.id);

    const [fileEntries, setFileEntries] = useState<{ id: string; file: File }[]>([]);
    const [quality, setQuality] = useState(0.82);
    const [outputFormat, setOutputFormat] = useState<ImageFormatId>('jpg');
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [jobProgress, setJobProgress] = useState(0);
    const [jobDoneCount, setJobDoneCount] = useState(0);
    const [jobStatus, setJobStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const processedRef = useRef<Map<string, ProcessedFile>>(new Map());
    const { toast } = useToast();
    const {
        enqueueBatch,
        reattachBatch,
        getResumableJobForRoute,
        canResumeJob,
        pauseJob,
        resumeJob,
    } = useJobQueue();

    const working = jobStatus === 'running';
    const accept = '.heic,.heif,.png,.jpg,.jpeg,.webp';

    const acceptIncomingFile = useCallback((file: File) => {
        setFileEntries([{ id: crypto.randomUUID(), file }]);
        setJobDoneCount(0);
        setJobStatus('idle');
        processedRef.current.clear();
    }, []);

    useImageToolSession({ toolId: tool.id, onIncomingFile: acceptIncomingFile });

    function syncFromJob(job: {
        id: string;
        status: string;
        progress: number;
        items: { status: string }[];
    }) {
        setActiveJobId(job.id);
        setJobProgress(job.progress);
        setJobDoneCount(job.items.filter((item) => item.status === 'done').length);
        if (job.status === 'running' || job.status === 'queued') setJobStatus('running');
        else if (job.status === 'paused') setJobStatus('paused');
        else if (job.status === 'completed') setJobStatus('completed');
        else setJobStatus('idle');
    }

    function buildProcessor() {
        return async (payload: CompressPayload, meta: { itemId: string }) => {
            const blob = await compressImage(payload.file, payload.file.name, {
                quality: payload.quality,
                format: payload.format,
            });
            processedRef.current.set(meta.itemId, {
                blob,
                filename: outputFilename(payload.file.name, payload.format),
            });
        };
    }

    function appendFiles(list: FileList) {
        const next = Array.from(list).map((file) => ({ id: crypto.randomUUID(), file }));
        if (!next.length) return;
        setFileEntries((prev) => [...prev, ...next]);
        setJobDoneCount(0);
        setJobStatus('idle');
        processedRef.current.clear();
    }

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((incoming) =>
        appendFiles(incoming),
    );

    useEffect(() => {
        const resumable = getResumableJobForRoute(route) ?? getResumableJobForRoute(shortcutRoute);
        if (!resumable || activeJobId === resumable.id) return;
        syncFromJob(resumable);

        if (!canResumeJob(resumable.id) && fileEntries.length === resumable.items.length) {
            reattachBatch({
                jobId: resumable.id,
                payloads: fileEntries.map((entry) => ({
                    file: entry.file,
                    quality,
                    format: outputFormat,
                })),
                processor: buildProcessor(),
                onStatusChange: syncFromJob,
            });
        }
    }, [
        activeJobId,
        canResumeJob,
        fileEntries,
        getResumableJobForRoute,
        outputFormat,
        quality,
        reattachBatch,
        route,
        shortcutRoute,
    ]);

    function startCompress() {
        if (!fileEntries.length || working) return;

        const items = fileEntries.map((entry) => ({ id: entry.id, label: entry.file.name }));
        const payloads = fileEntries.map((entry) => ({
            file: entry.file,
            quality,
            format: outputFormat,
        }));

        const jobId = enqueueBatch({
            context: {
                label: `${tool.title} · Qualität ${Math.round(quality * 100)}%`,
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
        <>
            <PageHead fallbackTitle={tool.title} />
            <div
                className="ms-animate-fade mx-auto w-full max-w-3xl space-y-4 px-4 py-6 md:px-6"
                aria-busy={working}
            >
                <section
                    className="ms-dropzone rounded-xl p-6 text-center"
                    data-drag={dragOver}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <p className="font-display text-[20px] font-bold tracking-[-0.02em]">
                        {tool.title}
                    </p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                        Bilder komprimieren — Qualität und Zielformat einstellen.
                    </p>
                    <button
                        type="button"
                        className="ms-btn mt-4"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Dateien auswählen
                    </button>
                    <input
                        ref={fileInputRef}
                        className="ms-sr-only"
                        type="file"
                        multiple
                        accept={accept}
                        onChange={(e) => {
                            if (e.target.files) appendFiles(e.target.files);
                        }}
                    />
                </section>

                {fileEntries.length ? (
                    <div className="flex flex-wrap gap-2">
                        {fileEntries.map((entry) => (
                            <span
                                key={entry.id}
                                className="ms-badge bg-[var(--color-chip)] px-3 py-1 text-[12px]"
                            >
                                {entry.file.name}
                            </span>
                        ))}
                    </div>
                ) : null}

                <section className="grid gap-4 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm md:grid-cols-2">
                    <label className="space-y-2">
                        <span className="font-display text-[13px] font-bold">
                            Qualität ({Math.round(quality * 100)}%)
                        </span>
                        <input
                            type="range"
                            className="w-full"
                            min={0.1}
                            max={1}
                            step={0.01}
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            disabled={working}
                        />
                    </label>
                    <label className="space-y-1">
                        <span className="font-display text-[13px] font-bold">Zielformat</span>
                        <select
                            className="ms-input w-full"
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value as ImageFormatId)}
                            disabled={working}
                        >
                            {OUTPUT_FORMATS.map((id) => (
                                <option key={id} value={id}>
                                    {getFormat(id).label}
                                </option>
                            ))}
                        </select>
                    </label>
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
                                <button
                                    type="button"
                                    className="ms-btn text-[12px]"
                                    onClick={() => pauseJob(activeJobId)}
                                >
                                    Pause
                                </button>
                            ) : null}
                            {jobStatus === 'paused' && activeJobId && canResumeJob(activeJobId) ? (
                                <button
                                    type="button"
                                    className="ms-btn text-[12px]"
                                    onClick={() => resumeJob(activeJobId)}
                                >
                                    Fortsetzen
                                </button>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                {!working && jobStatus === 'completed' && jobDoneCount > 0 ? (
                    <ResultCard tone="success" heading={`Fertig: ${jobDoneCount} Dateien komprimiert`}>
                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                className="ms-btn-primary"
                                onClick={() => {
                                    for (const processed of processedRef.current.values()) {
                                        downloadBlob(processed.blob, processed.filename);
                                    }
                                    toast({ message: 'Downloads gestartet', variant: 'success' });
                                }}
                            >
                                {jobDoneCount} Dateien herunterladen
                            </button>
                            {(() => {
                                const first = processedRef.current.values().next().value;
                                return first ? (
                                    <ContinueWithNextTool
                                        toolId={tool.id}
                                        resultBlob={first.blob}
                                        resultFilename={first.filename}
                                    />
                                ) : null;
                            })()}
                        </div>
                    </ResultCard>
                ) : null}

                <button
                    type="button"
                    className="ms-btn-primary w-full"
                    disabled={!fileEntries.length || working}
                    onClick={startCompress}
                >
                    {fileEntries.length ? `${fileEntries.length} Bilder komprimieren` : 'Bilder komprimieren'}
                </button>

                <StateHint>
                    Canvas-Neukodierung mit einstellbarer Qualität — läuft client-seitig, ohne Upload.
                </StateHint>
            </div>
        </>
    );
}
