import { useCallback, useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { ResultCard, StateHint } from '../_shared/_shared';
import { IMAGE_ACCEPT } from '../_shared/image/accept';
import { outputFilename } from '../_shared/image/convert';
import { cropImage, FULL_CROP, type CropRect } from '../_shared/image/crop';
import { getFormat, IMAGE_FORMATS } from '../_shared/image/formats';
import { ImageRectCropCanvas } from '../_shared/image/ImageRectCropCanvas';
import { downloadBlob } from '../_shared/pdf/io';
import type { ImageFormatId } from '../_shared/image/types';
import { ContinueWithNextTool, useImageToolSession } from '../_shared/image/useImageToolSession';

type ImageCropToolProps = {
    tool: Tool;
};

const OUTPUT_FORMATS = (['jpg', 'png', 'webp'] as const).filter(
    (id) => IMAGE_FORMATS[id].status === 'live',
);

export function ImageCropTool({ tool }: ImageCropToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [rect, setRect] = useState<CropRect>(FULL_CROP);
    const [outputFormat, setOutputFormat] = useState<ImageFormatId>('jpg');
    const [working, setWorking] = useState(false);
    const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    const acceptIncoming = useCallback((incoming: File) => {
        setFile(incoming);
        setRect(FULL_CROP);
        setResult(null);
    }, []);

    useImageToolSession({ toolId: tool.id, onIncomingFile: acceptIncoming });

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        const next = files[0];
        if (next) acceptIncoming(next);
    });

    async function cropAndDownload() {
        if (!file || working) return;
        setWorking(true);
        try {
            const blob = await cropImage(file, file.name, rect, { format: outputFormat });
            const filename = outputFilename(file.name, outputFormat);
            setResult({ blob, filename });
            downloadBlob(blob, filename);
            toast({ message: 'Zugeschnittenes Bild heruntergeladen', variant: 'success' });
        } catch {
            toast({ message: 'Zuschneiden fehlgeschlagen', variant: 'error' });
        } finally {
            setWorking(false);
        }
    }

    return (
        <>
            <div className="ms-animate-fade mx-auto w-full max-w-3xl space-y-4 px-4 py-6 md:px-6">
                {!file ? (
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
                            Rechteck auf dem Bild ziehen — Export als JPG, PNG oder WebP.
                        </p>
                        <button
                            type="button"
                            className="ms-btn mt-4"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Bild auswählen
                        </button>
                        <input
                            ref={fileInputRef}
                            className="ms-sr-only"
                            type="file"
                            accept={IMAGE_ACCEPT}
                            onChange={(e) => {
                                const next = e.target.files?.[0];
                                if (next) acceptIncoming(next);
                            }}
                        />
                    </section>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="ms-badge bg-[var(--color-chip)] px-3 py-1 text-[12px]">
                                {file.name}
                            </span>
                            <button
                                type="button"
                                className="ms-btn text-[12px]"
                                onClick={() => {
                                    setFile(null);
                                    setRect(FULL_CROP);
                                    setResult(null);
                                }}
                            >
                                Anderes Bild
                            </button>
                        </div>

                        <ImageRectCropCanvas
                            file={file}
                            rect={rect}
                            onRectChange={setRect}
                            disabled={working}
                        />

                        <label className="block space-y-1">
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

                        {result ? (
                            <ResultCard tone="success" heading="Bild zugeschnitten">
                                <ContinueWithNextTool
                                    toolId={tool.id}
                                    resultBlob={result.blob}
                                    resultFilename={result.filename}
                                />
                            </ResultCard>
                        ) : null}

                        <button
                            type="button"
                            className="ms-btn-primary w-full"
                            disabled={working}
                            onClick={() => void cropAndDownload()}
                        >
                            Zuschneiden & herunterladen
                        </button>
                    </>
                )}

                <StateHint>Läuft komplett im Browser — kein Upload.</StateHint>
            </div>
        </>
    );
}
