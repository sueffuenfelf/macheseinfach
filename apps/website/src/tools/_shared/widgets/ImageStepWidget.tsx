import { useCallback, useEffect, useRef, useState } from 'react';
import { useFileDrop } from '../../../hooks/useFileDrop';
import type { WidgetComponentProps } from '../../../shell/widgets/types';
import type { WidgetImageStepOptions } from '../../../shell/workspaces/image-step-options';
import { filterAcceptedImageFiles } from '../image/accept';
import {
    artifactToFile,
    createImageArtifactFromBlob,
    getImageArtifactAsync,
} from '../image/artifact-store';
import { compressImage } from '../image/compress';
import { convertImage, outputFilename } from '../image/convert';
import { stripExif } from '../image/exif';
import { formatFromBlob } from '../image/canvas';
import { downloadBlob } from '../pdf/io';
import { resizeImage } from '../image/resize';
import type { ImageFormatId } from '../image/types';
import { WidgetCard } from './WidgetCard';

export type ImageStepKind = 'convert' | 'compress' | 'resize' | 'exif-strip';

export type ImageStepConfig = {
    kind: ImageStepKind;
    convert?: { to: ImageFormatId };
    compress?: { quality: number; format?: ImageFormatId };
    resize?: { maxWidth?: number; maxHeight?: number; format?: ImageFormatId };
    exif?: { format?: ImageFormatId };
};

export function imageStepOptionsToConfig(options: WidgetImageStepOptions): ImageStepConfig {
    switch (options.kind) {
        case 'convert':
            return {
                kind: 'convert',
                convert: {
                    to: options.convertTo ?? 'jpg',
                },
            };
        case 'compress':
            return {
                kind: 'compress',
                compress: {
                    quality: (options.compressQuality ?? 82) / 100,
                    format: options.compressFormat,
                },
            };
        case 'resize':
            return {
                kind: 'resize',
                resize: {
                    maxWidth: options.resizeMaxWidth,
                    maxHeight: options.resizeMaxHeight,
                    format: options.resizeFormat,
                },
            };
        case 'exif-strip':
            return {
                kind: 'exif-strip',
                exif: { format: options.exifFormat },
            };
    }
}

type ImageStepWidgetProps = WidgetComponentProps & {
    title: string;
    step: ImageStepConfig;
    acceptLabel: string;
    actionLabel: string;
};

