import { useMemo, useRef, useState } from 'react';
import type { Tool } from '../../data/catalog';
import { usePlatform } from '../../context/PlatformContext';
import { useFileDrop, FILE_ACCEPT } from '../../hooks/useFileDrop';
import { deterministicSeed, formatBytes } from '../../lib/format';
import { ResultCard, StateHint, useToast } from './_shared';

type PdfCompressToolProps = {
    tool: Tool;
};

export function PdfCompressTool({ tool }: PdfCompressToolProps) {
    const { file, ingestFiles, clearFile } = usePlatform();
    const [quality, setQuality] = useState(62);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { node, show } = useToast();

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        ingestFiles(files);
    });

    const outputBytes = useMemo(() => {
        if (!file) return 0;
        const seed = deterministicSeed(file.name) % 21;
        const maxReduction = 0.8;
        const minReduction = 0.6;
        const baseReduction = minReduction + (seed / 20) * (maxReduction - minReduction);
        const qualityInfluence = (quality - 50) / 250;
        const reduction = Math.min(0.86, Math.max(0.5, baseReduction - qualityInfluence));
        return Math.max(10_000, Math.round(file.bytes * (1 - reduction)));
    }, [file, quality]);

    const underElsterLimit = outputBytes > 0 && outputBytes < 2 * 1024 * 1024;

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6">
            {!file ? (
                <section
                    className="ms-dropzone cursor-pointer rounded-xl p-8 text-center"
                    data-drag={dragOver}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                >
                    <p className="font-display text-[20px] font-bold tracking-[-0.02em]">
                        PDF hierher ziehen oder auswählen
                    </p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">Ideal für Elster-, Behörden- und Portal-Uploads.</p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept={FILE_ACCEPT}
                        className="ms-sr-only"
                        onChange={(e) => ingestFiles(e.target.files)}
                    />
                </section>
            ) : (
                <>
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                        <div>
                            <p className="font-display text-[12px] font-bold uppercase tracking-[0.05em]">Geladene Datei</p>
                            <p className="text-[14px]">{file.name}</p>
                        </div>
                        <button type="button" className="ms-btn" onClick={clearFile}>
                            Wechseln
                        </button>
                    </div>

                    <ResultCard tone="warn" heading="Vorher → Nachher">
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="rounded-md border-2 border-black bg-white p-3">
                                <p className="font-display text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-soft)]">
                                    Original
                                </p>
                                <p className="mt-1 text-[16px] font-bold">{formatBytes(file.bytes)}</p>
                            </div>
                            <div className="rounded-md border-2 border-black bg-white p-3">
                                <p className="font-display text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-soft)]">
                                    Komprimiert
                                </p>
                                <p className="mt-1 text-[16px] font-bold">{formatBytes(outputBytes)}</p>
                            </div>
                        </div>
                    </ResultCard>

                    <section className="rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm">
                        <label
                            htmlFor={`${tool.id}-quality`}
                            className="mb-2 block font-display text-[12px] font-bold uppercase tracking-[0.05em]"
                        >
                            Kleiner ⟷ Bessere Qualität
                        </label>
                        <input
                            id={`${tool.id}-quality`}
                            type="range"
                            min={0}
                            max={100}
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="w-full"
                            style={{ accentColor: '#000' }}
                        />
                    </section>

                    {underElsterLimit ? (
                        <span
                            className="inline-flex items-center rounded-[999px] border-2 border-black bg-white px-3 py-1 text-[13px] font-semibold"
                            style={{ color: 'var(--color-success-ink)' }}
                        >
                            ✓ Unter Elster-Limit (2 MB)
                        </span>
                    ) : null}

                    <button
                        type="button"
                        className="ms-btn-primary w-full"
                        onClick={() => show('Download gestartet (Demo)')}
                    >
                        Verkleinertes PDF herunterladen
                    </button>
                </>
            )}
            <StateHint>Demo-Vorschau — echte Komprimierung folgt in v0.2.</StateHint>
            {node}
        </div>
    );
}
