import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { PageHead } from '../../seo/PageHead';
import { ResultCard, StateHint } from '../_shared/_shared';
import { EditorToolShell } from '../_shared/shells/EditorToolShell';
import {
    ToolStickyFooter,
    ToolStickyFooterActions,
    ToolStickyFooterMeta,
} from '../_shared/ToolStickyFooter';
import { IMAGE_ACCEPT } from '../_shared/image/accept';
import {
    adjustImage,
    brightnessContrastFilter,
    clampAdjustValue,
    type BrightnessContrast,
} from '../_shared/image/adjust';
import { outputFilename } from '../_shared/image/convert';
import { getFormat, IMAGE_FORMATS } from '../_shared/image/formats';
import { downloadBlob } from '../_shared/pdf/io';
import type { ImageFormatId } from '../_shared/image/types';
import { ContinueWithNextTool, useImageToolSession } from '../_shared/image/useImageToolSession';

type ImageBrightnessToolProps = {
    tool: Tool;
};

const OUTPUT_FORMATS = (['jpg', 'png', 'webp'] as const).filter(
    (id) => IMAGE_FORMATS[id].status === 'live',
);

export function ImageBrightnessTool({ tool }: ImageBrightnessToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [adjust, setAdjust] = useState<BrightnessContrast>({ brightness: 0, contrast: 0 });
    const [outputFormat, setOutputFormat] = useState<ImageFormatId>('jpg');
    const [working, setWorking] = useState(false);
    const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    const acceptIncoming = useCallback((incoming: File) => {
        setFile(incoming);
        setAdjust({ brightness: 0, contrast: 0 });
        setResult(null);
    }, []);

    useImageToolSession({ toolId: tool.id, onIncomingFile: acceptIncoming });

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        const next = files[0];
        if (next) acceptIncoming(next);
    });

    const previewSrc = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

    useEffect(() => {
        return () => {
            if (previewSrc) URL.revokeObjectURL(previewSrc);
        };
    }, [previewSrc]);

    const filter = brightnessContrastFilter(adjust);

    async function exportImage() {
        if (!file || working) return;
        setWorking(true);
        try {
            const blob = await adjustImage(file, file.name, {
                ...adjust,
                format: outputFormat,
            });
            const filename = outputFilename(file.name, outputFormat);
            setResult({ blob, filename });
            downloadBlob(blob, filename);
            toast({ message: 'Bild angepasst und heruntergeladen', variant: 'success' });
        } catch {
            toast({ message: 'Anpassung fehlgeschlagen', variant: 'error' });
        } finally {
            setWorking(false);
        }
    }

    const footer = file ? (
        <ToolStickyFooter>
            <ToolStickyFooterMeta
                title={`Helligkeit ${adjust.brightness > 0 ? '+' : ''}${adjust.brightness} · Kontrast ${adjust.contrast > 0 ? '+' : ''}${adjust.contrast}`}
                hint="Live-Vorschau — Export übernimmt die Einstellungen"
            />
            <ToolStickyFooterActions>
                <button
                    type="button"
                    className="ms-btn-primary"
                    disabled={working}
                    onClick={() => void exportImage()}
                >
                    Herunterladen
                </button>
            </ToolStickyFooterActions>
        </ToolStickyFooter>
    ) : undefined;

    return (
        <>
            <PageHead fallbackTitle={tool.title} />
            <EditorToolShell tool={tool} footer={footer}>
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
                            Helligkeit und Kontrast für Scans und dunkle Fotos anpassen.
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
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="ms-badge bg-[var(--color-chip)] px-3 py-1 text-[12px]">
                                {file.name}
                            </span>
                            <button
                                type="button"
                                className="ms-btn text-[12px]"
                                onClick={() => setFile(null)}
                            >
                                Anderes Bild
                            </button>
                        </div>

                        <div className="flex justify-center overflow-hidden rounded-xl border-2 border-black bg-[var(--color-chip)] p-4">
                            {previewSrc ? (
                                <img
                                    src={previewSrc}
                                    alt="Vorschau"
                                    className="max-h-[420px] max-w-full object-contain"
                                    style={{ filter }}
                                />
                            ) : null}
                        </div>

                        <section className="grid gap-4 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm">
                            <label className="space-y-2">
                                <span className="font-display text-[13px] font-bold">
                                    Helligkeit ({adjust.brightness > 0 ? '+' : ''}
                                    {adjust.brightness})
                                </span>
                                <input
                                    type="range"
                                    min={-100}
                                    max={100}
                                    value={adjust.brightness}
                                    onChange={(e) =>
                                        setAdjust((prev) => ({
                                            ...prev,
                                            brightness: clampAdjustValue(Number(e.target.value)),
                                        }))
                                    }
                                    className="w-full"
                                />
                            </label>
                            <label className="space-y-2">
                                <span className="font-display text-[13px] font-bold">
                                    Kontrast ({adjust.contrast > 0 ? '+' : ''}
                                    {adjust.contrast})
                                </span>
                                <input
                                    type="range"
                                    min={-100}
                                    max={100}
                                    value={adjust.contrast}
                                    onChange={(e) =>
                                        setAdjust((prev) => ({
                                            ...prev,
                                            contrast: clampAdjustValue(Number(e.target.value)),
                                        }))
                                    }
                                    className="w-full"
                                />
                            </label>
                            <button
                                type="button"
                                className="ms-btn text-[12px] justify-self-start"
                                onClick={() => setAdjust({ brightness: 0, contrast: 0 })}
                            >
                                Zurücksetzen
                            </button>
                            <label className="space-y-1">
                                <span className="font-display text-[13px] font-bold">Zielformat</span>
                                <select
                                    className="ms-input w-full"
                                    value={outputFormat}
                                    onChange={(e) =>
                                        setOutputFormat(e.target.value as ImageFormatId)
                                    }
                                >
                                    {OUTPUT_FORMATS.map((id) => (
                                        <option key={id} value={id}>
                                            {getFormat(id).label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </section>

                        {result ? (
                            <ResultCard tone="success" heading="Bild angepasst">
                                <ContinueWithNextTool
                                    toolId={tool.id}
                                    resultBlob={result.blob}
                                    resultFilename={result.filename}
                                />
                            </ResultCard>
                        ) : null}
                    </div>
                )}

                <StateHint>Live-Vorschau per CSS-Filter — Export nutzt Canvas.</StateHint>
            </EditorToolShell>
        </>
    );
}
