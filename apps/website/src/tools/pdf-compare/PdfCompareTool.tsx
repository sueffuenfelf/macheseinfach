import { useRef, useState, type DragEvent } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useToast } from '../../shell/toast';
import { InfoGrid, ResultCard, StateHint } from '../_shared/_shared';
import { comparePdfs, type PdfCompareResult } from '../_shared/pdf/compare';

type PdfCompareToolProps = {
    tool: Tool;
};

type PdfSlot = {
    file: File | null;
    label: string;
};

export function PdfCompareTool({ tool }: PdfCompareToolProps) {
    const [slots, setSlots] = useState<PdfSlot[]>([
        { file: null, label: 'PDF A' },
        { file: null, label: 'PDF B' },
    ]);
    const [result, setResult] = useState<PdfCompareResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragSlot, setDragSlot] = useState<number | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { toast } = useToast();

    function acceptFile(index: number, file: File | null) {
        setSlots((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], file };
            return next;
        });
        setResult(null);
    }

    function pickPdf(files: FileList | File[]): File | null {
        return (
            Array.from(files).find(
                (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
            ) ?? null
        );
    }

    function onSlotDragOver(event: DragEvent, index: number) {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
        setDragSlot(index);
    }

    function onSlotDragLeave(event: DragEvent) {
        event.preventDefault();
        const related = event.relatedTarget as Node | null;
        if (related && event.currentTarget.contains(related)) return;
        setDragSlot(null);
    }

    function onSlotDrop(event: DragEvent, index: number) {
        event.preventDefault();
        event.stopPropagation();
        setDragSlot(null);
        const next = pickPdf(event.dataTransfer.files);
        if (!next) {
            toast({ message: 'Bitte PDF-Dateien wählen.', variant: 'error' });
            return;
        }
        acceptFile(index, next);
    }

    async function runCompare() {
        const [a, b] = slots;
        if (!a.file || !b.file || loading) return;
        setLoading(true);
        setResult(null);
        try {
            const compared = await comparePdfs(a.file, b.file);
            setResult(compared);
        } catch {
            toast({ message: 'Vergleich fehlgeschlagen.', variant: 'error' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="ms-animate-fade mx-auto w-full max-w-3xl space-y-4 px-4 py-6 md:px-6"
            aria-busy={loading}
        >
            <div className="grid gap-4 md:grid-cols-2">
                {slots.map((slot, index) => (
                    <section
                        key={slot.label}
                        className="ms-dropzone rounded-xl p-4 text-center"
                        data-drag={dragSlot === index}
                        onDragOver={(e) => onSlotDragOver(e, index)}
                        onDragLeave={onSlotDragLeave}
                        onDrop={(e) => onSlotDrop(e, index)}
                    >
                        <p className="font-display text-[14px] font-bold uppercase tracking-[0.05em]">
                            {slot.label}
                        </p>
                        {slot.file ? (
                            <div className="mt-2 space-y-2">
                                <p className="text-[13px] break-all">{slot.file.name}</p>
                                <button
                                    type="button"
                                    className="ms-btn text-[12px]"
                                    onClick={() => acceptFile(index, null)}
                                >
                                    Entfernen
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="mt-2 text-[13px] text-[var(--color-ink-soft)]">
                                    PDF hierher ziehen
                                </p>
                                <button
                                    type="button"
                                    className="ms-btn mt-2 text-[12px]"
                                    onClick={() => inputRefs.current[index]?.click()}
                                >
                                    Auswählen
                                </button>
                            </>
                        )}
                        <input
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            className="ms-sr-only"
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={(e) => {
                                const next = e.target.files?.[0];
                                if (next) acceptFile(index, next);
                            }}
                        />
                    </section>
                ))}
            </div>

            <button
                type="button"
                className="ms-btn-primary w-full"
                disabled={!slots[0].file || !slots[1].file || loading}
                onClick={() => void runCompare()}
            >
                {loading ? 'Vergleiche …' : 'PDFs vergleichen'}
            </button>

            {result ? (
                <ResultCard
                    tone={result.pageCountMatch && result.identicalPages === result.comparedPages ? 'success' : 'warn'}
                    heading="Vergleich"
                >
                    <InfoGrid
                        items={[
                            { label: 'Seiten PDF A', value: String(result.aPages) },
                            { label: 'Seiten PDF B', value: String(result.bPages) },
                            {
                                label: 'Seitenanzahl',
                                value: result.pageCountMatch ? 'Gleich' : 'Unterschiedlich',
                            },
                            {
                                label: 'Identische Seiten (Text)',
                                value: `${result.identicalPages} / ${result.comparedPages}`,
                            },
                        ]}
                    />

                    <div className="mt-4 space-y-3">
                        {result.pages.map((page) => (
                            <div
                                key={page.pageIndex}
                                className={`rounded-lg border-2 border-black p-3 ${page.identical ? 'bg-[var(--color-success-soft)]' : 'bg-white'}`}
                            >
                                <p className="font-display text-[11px] font-bold uppercase tracking-[0.05em]">
                                    Seite {page.pageIndex + 1}
                                    {page.identical ? ' · identisch' : ' · unterschiedlich'}
                                </p>
                                <div className="mt-2 grid gap-2 md:grid-cols-2">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase text-[var(--color-ink-soft)]">
                                            A
                                        </p>
                                        <p className="mt-1 break-words font-mono text-[11px] leading-relaxed">
                                            {page.aText || '—'}
                                        </p>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase text-[var(--color-ink-soft)]">
                                            B
                                        </p>
                                        <p className="mt-1 break-words font-mono text-[11px] leading-relaxed">
                                            {page.bText || '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ResultCard>
            ) : null}

            <StateHint>
                {tool.trust} · Textvergleich pro Seite (kein Pixel-Diff). Scans ohne Textlayer
                erscheinen leer.
            </StateHint>
        </div>
    );
}
