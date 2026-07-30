import { useCallback, useEffect, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { InfoGrid, ResultCard, StateHint } from '../_shared/_shared';
import { IMAGE_ACCEPT } from '../_shared/image/accept';
import { cropImage, type CropRect } from '../_shared/image/crop';
import { outputFilename } from '../_shared/image/convert';
import { ImageRectCropCanvas } from '../_shared/image/ImageRectCropCanvas';
import {
    checkPassportDimensions,
    defaultPassportCrop,
    PASSPORT_ASPECT,
    type PassportDpiPreset,
    passportPixelSize,
} from '../_shared/image/passport';
import { downloadBlob } from '../_shared/pdf/io';
import { ContinueWithNextTool, useImageToolSession } from '../_shared/image/useImageToolSession';

type ImagePassportPhotoToolProps = {
    tool: Tool;
};

export function ImagePassportPhotoTool({ tool }: ImagePassportPhotoToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [rect, setRect] = useState<CropRect>({ x: 0, y: 0, width: 1, height: 1 });
    const [dpi, setDpi] = useState<PassportDpiPreset>(300);
    const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
    const [working, setWorking] = useState(false);
    const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
    const { toast } = useToast();

    const targetSize = passportPixelSize(dpi);

    const acceptIncoming = useCallback((incoming: File) => {
        setFile(incoming);
        setResult(null);
        setNatural(null);
    }, []);

    useImageToolSession({ toolId: tool.id, onIncomingFile: acceptIncoming });

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        const next = files[0];
        if (next) acceptIncoming(next);
    });

    useEffect(() => {
        if (!natural) return;
        setRect(defaultPassportCrop(natural.width, natural.height));
    }, [natural]);

    async function exportPassport() {
        if (!file || working) return;
        setWorking(true);
        try {
            const cropped = await cropImage(file, file.name, rect, { format: 'jpg', quality: 0.95 });
            const bitmap = await createImageBitmap(cropped);
            const canvas = document.createElement('canvas');
            canvas.width = targetSize.width;
            canvas.height = targetSize.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas nicht verfügbar');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bitmap, 0, 0, targetSize.width, targetSize.height);
            bitmap.close();

            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (b) => (b ? resolve(b) : reject(new Error('Export fehlgeschlagen'))),
                    'image/jpeg',
                    0.95,
                );
            });

            const filename = outputFilename(file.name, 'jpg').replace(/\.jpg$/, `-passfoto-${dpi}dpi.jpg`);
            setResult({ blob, filename });
            downloadBlob(blob, filename);
            toast({ message: `Passfoto (${dpi} DPI) heruntergeladen`, variant: 'success' });
        } catch {
            toast({ message: 'Export fehlgeschlagen', variant: 'error' });
        } finally {
            setWorking(false);
        }
    }

    const check =
        natural &&
        checkPassportDimensions(
            Math.round(rect.width * natural.width),
            Math.round(rect.height * natural.height),
            dpi,
        );

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
                            35×45 mm — Ausschnitt wählen und für biometrische Formulare exportieren.
                        </p>
                        <button
                            type="button"
                            className="ms-btn mt-4"
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = IMAGE_ACCEPT;
                                input.onchange = () => {
                                    const next = input.files?.[0];
                                    if (next) acceptIncoming(next);
                                };
                                input.click();
                            }}
                        >
                            Foto auswählen
                        </button>
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
                                    setNatural(null);
                                    setResult(null);
                                }}
                            >
                                Anderes Foto
                            </button>
                        </div>

                        <ImageRectCropCanvas
                            file={file}
                            rect={rect}
                            onRectChange={setRect}
                            aspect={PASSPORT_ASPECT}
                            disabled={working}
                            title="Passfoto-Ausschnitt (35×45 mm)"
                            onNaturalSize={setNatural}
                        />

                        <section className="grid gap-4 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm md:grid-cols-2">
                            <label className="space-y-1">
                                <span className="font-display text-[13px] font-bold">Auflösung</span>
                                <select
                                    className="ms-input w-full"
                                    value={dpi}
                                    onChange={(e) =>
                                        setDpi(Number(e.target.value) as PassportDpiPreset)
                                    }
                                    disabled={working}
                                >
                                    <option value={300}>300 DPI (Standard)</option>
                                    <option value={600}>600 DPI (hoch)</option>
                                </select>
                            </label>
                            <p className="text-[13px] text-[var(--color-ink-soft)] md:self-end">
                                Ziel: {targetSize.width} × {targetSize.height} px · 35 × 45 mm
                            </p>
                        </section>

                        {check ? (
                            <ResultCard tone={check.tone} heading={check.heading}>
                                <InfoGrid items={check.details} />
                            </ResultCard>
                        ) : null}

                        {result ? (
                            <ResultCard tone="success" heading="Passfoto exportiert">
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
                            disabled={working || !natural}
                            onClick={() => void exportPassport()}
                        >
                            Passfoto exportieren ({dpi} DPI)
                        </button>
                    </>
                )}

                <StateHint>
                    Kein Ersatz für amtliche Passfoto-Prüfung — Hintergrund und Pose selbst prüfen.
                    Läuft im Browser.
                </StateHint>
            </div>
        </>
    );
}
