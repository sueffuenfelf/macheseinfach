import { useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { ProgressBar, StateHint } from '../_shared/_shared';
import { downloadPdfBytes, loadPdfDocument, swapBaseFilename } from '../_shared/pdf/io';
import { allPageIndices, parsePageSpec } from '../_shared/pdf/pages';
import { splitPdfBySpec } from '../_shared/pdf/ops';

type PdfExtractPagesToolProps = {
    tool: Tool;
};

export function PdfExtractPagesTool({ tool }: PdfExtractPagesToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(0);
    const [range, setRange] = useState('');
    const [working, setWorking] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    async function acceptFile(next: File) {
        setFile(next);
        setRange('');
        try {
            const pdf = await loadPdfDocument(next);
            setPageCount(pdf.getPageCount());
        } catch {
            setPageCount(0);
            toast({ message: 'PDF konnte nicht gelesen werden.', variant: 'error' });
        }
    }

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        const next = Array.from(files).find(
            (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
        );
        if (!next) {
            toast({ message: 'Bitte eine PDF-Datei wählen.', variant: 'error' });
            return;
        }
        void acceptFile(next);
    });

    const selectedCount =
        pageCount > 0
            ? range.trim()
              ? parsePageSpec(range, pageCount).length
              : pageCount
            : 0;

    async function extractAndDownload() {
        if (!file || !pageCount || working) return;
        setWorking(true);
        try {
            const spec = range.trim() || allPageIndices(pageCount).map((i) => i + 1).join(',');
            const { bytes, pageCount: extracted } = await splitPdfBySpec(file, spec);
            downloadPdfBytes(bytes, swapBaseFilename(file.name, '-seiten'));
            toast({
                message: `${extracted} Seite(n) extrahiert`,
                variant: 'success',
            });
        } catch (err) {
            toast({
                message:
                    err instanceof Error ? err.message : 'Seiten konnten nicht extrahiert werden.',
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
                    className="ms-dropzone rounded-xl p-8 text-center"
                    data-drag={dragOver}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <p className="font-display text-[20px] font-bold tracking-[-0.02em]">
                        PDF hierher ziehen
                    </p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                        Seitenbereich festlegen und als neue PDF speichern.
                    </p>
                    <button
                        type="button"
                        className="ms-btn mt-4"
                        onClick={() => inputRef.current?.click()}
                    >
                        PDF auswählen
                    </button>
                    <input
                        ref={inputRef}
                        className="ms-sr-only"
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) => {
                            const next = e.target.files?.[0];
                            if (next) void acceptFile(next);
                        }}
                    />
                </section>
            ) : (
                <>
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                        <div>
                            <p className="text-[14px]">{file.name}</p>
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
                                setRange('');
                            }}
                        >
                            Wechseln
                        </button>
                    </div>

                    <label className="block">
                        <span className="font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                            Seitenbereich
                        </span>
                        <input
                            type="text"
                            className="mt-1 w-full rounded-md border-2 border-black px-3 py-2 font-mono text-[14px]"
                            placeholder="z. B. 3-7 oder 1,3,5"
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                        />
                        <p className="mt-1 text-[12px] text-[var(--color-ink-soft)]">
                            Leer lassen = alle Seiten. Format: 3-7, 1,3,5 oder 1-3,5
                        </p>
                    </label>

                    {working ? <ProgressBar value={0.5} max={1} /> : null}

                    <button
                        type="button"
                        className="ms-btn-primary w-full"
                        disabled={!selectedCount || working}
                        onClick={() => void extractAndDownload()}
                    >
                        {selectedCount
                            ? `${selectedCount} Seite(n) extrahieren`
                            : 'Seitenbereich eingeben'}
                    </button>
                </>
            )}

            <StateHint>{tool.trust} · Verarbeitung läuft vollständig im Browser.</StateHint>
        </div>
    );
}
