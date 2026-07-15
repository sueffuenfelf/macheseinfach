import { useMemo, useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { formatBytes } from '../../lib/format';
import { useToast } from '../../shell/toast';
import { ResultCard, StateHint } from '../_shared/_shared';
import { compressPdfFile, downloadPdfBytes, swapBaseFilename } from '../_shared/pdf/io';

type PdfCompressToolProps = {
    tool: Tool;
};

export function PdfCompressTool({ tool }: PdfCompressToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [quality, setQuality] = useState(62);
    const [working, setWorking] = useState(false);
    const [result, setResult] = useState<{ bytes: Uint8Array; compressedSize: number } | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    const useObjectStreams = quality >= 40;

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        const next = Array.from(files).find((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
        if (!next) {
            toast({ message: 'Bitte eine PDF-Datei wählen.', variant: 'error' });
            return;
        }
        setFile(next);
        setResult(null);
    });

    const underElsterLimit = useMemo(
        () => result !== null && result.compressedSize > 0 && result.compressedSize < 2 * 1024 * 1024,
        [result],
    );

    async function compress() {
        if (!file || working) return;
        setWorking(true);
        try {
            const compressed = await compressPdfFile(file, useObjectStreams);
            setResult({ bytes: compressed.bytes, compressedSize: compressed.compressedSize });
            toast({ message: 'PDF komprimiert — bereit zum Download', variant: 'success' });
        } catch {
            toast({ message: 'PDF konnte nicht komprimiert werden.', variant: 'error' });
        } finally {
            setWorking(false);
        }
    }

    function download() {
        if (!file || !result) return;
        downloadPdfBytes(result.bytes, swapBaseFilename(file.name, '-komprimiert'));
        toast({ message: 'Download gestartet', variant: 'success' });
    }

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6" aria-busy={working}>
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
                    <p className="font-display text-[20px] font-bold tracking-[-0.02em]">PDF hierher ziehen oder auswählen</p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">Ideal für Elster-, Behörden- und Portal-Uploads.</p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="ms-sr-only"
                        onChange={(e) => {
                            const next = e.target.files?.[0];
                            if (next) {
                                setFile(next);
                                setResult(null);
                            }
                        }}
                    />
                </section>
            ) : (
                <>
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                        <div>
                            <p className="font-display text-[12px] font-bold uppercase tracking-[0.05em]">Geladene Datei</p>
                            <p className="text-[14px]">{file.name}</p>
                        </div>
                        <button
                            type="button"
                            className="ms-btn"
                            onClick={() => {
                                setFile(null);
                                setResult(null);
                            }}
                        >
                            Wechseln
                        </button>
                    </div>

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
                            onChange={(e) => {
                                setQuality(Number(e.target.value));
                                setResult(null);
                            }}
                            className="w-full"
                            style={{ accentColor: '#000' }}
                        />
                    </section>

                    <button type="button" className="ms-btn-primary w-full" disabled={working} onClick={() => void compress()}>
                        {working ? 'Komprimiere …' : 'PDF komprimieren'}
                    </button>

                    {result ? (
                        <ResultCard tone="warn" heading="Vorher → Nachher">
                            <div className="grid gap-2 sm:grid-cols-2">
                                <div className="rounded-md border-2 border-black bg-white p-3">
                                    <p className="font-display text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-soft)]">
                                        Original
                                    </p>
                                    <p className="mt-1 text-[16px] font-bold">{formatBytes(file.size)}</p>
                                </div>
                                <div className="rounded-md border-2 border-black bg-white p-3">
                                    <p className="font-display text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-soft)]">
                                        Komprimiert
                                    </p>
                                    <p className="mt-1 text-[16px] font-bold">{formatBytes(result.compressedSize)}</p>
                                </div>
                            </div>
                            {underElsterLimit ? (
                                <span
                                    className="inline-flex items-center rounded-[999px] border-2 border-black bg-white px-3 py-1 text-[13px] font-semibold"
                                    style={{ color: 'var(--color-success-ink)' }}
                                >
                                    ✓ Unter Elster-Limit (2 MB)
                                </span>
                            ) : null}
                            <button type="button" className="ms-btn-primary w-full" onClick={download}>
                                Verkleinertes PDF herunterladen
                            </button>
                        </ResultCard>
                    ) : null}
                </>
            )}
            <StateHint>
                Strukturelle PDF-Komprimierung im Browser — eingebettete Bilder werden in v0.2 separat optimiert.
            </StateHint>
        </div>
    );
}
