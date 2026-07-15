import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { toolShortcutPath } from '../../routing/paths';
import { useJobQueue } from '../../shell/jobs';
import { useToast } from '../../shell/toast';
import { PageHead } from '../../seo/PageHead';
import { ProgressBar, ResultCard, StateHint } from '../_shared/_shared';
import { outputFilename } from '../_shared/image/convert';
import { getFormat, IMAGE_FORMATS } from '../_shared/image/formats';
import { rotateImage, type RotateAngle } from '../_shared/image/rotate';
import { downloadBlob } from '../_shared/pdf/io';
import type { ImageFormatId } from '../_shared/image/types';

type ImageRotateToolProps = {
    tool: Tool;
};

type RotatePayload = {
    file: File;
    angle?: RotateAngle;
    flipH: boolean;
    flipV: boolean;
    format: ImageFormatId;
};

type ProcessedFile = {
    blob: Blob;
    filename: string;
};

const OUTPUT_FORMATS = (['jpg', 'png', 'webp'] as const).filter(
    (id) => IMAGE_FORMATS[id].status === 'live',
);

export function ImageRotateTool({ tool }: ImageRotateToolProps) {
    const location = useLocation();
    const route = `${location.pathname}${location.search}`;
    const shortcutRoute = toolShortcutPath(tool.id);

    const [fileEntries, setFileEntries] = useState<{ id: string; file: File }[]>([]);
    const [angle, setAngle] = useState<RotateAngle | ''>('');
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
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

    function buildPayload(file: File): RotatePayload {
        return {
            file,
            angle: angle || undefined,
            flipH,
            flipV,
            format: outputFormat,
        };
    }

    function buildProcessor() {
        return async (payload: RotatePayload, meta: { itemId: string }) => {
            const blob = await rotateImage(payload.file, payload.file.name, {
                angle: payload.angle,
                flipH: payload.flipH,
                flipV: payload.flipV,
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
                payloads: fileEntries.map((entry) => buildPayload(entry.file)),
                processor: buildProcessor(),
                onStatusChange: syncFromJob,
            });
        }
    }, [
        activeJobId,
        angle,
        canResumeJob,
        fileEntries,
        flipH,
        flipV,
        getResumableJobForRoute,
        outputFormat,
        reattachBatch,
        route,
        shortcutRoute,
    ]);

    function startRotate() {
        if (!fileEntries.length || working) return;
        if (!angle && !flipH && !flipV) {
            toast({ message: 'Bitte Drehung oder Spiegelung wählen', variant: 'info' });
            return;
        }

        const items = fileEntries.map((entry) => ({ id: entry.id, label: entry.file.name }));
        const payloads = fileEntries.map((entry) => buildPayload(entry.file));

        const jobId = enqueueBatch({
            context: {
                label: tool.title,
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
                        Bilder drehen (90°, 180°, 270°) oder horizontal/vertikal spiegeln.
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

                <section className="grid gap-4 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm">
                    <fieldset className="space-y-2">
                        <legend className="font-display text-[13px] font-bold">Drehung</legend>
                        <div className="flex flex-wrap gap-2">
                            {([90, 180, 270] as const).map((deg) => (
                                <button
                                    key={deg}
                                    type="button"
                                    className={`ms-btn text-[13px] ${angle === deg ? 'ring-2 ring-black' : ''}`}
                                    onClick={() => setAngle(angle === deg ? '' : deg)}
                                    disabled={working}
                                >
                                    {deg}°
                                </button>
                            ))}
                        </div>
                    </fieldset>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={flipH}
                                onChange={(e) => setFlipH(e.target.checked)}
                                disabled={working}
                            />
                            <span className="text-[14px]">Horizontal spiegeln</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={flipV}
                                onChange={(e) => setFlipV(e.target.checked)}
                                disabled={working}
                            />
                            <span className="text-[14px]">Vertikal spiegeln</span>
                        </label>
                    </div>
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
                    <ResultCard tone="success" heading={`Fertig: ${jobDoneCount} Dateien gedreht`}>
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
                    </ResultCard>
                ) : null}

                <button
                    type="button"
                    className="ms-btn-primary w-full"
                    disabled={!fileEntries.length || working}
                    onClick={startRotate}
                >
                    {fileEntries.length ? `${fileEntries.length} Bilder ausrichten` : 'Bilder ausrichten'}
                </button>

                <StateHint>
                    Drehung und Spiegelung per Canvas — läuft client-seitig, ohne Upload.
                </StateHint>
            </div>
        </>
    );
}
