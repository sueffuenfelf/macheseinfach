import { useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { InfoGrid, ResultCard, StateHint } from '../_shared/_shared';
import { IMAGE_ACCEPT } from '../_shared/image/accept';
import { checkImageDpi } from '../_shared/image/dpi';
import { convertImage } from '../_shared/image/convert';
import { formatFromBlob } from '../_shared/image/canvas';

type ImageDpiCheckToolProps = {
    tool: Tool;
};

async function readImageMeta(file: File): Promise<{
    width: number;
    height: number;
}> {
    let blob: Blob = file;
    const format = formatFromBlob(file, file.name);
    if (format === 'heic') {
        blob = await convertImage(file, 'heic', 'jpg');
    }

    const bitmap = await createImageBitmap(blob);
    const meta = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return meta;
}

export function ImageDpiCheckTool({ tool }: ImageDpiCheckToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [assumedDpi, setAssumedDpi] = useState('300');
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<ReturnType<typeof checkImageDpi> | null>(null);

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        const next = files[0];
        if (next) void analyze(next);
    });

    async function analyze(next: File) {
        setFile(next);
        setChecking(true);
        setResult(null);
        try {
            const meta = await readImageMeta(next);
            const dpi = Number.parseInt(assumedDpi, 10);
            setResult(
                checkImageDpi({
                    widthPx: meta.width,
                    heightPx: meta.height,
                    fileSizeBytes: next.size,
                    assumedDpi: Number.isFinite(dpi) && dpi > 0 ? dpi : 300,
                }),
            );
        } catch {
            setResult({
                ok: false,
                tone: 'danger',
                heading: 'Bild konnte nicht gelesen werden',
                details: [],
            });
        } finally {
            setChecking(false);
        }
    }

    return (
        <>
            <div className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6">
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
                        Pixelmaße, Dateigröße und Druck-Eignung prüfen.
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
                                if (next) void analyze(next);
                            };
                            input.click();
                        }}
                    >
                        Bild auswählen
                    </button>
                </section>

                <label className="block space-y-1">
                    <span className="font-display text-[13px] font-bold">
                        Angenommene DPI für Druckberechnung
                    </span>
                    <input
                        className="ms-input w-full max-w-[200px]"
                        type="number"
                        min={72}
                        max={1200}
                        value={assumedDpi}
                        onChange={(e) => setAssumedDpi(e.target.value)}
                        onBlur={() => {
                            if (file) void analyze(file);
                        }}
                    />
                </label>

                {file ? (
                    <p className="text-[13px] text-[var(--color-ink-soft)]">
                        Datei: {file.name}
                        <button
                            type="button"
                            className="ms-btn ml-2 text-[11px]"
                            onClick={() => void analyze(file)}
                        >
                            Erneut prüfen
                        </button>
                    </p>
                ) : null}

                {checking ? <p className="ms-pulse text-[14px] font-semibold">Prüfe …</p> : null}

                {result ? (
                    <ResultCard tone={result.tone} heading={result.heading}>
                        {result.details.length ? <InfoGrid items={result.details} /> : null}
                    </ResultCard>
                ) : null}

                <StateHint>
                    DPI aus EXIF wird nicht ausgelesen — Druckmaße basieren auf der angenommenen
                    DPI. Läuft im Browser.
                </StateHint>
            </div>
        </>
    );
}
