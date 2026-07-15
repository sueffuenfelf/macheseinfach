import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFileDrop } from '../../../hooks/useFileDrop';
import type { WidgetComponentProps } from '../../../shell/widgets/types';
import { IMAGE_ACCEPT, filterAcceptedImageFiles } from '../image/accept';
import { createImageArtifactFromFile } from '../image/artifact-store';
import { downloadBlob } from '../pdf/io';
import { WidgetCard } from './WidgetCard';

function formatBytes(bytes: number): string {
    if (bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** exp;
    return `${value.toFixed(value >= 10 || exp === 0 ? 0 : 1)} ${units[exp]}`;
}

export function ImageFileDropWidget({ embedded, onEmitLinkValue }: WidgetComponentProps) {
    const [artifactLabel, setArtifactLabel] = useState('');
    const [downloadArtifact, setDownloadArtifact] = useState<{ blob: Blob; filename: string } | null>(
        null,
    );
    const [status, setStatus] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [working, setWorking] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewUrlRef = useRef<string | null>(null);

    const meta = useMemo(() => {
        if (!artifactLabel) return null;
        const match = artifactLabel.match(/^(.+) · (\d+)×(\d+) · (.+)$/);
        if (!match) return { name: artifactLabel, dims: '', size: '' };
        return { name: match[1], dims: `${match[2]}×${match[3]}`, size: match[4] };
    }, [artifactLabel]);

    const setPreview = useCallback((url: string | null) => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }
        if (url) {
            previewUrlRef.current = url;
        }
        setPreviewUrl(url);
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    const applyFiles = useCallback(
        async (files: File[]) => {
            if (files.length === 0) {
                setArtifactLabel('');
                setDownloadArtifact(null);
                setStatus('');
                setPreview(null);
                onEmitLinkValue?.('imageArtifact', '');
                onEmitLinkValue?.('status', '');
                return;
            }
            const file = files[0]!;
            setWorking(true);
            setStatus('Bild wird gelesen …');
            setDownloadArtifact(null);
            try {
                const artifact = await createImageArtifactFromFile(file);
                const label = `${artifact.filename} · ${artifact.width}×${artifact.height} · ${formatBytes(artifact.byteSize)}`;
                setArtifactLabel(label);
                setDownloadArtifact({ blob: artifact.blob, filename: artifact.filename });
                setPreview(URL.createObjectURL(artifact.blob));
                setStatus('Bild bereit');
                onEmitLinkValue?.('imageArtifact', artifact.id);
                onEmitLinkValue?.('fileName', artifact.filename);
                onEmitLinkValue?.('status', 'Bild bereit');
            } catch {
                setArtifactLabel('');
                setDownloadArtifact(null);
                setPreview(null);
                setStatus('Bild konnte nicht gelesen werden');
                onEmitLinkValue?.('imageArtifact', '');
                onEmitLinkValue?.('status', 'Fehler');
            } finally {
                setWorking(false);
            }
        },
        [onEmitLinkValue, setPreview],
    );

    const { dragOver, onDragOver, onDragLeave, onDrop } = useFileDrop(
        (files) => void applyFiles(files),
        { filter: filterAcceptedImageFiles },
    );

    const dropTitle = working
        ? 'Bild wird gelesen …'
        : dragOver
          ? 'Loslassen zum Ablegen'
          : previewUrl
            ? 'Bild abgelegt'
            : 'Bild hier ablegen';

    return (
        <WidgetCard title="Bild ablegen" embedded={embedded}>
            <div className="widget-primitive-file">
                <div className="widget-primitive-file__rows">
                    <div
                        className="widget-primitive-file__row widget-primitive-file__row--drop ms-dropzone"
                        data-drag={dragOver}
                        data-success={Boolean(previewUrl)}
                        role="button"
                        tabIndex={0}
                        aria-label="Bild ablegen oder auswählen"
                        aria-busy={working}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                fileInputRef.current?.click();
                            }
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={IMAGE_ACCEPT}
                            className="ms-sr-only"
                            aria-hidden
                            disabled={working}
                            onChange={(event) => {
                                void applyFiles(filterAcceptedImageFiles(event.target.files ?? []));
                                event.target.value = '';
                            }}
                        />
                        {previewUrl ? (
                            <div className="widget-primitive-file__preview">
                                <img
                                    src={previewUrl}
                                    alt=""
                                    className="widget-primitive-file__preview-img"
                                />
                            </div>
                        ) : null}
                        <span className="widget-primitive-file__title">{dropTitle}</span>
                        <span className="widget-primitive-file__sub">
                            {dragOver
                                ? 'HEIC, PNG, JPG oder WebP'
                                : 'Klicken oder ziehen — HEIC, PNG, JPG, WebP'}
                        </span>
                    </div>
                    <div
                        className="widget-primitive-file__row widget-primitive-file__row--meta"
                        aria-live="polite"
                    >
                        {meta ? (
                            <p className="widget-primitive-file__meta">
                                {meta.name}
                                {meta.dims ? ` · ${meta.dims}` : ''}
                                {meta.size ? ` · ${meta.size}` : ''}
                            </p>
                        ) : (
                            <p className="widget-primitive-file__meta">Noch kein Bild ausgewählt.</p>
                        )}
                    </div>
                    <div className="widget-primitive-file__row widget-primitive-file__row--actions">
                        {downloadArtifact ? (
                            <button
                                type="button"
                                className="ms-btn widget-file-task__download"
                                aria-label="Herunterladen"
                                onClick={() =>
                                    downloadBlob(downloadArtifact.blob, downloadArtifact.filename)
                                }
                            >
                                ↓ Herunterladen
                            </button>
                        ) : null}
                        <p className="widget-primitive-file__status">
                            {status || 'Bereit für Verknüpfungen.'}
                        </p>
                    </div>
                </div>
            </div>
        </WidgetCard>
    );
}

export const IMAGE_FILE_DROP_WIDGET_DEF = {
    id: 'widget-image-file-drop',
    title: 'Bild ablegen',
    description: 'Bild als Artefakt für die Pipeline bereitstellen.',
    tags: ['Bild', 'Pipeline', 'HEIC'],
    toolId: 'image-convert' as const,
    component: ImageFileDropWidget,
    outputPorts: [
        { id: 'imageArtifact' as const, label: 'Bild-Artefakt' },
        { id: 'fileName' as const, label: 'Dateiname' },
        { id: 'status' as const, label: 'Status' },
    ],
    supportsLinkedInput: false,
    minW: 4,
    maxW: 8,
    minH: 3,
    maxH: 6,
    defaultW: 5,
    defaultH: 3,
};
