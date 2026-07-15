import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToolVariant } from '../../hooks/useToolVariant';
import { useJobQueue } from '../../shell/jobs';
import { toolShortcutPath } from '../../routing/paths';
import { useToast } from '../../shell/toast';
import { PageHead } from '../../seo/PageHead';
import { ProgressBar, ResultCard, StateHint } from '../_shared/_shared';
import { IMAGE_ACCEPT } from '../_shared/image/accept';
import { formatFromBlob } from '../_shared/image/canvas';
import { convertImage, outputFilename } from '../_shared/image/convert';
import { getFormat, IMAGE_FORMATS, liveTargetFormats } from '../_shared/image/formats';
import { downloadBlob } from '../_shared/pdf/io';
import type { ImageFormatId } from '../_shared/image/types';
import { ContinueWithNextTool, useImageToolSession } from '../_shared/image/useImageToolSession';

type ImageConvertToolProps = {
    tool: Tool;
};

type ConvertPayload = {
    file: File;
    from: ImageFormatId;
    to: ImageFormatId;
};

type ConvertedFile = {
    blob: Blob;
    filename: string;
};

const LIVE_FORMATS = (Object.keys(IMAGE_FORMATS) as ImageFormatId[]).filter(
    (id) => IMAGE_FORMATS[id].status === 'live',
);

const ALL_CONVERT_TARGETS = [
    ...new Set(LIVE_FORMATS.flatMap((id) => liveTargetFormats(id))),
] as ImageFormatId[];

function detectSourceFormat(file: File): ImageFormatId {
    return formatFromBlob(file, file.name);
}

function intersectionTargetFormats(formats: ImageFormatId[]): ImageFormatId[] {
    if (!formats.length) return ALL_CONVERT_TARGETS;
    let options = liveTargetFormats(formats[0]!);
    for (let i = 1; i < formats.length; i++) {
        const next = liveTargetFormats(formats[i]!);
        options = options.filter((target) => next.includes(target));
    }
    return options;
}

function summarizeDetectedFormats(files: File[]): string | null {
    if (!files.length) return null;
    const unique = [...new Set(files.map((file) => detectSourceFormat(file)))];
    if (unique.length === 1) {
        return `Format erkannt: ${getFormat(unique[0]!).label}`;
    }
    return `Formate erkannt: ${unique.map((id) => getFormat(id).label).join(', ')}`;
}

export function ImageConvertTool({ tool }: ImageConvertToolProps) {
    const location = useLocation();
    const route = `${location.pathname}${location.search}`;
    const shortcutRoute = toolShortcutPath(tool.id);
    const { variant, params } = useToolVariant(tool.id);

    const initialTo = (params.to as ImageFormatId | undefined) ?? 'jpg';

    const [fileEntries, setFileEntries] = useState<{ id: string; file: File }[]>([]);
    const [targetFormat, setTargetFormat] = useState<ImageFormatId>(initialTo);
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [jobProgress, setJobProgress] = useState(0);
    const [jobDoneCount, setJobDoneCount] = useState(0);
    const [jobStatus, setJobStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const convertedRef = useRef<Map<string, ConvertedFile>>(new Map());
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
    const detectedFormats = useMemo(
        () => fileEntries.map((entry) => detectSourceFormat(entry.file)),
        [fileEntries],
    );
    const targetOptions = useMemo(
        () => intersectionTargetFormats(detectedFormats),
        [detectedFormats],
    );
    const detectedLabel = useMemo(
        () => summarizeDetectedFormats(fileEntries.map((entry) => entry.file)),
        [fileEntries],
    );

    const acceptIncomingFile = useCallback((file: File) => {
        setFileEntries([{ id: crypto.randomUUID(), file }]);
        setJobDoneCount(0);
        setJobStatus('idle');
        convertedRef.current.clear();
    }, []);

    useImageToolSession({ toolId: tool.id, onIncomingFile: acceptIncomingFile });

    useEffect(() => {
        if (params.to && params.to !== targetFormat) {
            setTargetFormat(params.to as ImageFormatId);
        }
    }, [params.to, targetFormat]);

    useEffect(() => {
        if (!targetOptions.includes(targetFormat)) {
            setTargetFormat(targetOptions[0] ?? 'jpg');
        }
    }, [targetFormat, targetOptions]);

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
        return async (payload: ConvertPayload, meta: { itemId: string }) => {
            const from = detectSourceFormat(payload.file);
            const converted = await convertImage(payload.file, from, payload.to);
            convertedRef.current.set(meta.itemId, {
                blob: converted,
                filename: outputFilename(payload.file.name, payload.to),
            });
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
                    from: detectSourceFormat(entry.file),
                    to: targetFormat,
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
        reattachBatch,
        route,
        shortcutRoute,
        targetFormat,
    ]);

    function startConvert() {
        if (!fileEntries.length || working) return;

        const items = fileEntries.map((entry) => ({
            id: entry.id,
            label: entry.file.name,
        }));
        const payloads = fileEntries.map((entry) => ({
            file: entry.file,
            from: detectSourceFormat(entry.file),
            to: targetFormat,
        }));

        const jobId = enqueueBatch({
            context: {
                label: `${tool.title} · → ${getFormat(targetFormat).label}`,
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

    const heading = variant?.seo.h1 ?? tool.title;

    return (
        <>
            <PageHead variant={variant} fallbackTitle={tool.title} />
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
                        {heading}
                    </p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                        Mehrere Dateien werden in der Warteschlange verarbeitet — du kannst
                        wegnavigieren.
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
                        accept={IMAGE_ACCEPT}
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

                <section className="grid gap-4 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm md:grid-cols-2 md:items-center">
                    {detectedLabel ? (
                        <p className="text-[13px] text-[var(--color-ink-soft)]">{detectedLabel}</p>
                    ) : (
                        <p className="text-[13px] text-[var(--color-ink-soft)]">
                            Quellformat wird automatisch erkannt.
                        </p>
                    )}
                    <label className="space-y-1">
                        <span className="font-display text-[13px] font-bold">Zielformat</span>
                        <select
                            className="ms-input w-full"
                            value={targetFormat}
                            onChange={(e) => setTargetFormat(e.target.value as ImageFormatId)}
                            disabled={working || targetOptions.length === 0}
                        >
                            {targetOptions.map((id) => (
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
                    <ResultCard
                        tone="success"
                        heading={`Fertig: ${jobDoneCount} Dateien konvertiert`}
                    >
                        <div className="flex flex-col gap-2">
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
                            {(() => {
                                const first = convertedRef.current.values().next().value;
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
                    onClick={startConvert}
                >
                    {fileEntries.length} Bilder umwandeln
                </button>

                <StateHint>
                    → {getFormat(targetFormat).label} · Läuft client-seitig in der Warteschlange —
                    auch im Hintergrund mit System-Benachrichtigung (Einstellungen).
                </StateHint>
            </div>
        </>
    );
}
