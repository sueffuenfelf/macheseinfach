import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { ResultCard, StateHint } from '../_shared/_shared';
import { EditorToolShell } from '../_shared/shells/EditorToolShell';
import {
    ToolStickyFooter,
    ToolStickyFooterActions,
    ToolStickyFooterMeta,
} from '../_shared/ToolStickyFooter';
import { IMAGE_ACCEPT } from '../_shared/image/accept';
import { outputFilename } from '../_shared/image/convert';
import { getFormat, IMAGE_FORMATS } from '../_shared/image/formats';
import { downloadBlob } from '../_shared/pdf/io';
import type { ImageFormatId } from '../_shared/image/types';
import { ContinueWithNextTool, useImageToolSession } from '../_shared/image/useImageToolSession';
import { watermarkImage, type WatermarkPosition } from '../_shared/image/watermark';

type ImageWatermarkToolProps = {
    tool: Tool;
};

const POSITIONS: { value: WatermarkPosition; label: string }[] = [
    { value: 'top-left', label: 'Oben links' },
    { value: 'top-center', label: 'Oben Mitte' },
    { value: 'top-right', label: 'Oben rechts' },
    { value: 'center-left', label: 'Mitte links' },
    { value: 'center', label: 'Mitte' },
    { value: 'center-right', label: 'Mitte rechts' },
    { value: 'bottom-left', label: 'Unten links' },
    { value: 'bottom-center', label: 'Unten Mitte' },
    { value: 'bottom-right', label: 'Unten rechts' },
];

const OUTPUT_FORMATS = (['jpg', 'png', 'webp'] as const).filter(
    (id) => IMAGE_FORMATS[id].status === 'live',
);

export function ImageWatermarkTool({ tool }: ImageWatermarkToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('© Muster');
    const [position, setPosition] = useState<WatermarkPosition>('bottom-right');
    const [opacity, setOpacity] = useState(50);
    const [fontScale, setFontScale] = useState(5);
    const [outputFormat, setOutputFormat] = useState<ImageFormatId>('jpg');
    const [working, setWorking] = useState(false);
    const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
    const { toast } = useToast();

    const acceptIncoming = useCallback((incoming: File) => {
        setFile(incoming);
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

    async function exportWatermark() {
        if (!file || !text.trim() || working) return;
        setWorking(true);
        try {
            const blob = await watermarkImage(file, file.name, {
                text,
                position,
                opacity: opacity / 100,
                fontScale: fontScale / 100,
                format: outputFormat,
            });
            const filename = outputFilename(file.name, outputFormat);
            setResult({ blob, filename });
            downloadBlob(blob, filename);
            toast({ message: 'Bild mit Wasserzeichen heruntergeladen', variant: 'success' });
        } catch {
            toast({ message: 'Wasserzeichen fehlgeschlagen', variant: 'error' });
        } finally {
            setWorking(false);
        }
    }

    const footer = file ? (
        <ToolStickyFooter>
            <ToolStickyFooterMeta title={text.trim() || 'Text eingeben'} hint={position} />
            <ToolStickyFooterActions>
                <button
                    type="button"
                    className="ms-btn-primary"
                    disabled={working || !text.trim()}
                    onClick={() => void exportWatermark()}
                >
                    Herunterladen
                </button>
            </ToolStickyFooterActions>
        </ToolStickyFooter>
    ) : undefined;

    return (
        <>
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
                            Text-Wasserzeichen auf Fotos — Position und Deckkraft einstellen.
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
                            Bild auswählen
                        </button>
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

                        <div className="relative flex justify-center overflow-hidden rounded-xl border-2 border-black bg-[var(--color-chip)] p-4">
                            {previewSrc ? (
                                <img
                                    src={previewSrc}
                                    alt="Vorschau"
                                    className="max-h-[360px] max-w-full object-contain"
                                />
                            ) : null}
                            {text.trim() ? (
                                <span
                                    className="pointer-events-none absolute font-bold"
                                    style={{
                                        opacity: opacity / 100,
                                        fontSize: `${fontScale}px`,
                                        ...(position === 'top-left' && { top: 12, left: 12 }),
                                        ...(position === 'top-center' && {
                                            top: 12,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                        }),
                                        ...(position === 'top-right' && { top: 12, right: 12 }),
                                        ...(position === 'center-left' && {
                                            top: '50%',
                                            left: 12,
                                            transform: 'translateY(-50%)',
                                        }),
                                        ...(position === 'center' && {
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                        }),
                                        ...(position === 'center-right' && {
                                            top: '50%',
                                            right: 12,
                                            transform: 'translateY(-50%)',
                                        }),
                                        ...(position === 'bottom-left' && { bottom: 12, left: 12 }),
                                        ...(position === 'bottom-center' && {
                                            bottom: 12,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                        }),
                                        ...(position === 'bottom-right' && {
                                            bottom: 12,
                                            right: 12,
                                        }),
                                    }}
                                >
                                    {text}
                                </span>
                            ) : null}
                        </div>

                        <section className="grid gap-4 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm">
                            <label className="space-y-1">
                                <span className="font-display text-[13px] font-bold">Text</span>
                                <input
                                    className="ms-input w-full"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="z. B. © Name"
                                />
                            </label>
                            <label className="space-y-1">
                                <span className="font-display text-[13px] font-bold">Position</span>
                                <select
                                    className="ms-input w-full"
                                    value={position}
                                    onChange={(e) =>
                                        setPosition(e.target.value as WatermarkPosition)
                                    }
                                >
                                    {POSITIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="space-y-2">
                                <span className="font-display text-[13px] font-bold">
                                    Deckkraft ({opacity} %)
                                </span>
                                <input
                                    type="range"
                                    min={10}
                                    max={100}
                                    value={opacity}
                                    onChange={(e) => setOpacity(Number(e.target.value))}
                                    className="w-full"
                                />
                            </label>
                            <label className="space-y-2">
                                <span className="font-display text-[13px] font-bold">
                                    Schriftgröße (Vorschau)
                                </span>
                                <input
                                    type="range"
                                    min={3}
                                    max={12}
                                    value={fontScale}
                                    onChange={(e) => setFontScale(Number(e.target.value))}
                                    className="w-full"
                                />
                            </label>
                            <label className="space-y-1">
                                <span className="font-display text-[13px] font-bold">
                                    Zielformat
                                </span>
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
                            <ResultCard tone="success" heading="Wasserzeichen gesetzt">
                                <ContinueWithNextTool
                                    toolId={tool.id}
                                    resultBlob={result.blob}
                                    resultFilename={result.filename}
                                />
                            </ResultCard>
                        ) : null}
                    </div>
                )}

                <StateHint>Text-Wasserzeichen — kein Bild-Overlay. Läuft im Browser.</StateHint>
            </EditorToolShell>
        </>
    );
}