function formatBytes(bytes: number): string {
    if (bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** exp;
    return `${value.toFixed(value >= 10 || exp === 0 ? 0 : 1)} ${units[exp]}`;
}

async function processImageStep(
    blob: Blob,
    filename: string,
    step: ImageStepConfig,
): Promise<{ blob: Blob; filename: string }> {
    switch (step.kind) {
        case 'convert': {
            const from = formatFromBlob(blob, filename);
            const to = step.convert?.to ?? 'jpg';
            const result = await convertImage(blob, from, to);
            return { blob: result, filename: outputFilename(filename, to) };
        }
        case 'compress': {
            const quality = step.compress?.quality ?? 0.82;
            const format = step.compress?.format;
            const result = await compressImage(blob, filename, { quality, format });
            const outFormat = format ?? formatFromBlob(blob, filename);
            return { blob: result, filename: outputFilename(filename, outFormat) };
        }
        case 'resize': {
            const result = await resizeImage(blob, filename, {
                maxWidth: step.resize?.maxWidth,
                maxHeight: step.resize?.maxHeight,
                format: step.resize?.format,
            });
            const outFormat = step.resize?.format ?? formatFromBlob(blob, filename);
            return { blob: result, filename: outputFilename(filename, outFormat) };
        }
        case 'exif-strip': {
            const result = await stripExif(blob, filename, { format: step.exif?.format });
            const outFormat = step.exif?.format ?? formatFromBlob(blob, filename);
            return { blob: result, filename: outputFilename(filename, outFormat) };
        }
    }
}

function ImageStepWidget({
    embedded,
    linkedArtifactId,
    linkedArtifactSourceLabel,
    useLinkedArtifactInput = true,
    imageStepOptions,
    onEmitLinkValue,
    title,
    step: defaultStep,
    acceptLabel,
    actionLabel,
    pipelineLinkingHint,
}: ImageStepWidgetProps) {
    const step = imageStepOptions ? imageStepOptionsToConfig(imageStepOptions) : defaultStep;
    const stepKey = JSON.stringify(step);

    const [status, setStatus] = useState('Bereit');
    const [outputLabel, setOutputLabel] = useState('');
    const [outputArtifact, setOutputArtifact] = useState<{ blob: Blob; filename: string } | null>(
        null,
    );
    const [working, setWorking] = useState(false);
    const lastInputRef = useRef<string | null>(null);
    const workingRef = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const stepRef = useRef(step);
    stepRef.current = step;

    useEffect(() => {
        lastInputRef.current = null;
        setOutputArtifact(null);
        setOutputLabel('');
        setStatus('Bereit');
    }, [stepKey]);

    const runWithBlob = useCallback(
        async (blob: Blob, filename: string, inputKey: string) => {
            if (workingRef.current || lastInputRef.current === inputKey) return;
            lastInputRef.current = inputKey;
            workingRef.current = true;
            setWorking(true);
            setStatus('Verarbeitung …');
            setOutputArtifact(null);
            try {
                const { blob: resultBlob, filename: resultName } = await processImageStep(
                    blob,
                    filename,
                    stepRef.current,
                );
                const artifact = await createImageArtifactFromBlob(resultBlob, resultName);
                const label = `${artifact.filename} · ${artifact.width}×${artifact.height} · ${formatBytes(artifact.byteSize)}`;
                setOutputLabel(label);
                setOutputArtifact({ blob: artifact.blob, filename: artifact.filename });
                setStatus('Fertig');
                onEmitLinkValue?.('imageArtifact', artifact.id);
                onEmitLinkValue?.('fileName', artifact.filename);
                onEmitLinkValue?.('status', 'Fertig');
            } catch {
                setOutputLabel('');
                setOutputArtifact(null);
                setStatus('Fehler bei der Verarbeitung');
                onEmitLinkValue?.('imageArtifact', '');
                onEmitLinkValue?.('status', 'Fehler');
                lastInputRef.current = null;
            } finally {
                workingRef.current = false;
                setWorking(false);
            }
        },
        [onEmitLinkValue],
    );

    useEffect(() => {
        if (!useLinkedArtifactInput || !linkedArtifactId?.trim()) return;
        const artifactId = linkedArtifactId;
        let cancelled = false;
        void (async () => {
            const artifact = await getImageArtifactAsync(artifactId);
            if (cancelled || !artifact) {
                if (!cancelled && !artifact) {
                    setStatus('Eingabe-Artefakt nicht gefunden');
                }
                return;
            }
            await runWithBlob(artifact.blob, artifact.filename, artifactId);
        })();
        return () => {
            cancelled = true;
        };
    }, [linkedArtifactId, useLinkedArtifactInput, stepKey, runWithBlob]);

    const handleLocalFile = useCallback(
        async (files: File[]) => {
            const file = files[0];
            if (!file) return;
            lastInputRef.current = null;
            await runWithBlob(file, file.name, `local:${file.name}:${file.size}:${file.lastModified}`);
        },
        [runWithBlob],
    );

    const { dragOver, onDragOver, onDragLeave, onDrop } = useFileDrop(
        (files) => void handleLocalFile(files),
        { filter: filterAcceptedImageFiles },
    );

    return (
        <WidgetCard title={title} embedded={embedded}>
            <div className="widget-file-task">
                <div className="widget-file-task__rows">
                    {linkedArtifactSourceLabel && useLinkedArtifactInput ? (
                        <p className="widget-file-task__hint text-[11px] text-[var(--color-ink-soft)]">
                            Eingabe: {linkedArtifactSourceLabel}
                        </p>
                    ) : null}
                    {pipelineLinkingHint ? (
                        <p className="widget-file-task__hint rounded-[8px] border-2 border-black bg-[var(--color-brand-soft)] px-2 py-1.5 text-[11px] text-[var(--color-ink-soft)]">
                            Verknüpfungen in den Einstellungen unter „Erweiterte Widget-Verknüpfungen"
                            aktivieren, dann Quelle im Zahnrad wählen.
                        </p>
                    ) : null}
                    <div
                        className="widget-file-task__row widget-file-task__row--drop ms-dropzone"
                        data-drag={dragOver}
                        role="button"
                        tabIndex={working ? -1 : 0}
                        aria-label={actionLabel}
                        aria-busy={working}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => {
                            if (working) return;
                            fileInputRef.current?.click();
                        }}
                        onKeyDown={(event) => {
                            if (working) return;
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                fileInputRef.current?.click();
                            }
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".heic,.heif,.png,.jpg,.jpeg,.webp"
                            className="ms-sr-only"
                            aria-hidden
                            disabled={working}
                            onChange={(event) => {
                                void handleLocalFile(
                                    filterAcceptedImageFiles(event.target.files ?? []),
                                );
                                event.target.value = '';
                            }}
                        />
                        <span className="widget-file-task__drop-title">
                            {working
                                ? 'Verarbeitung …'
                                : dragOver
                                  ? 'Loslassen zum Ablegen'
                                  : actionLabel}
                        </span>
                        <span className="widget-file-task__drop-sub">{acceptLabel}</span>
                    </div>
                    <div className="widget-file-task__row widget-file-task__row--meta" aria-live="polite">
                        {outputLabel ? (
                            <p className="widget-file-task__meta-list">{outputLabel}</p>
                        ) : (
                            <p className="widget-file-task__hint">Noch kein Ergebnis.</p>
                        )}
                    </div>
                    <div className="widget-file-task__row widget-file-task__row--actions">
                        {outputArtifact && status === 'Fertig' ? (
                            <button
                                type="button"
                                className="ms-btn widget-file-task__download"
                                aria-label="Herunterladen"
                                onClick={() =>
                                    downloadBlob(outputArtifact.blob, outputArtifact.filename)
                                }
                            >
                                ↓ Herunterladen
                            </button>
                        ) : null}
                        <p className="widget-file-task__footer">
                            {working ? 'Verarbeitung …' : status}
                        </p>
                    </div>
                </div>
            </div>
        </WidgetCard>
    );
}

type CreateImageStepWidgetOptions = {
    widgetId: string;
    title: string;
    description: string;
    tags?: string[];
    step: ImageStepConfig;
    acceptLabel?: string;
    actionLabel?: string;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
    defaultW?: number;
    defaultH?: number;
};

export function createImageStepWidget(
    toolId: 'image-convert' | 'image-compress' | 'image-resize' | 'image-exif-strip',
    options: CreateImageStepWidgetOptions,
) {
    const title = options.title;
    return {
        id: options.widgetId,
        title,
        description: options.description,
        tags: options.tags ?? ['Bild', 'Pipeline'],
        toolId,
        component: (props: WidgetComponentProps) => (
            <ImageStepWidget
                {...props}
                title={title}
                step={options.step}
                acceptLabel={options.acceptLabel ?? 'HEIC, PNG, JPG, WebP'}
                actionLabel={options.actionLabel ?? 'Bild wählen'}
            />
        ),
        outputPorts: [
            { id: 'imageArtifact' as const, label: 'Bild-Artefakt' },
            { id: 'fileName' as const, label: 'Dateiname' },
            { id: 'status' as const, label: 'Status' },
        ],
        supportsLinkedInput: true,
        imageStepKind: options.step.kind,
        minW: options.minW ?? 4,
        maxW: options.maxW ?? 8,
        minH: options.minH ?? 3,
        maxH: options.maxH ?? 8,
        defaultW: options.defaultW ?? 5,
        defaultH: options.defaultH ?? 4,
    };
}

export async function artifactIdToFile(artifactId: string): Promise<File | null> {
    const artifact = await getImageArtifactAsync(artifactId);
    return artifact ? artifactToFile(artifact) : null;
}
