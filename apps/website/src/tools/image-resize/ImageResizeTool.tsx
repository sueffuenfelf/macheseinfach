import { useCallback, useEffect, useRef, useState } from 'react';
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
import { resizeImage } from '../_shared/image/resize';
import { downloadBlob } from '../_shared/pdf/io';
import { isUnitQuad, type Quad, UNIT_QUAD } from '../_shared/image/perspective';
import type { ImageFormatId } from '../_shared/image/types';
import { ContinueWithNextTool, useImageToolSession } from '../_shared/image/useImageToolSession';
import { ImageResizeCanvas } from './ImageResizeCanvas';

type ImageResizeToolProps = {
    tool: Tool;
};

type ResizePayload = {
    file: File;
    maxWidth?: number;
    maxHeight?: number;
    format: ImageFormatId;
    quad?: Quad;
};

type ProcessedFile = {
    blob: Blob;
    filename: string;
};

const OUTPUT_FORMATS = (['jpg', 'png', 'webp'] as const).filter(
    (id) => IMAGE_FORMATS[id].status === 'live',
);

export function ImageResizeTool({ tool }: ImageResizeToolProps) {
    const location = useLocation();
    const route = `${location.pathname}${location.search}`;
    const shortcutRoute = toolShortcutPath(tool.id);

    const [fileEntries, setFileEntries] = useState<{ id: string; file: File }[]>([]);
    const [maxWidth, setMaxWidth] = useState('1920');
    const [maxHeight, setMaxHeight] = useState('1080');
    const [keepAspect, setKeepAspect] = useState(true);
    const [outputFormat, setOutputFormat] = useState<ImageFormatId>('jpg');
    const [quad, setQuad] = useState<Quad>(UNIT_QUAD);
    const hasCut = !isUnitQuad(quad);
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

    function parseLimit(value: string): number | undefined {
        const n = Number.parseInt(value, 10);
        return Number.isFinite(n) && n > 0 ? n : undefined;
    }

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

    function buildOptions() {
        return {
            maxWidth: parseLimit(maxWidth),
            maxHeight: parseLimit(maxHeight),
            format: outputFormat,
            quad,
        };
    }

    function buildProcessor() {
        return async (payload: ResizePayload, meta: { itemId: string }) => {
            const blob = await resizeImage(payload.file, payload.file.name, {
                maxWidth: payload.maxWidth,
                maxHeight: payload.maxHeight,
                format: payload.format,
                quad: payload.quad,
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

        const opts = buildOptions();
        if (!canResumeJob(resumable.id) && fileEntries.length === resumable.items.length) {
            reattachBatch({
                jobId: resumable.id,
                payloads: fileEntries.map((entry) => ({
                    file: entry.file,
                    ...opts,
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
        maxHeight,
        maxWidth,
        outputFormat,
        quad,
        reattachBatch,
        route,
        shortcutRoute,
    ]);

    function startResize() {
        if (!fileEntries.length || working) return;
        const opts = buildOptions();
        // Ein gezogener Ausschnitt gibt die Größe bereits vor — dann sind die Felder optional.
        if (!opts.maxWidth && !opts.maxHeight && !hasCut) {
            toast({ message: 'Bitte max. Breite oder Höhe angeben', variant: 'info' });
            return;
        }

        const items = fileEntries.map((entry) => ({ id: entry.id, label: entry.file.name }));
        const payloads = fileEntries.map((entry) => ({ file: entry.file, ...opts }));

        const jobId = enqueueBatch({
            context: {
                label: `${tool.title} · max ${opts.maxWidth ?? '—'}×${opts.maxHeight ?? '—'}`,
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
                        Abmessungen reduzieren — Seitenverhältnis bleibt erhalten.
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

                {fileEntries[0] ? (
                    <ImageResizeCanvas
                        key={fileEntries[0].id}
                        file={fileEntries[0].file}
                        quad={quad}
                        onQuadChange={setQuad}
                        maxWidth={maxWidth}
                        maxHeight={maxHeight}
                        disabled={working}
                    />
                ) : null}

                {fileEntries.length > 1 ? (
                    <StateHint>
                        Der gezogene Ausschnitt gilt für alle {fileEntries.length} Bilder des
                        Stapels.
                    </StateHint>
                ) : null}

                <section className="grid gap-4 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm md:grid-cols-2">
                    {hasCut ? (
                        <p className="md:col-span-2 rounded-[8px] border-2 border-black bg-[var(--color-brand-soft)] px-3 py-2 text-[12px]">
                            Ein Ausschnitt ist gesetzt — Größe und Seitenverhältnis kommen jetzt vom
                            gezogenen Viereck. Die Felder unten wirken nur noch als Obergrenze.
                        </p>
                    ) : null}
                    <label className="space-y-1">
                        <span className="font-display text-[13px] font-bold">
                            {hasCut ? 'Obergrenze Breite (px)' : 'Max. Breite (px)'}
                        </span>
                        <input
                            className="ms-input w-full"
                            type="number"
                            min={1}
                            value={maxWidth}
                            onChange={(e) => setMaxWidth(e.target.value)}
                            disabled={working}
                            placeholder="z. B. 1920"
                        />
                    </label>
                    <label className="space-y-1">
                        <span className="font-display text-[13px] font-bold">
                            {hasCut ? 'Obergrenze Höhe (px)' : 'Max. Höhe (px)'}
                        </span>
                        <input
                            className="ms-input w-full"
                            type="number"
                            min={1}
                            value={maxHeight}
                            onChange={(e) => setMaxHeight(e.target.value)}
                            disabled={working}
                            placeholder="z. B. 1080"
                        />
                    </label>
                    <label className="flex items-center gap-2 md:col-span-2">
                        <input
                            type="checkbox"
                            checked={keepAspect}
                            onChange={(e) => setKeepAspect(e.target.checked)}
                            disabled={working || hasCut}
                        />
                        <span
                            className={`text-[14px] ${hasCut ? 'text-[var(--color-ink-soft)]' : ''}`}
                        >
                            Seitenverhältnis beibehalten
                            {hasCut ? ' — folgt dem Ausschnitt' : ''}
                        </span>
                    </label>
                    <label className="space-y-1 md:col-span-2">
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
                    <ResultCard
                        tone="success"
                        heading={`Fertig: ${jobDoneCount} Dateien verkleinert`}
                    >
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
                    onClick={startResize}
                >
                    {fileEntries.length
                        ? `${fileEntries.length} Bilder verkleinern`
                        : 'Bilder verkleinern'}
                </button>

                <StateHint>
                    Skaliert nur nach unten — größere Bilder werden nicht hochskaliert. Ein
                    gezogener Ausschnitt wird beim Cut projektiv zu einem Rechteck entzerrt; die
                    Zahlenfelder wirken dann als Obergrenze. Läuft client-seitig.
                </StateHint>
            </div>
        </>
    );
}
