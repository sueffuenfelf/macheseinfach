import { useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { StateHint } from '../_shared/_shared';
import {
    downloadBlobsSequential,
    downloadPdfBytes,
    loadPdfDocument,
    swapBaseFilename,
} from '../_shared/pdf/io';
import { splitPdfBySpec, splitPdfEachPage } from '../_shared/pdf/ops';

type PdfSplitToolProps = { tool: Tool };

type Mode = 'range' | 'each';

export function PdfSplitTool({ tool }: PdfSplitToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(0);
    const [mode, setMode] = useState<Mode>('range');
    const [spec, setSpec] = useState('1');
    const [working, setWorking] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        void acceptFile(Array.from(files)[0]);
    });

    async function acceptFile(next: File | undefined) {
        if (!next) return;
        if (next.type !== 'application/pdf' && !next.name.toLowerCase().endsWith('.pdf')) {
            toast({ message: 'Bitte eine PDF-Datei wählen.', variant: 'error' });
            return;
        }
        try {
            const pdf = await loadPdfDocument(next);
            setFile(next);
            setPageCount(pdf.getPageCount());
            setSpec(pdf.getPageCount() > 1 ? `1-${pdf.getPageCount()}` : '1');
        } catch {
            toast({ message: 'PDF konnte nicht geladen werden.', variant: 'error' });
        }
    }

    async function run() {
        if (!file || working) return;
        setWorking(true);
        try {
            if (mode === 'each') {
                const parts = await splitPdfEachPage(file);
                await downloadBlobsSequential(
                    parts.map((part) => ({
                        blob: new Blob([part.bytes.slice()], { type: 'application/pdf' }),
                        filename: swapBaseFilename(file.name, part.label),
                    })),
                );
                toast({
                    message: `${parts.length} Dateien heruntergeladen`,
                    variant: 'success',
                });
            } else {
                const { bytes, pageCount: n } = await splitPdfBySpec(file, spec);
                downloadPdfBytes(bytes, swapBaseFilename(file.name, '-teil'));
                toast({ message: `${n} Seite(n) exportiert`, variant: 'success' });
            }
        } catch (err) {
            toast({
                message: err instanceof Error ? err.message : 'Teilen fehlgeschlagen.',
                variant: 'error',
            });
        } finally {
            setWorking(false);
        }
    }

    return (
        <div
            className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6"
            aria-busy={working}
        >
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
                        PDF zum Teilen laden
                    </p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                        Seitenbereich oder jede Seite als eigene Datei.
                    </p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="ms-sr-only"
                        onChange={(e) => void acceptFile(e.target.files?.[0])}
                    />
                </section>
            ) : (
                <>
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                        <div>
                            <p className="text-[14px] font-semibold">{file.name}</p>
                            <p className="text-[12px] text-[var(--color-ink-soft)]">
                                {pageCount} Seite(n)
                            </p>
                        </div>
                        <button
                            type="button"
                            className="ms-btn"
                            onClick={() => {
                                setFile(null);
                                setPageCount(0);
                            }}
                        >
                            Wechseln
                        </button>
                    </div>

                    <section className="space-y-3 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm">
                        <p className="font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                            Modus
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {(
                                [
                                    ['range', 'Seitenbereich'],
                                    ['each', 'Jede Seite einzeln'],
                                ] as const
                            ).map(([id, label]) => (
                                <button
                                    key={id}
                                    type="button"
                                    className={`ms-btn text-[12px] ${mode === id ? 'ring-2 ring-black' : ''}`}
                                    onClick={() => setMode(id)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {mode === 'range' ? (
                            <label className="block">
                                <span className="font-display text-[11px] font-bold uppercase tracking-[0.05em]">
                                    Seiten (z. B. 1-3,5)
                                </span>
                                <input
                                    value={spec}
                                    onChange={(e) => setSpec(e.target.value)}
                                    className="mt-1 w-full rounded-md border-2 border-black px-3 py-2"
                                    placeholder="1-3,5"
                                />
                            </label>
                        ) : null}
                    </section>

                    <button
                        type="button"
                        className="ms-btn-primary w-full disabled:opacity-50"
                        disabled={working}
                        onClick={() => void run()}
                    >
                        {working ? 'Teile …' : 'PDF teilen & herunterladen'}
                    </button>
                </>
            )}
            <StateHint>{tool.trust}</StateHint>
        </div>
    );
}
