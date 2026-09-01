import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { toolShortcutPath } from '../../routing/paths';
import { useJobQueue } from '../../shell/jobs';
import { useToast } from '../../shell/toast';
import { outputFilename } from '../_shared/image/convert';
import { compressImage } from '../_shared/image/compress';
import { getFormat, IMAGE_FORMATS } from '../_shared/image/formats';
import { ContinueWithNextTool, useImageToolSession } from '../_shared/image/useImageToolSession';
import {
    formatBytes,
    ImageWorkbenchShell,
    type WorkbenchFile,
} from '../_shared/image/workbench';
import { downloadBlob } from '../_shared/pdf/io';
import type { ImageFormatId } from '../_shared/image/types';

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

    const [fileEntries, setFileEntries] = useState<WorkbenchFile[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [quality, setQuality] = useState(0.82);
    const [outputFormat, setOutputFormat] = useState<ImageFormatId>('jpg');
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [jobDoneCount, setJobDoneCount] = useState(0);
    const [jobStatus, setJobStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
    const processedRef = useRef<Map<string, ProcessedFile>>(new Map());
    const [, setProcessedTick] = useState(0);
    const [previewAfter, setPreviewAfter] = useState<Blob | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const { toast } = useToast();
    const { enqueueBatch, reattachBatch, getResumableJobForRoute, canResumeJob } = useJobQueue();

    const working = jobStatus === 'running';
    const accept = '.heic,.heif,.png,.jpg,.jpeg,.webp';
    const selected = fileEntries.find((entry) => entry.id === selectedId) ?? fileEntries[0];
    const selectedResult =
        jobStatus === 'completed' && selected ? processedRef.current.get(selected.id) : undefined;
    const afterBlob = previewAfter;

    useEffect(() => {
        if (!selected) {
            setPreviewAfter(null);
            setPreviewLoading(false);
            return;
        }
        setPreviewAfter(null);
        setPreviewLoading(true);
        let cancelled = false;
        const timer = window.setTimeout(() => {
            void compressImage(selected.file, selected.file.name, {
                quality,
                format: outputFormat,
            })
                .then((blob) => {
                    if (!cancelled) {
                        setPreviewAfter(blob);
                        setPreviewLoading(false);
                    }
                })
                .catch(() => {
                    if (!cancelled) {
                        setPreviewAfter(null);
                        setPreviewLoading(false);
                    }
                });
        }, 280);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [selected, quality, outputFormat]);

    const acceptIncomingFile = useCallback((file: File) => {
        const id = crypto.randomUUID();
        setFileEntries([{ id, file }]);
        setSelectedId(id);
        setJobDoneCount(0);
        setJobStatus('idle');
        processedRef.current.clear();
        setProcessedTick((n) => n + 1);
    }, []);

    useImageToolSession({ toolId: tool.id, onIncomingFile: acceptIncomingFile });

    function syncFromJob(job: {
        id: string;
        status: string;
        progress: number;
        items: { status: string }[];
    }) {
        setActiveJobId(job.id);
        setJobDoneCount(job.items.filter((item) => item.status === 'done').length);
        if (job.status === 'running' || job.status === 'queued') setJobStatus('running');
        else if (job.status === 'paused') setJobStatus('paused');
        else if (job.status === 'completed') {
            setJobStatus('completed');
            setProcessedTick((n) => n + 1);
        } else setJobStatus('idle');
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

    function appendFiles(list: File[] | FileList) {
        const next = Array.from(list).map((file) => ({ id: crypto.randomUUID(), file }));
        if (!next.length) return;
        setFileEntries((prev) => [...prev, ...next]);
        setSelectedId(next[0]?.id ?? null);
        setJobDoneCount(0);
        setJobStatus('idle');
        processedRef.current.clear();
        setProcessedTick((n) => n + 1);
    }

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
        setJobDoneCount(0);
    }

    const done = !working && jobStatus === 'completed' && jobDoneCount > 0;

    return (
        <ImageWorkbenchShell
            files={fileEntries}
            selectedId={selectedId}
            onSelectFile={setSelectedId}
            onFiles={appendFiles}
            accept={accept}
            working={working}
            beforeBlob={selected?.file ?? null}
            afterBlob={afterBlob}
            afterLoading={previewLoading}
            display="compare-slider"
            beforeLabel="Original"
            afterLabel="Komprimiert"
            emptyTitle="Bild hier ablegen"
            emptyHint="JPG, PNG, WebP oder HEIC. Komprimierung läuft lokal im Browser."
            rail={
                <>
                    <label className="block space-y-2">
                        <span className="flex items-baseline justify-between font-display text-[13px] font-bold">
                            Qualität
                            <span className="tabular-nums">{Math.round(quality * 100)}%</span>
                        </span>
                        <input
                            type="range"
                            className="w-full"
                            min={0.1}
                            max={1}
                            step={0.01}
                            value={quality}
                            onChange={(event) => setQuality(Number(event.target.value))}
                            disabled={working}
                            aria-label="Komprimierungsqualität"
                        />
                    </label>

                    <label className="block space-y-1">
                        <span className="font-display text-[13px] font-bold">Zielformat</span>
                        <select
                            className="ms-input w-full"
                            value={outputFormat}
                            onChange={(event) =>
                                setOutputFormat(event.target.value as ImageFormatId)
                            }
                            disabled={working}
                        >
                            {OUTPUT_FORMATS.map((id) => (
                                <option key={id} value={id}>
                                    {getFormat(id).label}
                                </option>
                            ))}
                        </select>
                    </label>

                    {selected ? (
                        <p className="text-[12px] text-[var(--color-ink-soft)]">
                            {fileEntries.length === 1
                                ? formatBytes(selected.file.size)
                                : `${fileEntries.length} Dateien · Fokus ${formatBytes(selected.file.size)}`}
                        </p>
                    ) : (
                        <p className="text-[12px] text-[var(--color-ink-soft)]">
                            Noch kein Bild. Ablage in der Mitte, Dateien links.
                        </p>
                    )}

                    <div className="mt-auto flex flex-col gap-2">
                        <button
                            type="button"
                            className="ms-btn-primary w-full"
                            disabled={!fileEntries.length || working}
                            onClick={startCompress}
                        >
                            {fileEntries.length
                                ? `${fileEntries.length} ${fileEntries.length === 1 ? 'Bild' : 'Bilder'} komprimieren`
                                : 'Komprimieren'}
                        </button>

                        {done ? (
                            <>
                                <button
                                    type="button"
                                    className="ms-btn w-full"
                                    onClick={() => {
                                        for (const processed of processedRef.current.values()) {
                                            downloadBlob(processed.blob, processed.filename);
                                        }
                                        toast({
                                            message: 'Downloads gestartet',
                                            variant: 'success',
                                        });
                                    }}
                                >
                                    {jobDoneCount === 1 ? 'Herunterladen' : `${jobDoneCount} Dateien laden`}
                                </button>
                                {selectedResult ? (
                                    <ContinueWithNextTool
                                        toolId={tool.id}
                                        resultBlob={selectedResult.blob}
                                        resultFilename={selectedResult.filename}
                                    />
                                ) : null}
                            </>
                        ) : null}
                    </div>
                </>
            }
        />
    );
}
