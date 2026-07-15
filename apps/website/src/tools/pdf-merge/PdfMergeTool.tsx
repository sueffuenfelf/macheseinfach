import { useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { ProgressBar, ResultCard, StateHint } from '../_shared/_shared';
import { downloadPdfBytes, mergePdfFiles, swapBaseFilename } from '../_shared/pdf/io';

type PdfMergeToolProps = {
    tool: Tool;
};

type PdfEntry = {
    id: string;
    file: File;
};

export function PdfMergeTool({ tool }: PdfMergeToolProps) {
    const [entries, setEntries] = useState<PdfEntry[]>([]);
    const [working, setWorking] = useState(false);
    const [progress, setProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    function appendFiles(list: FileList) {
        const pdfs = Array.from(list).filter(
            (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'),
        );
        if (!pdfs.length) {
            toast({ message: 'Bitte nur PDF-Dateien auswählen.', variant: 'error' });
            return;
        }
        setEntries((prev) => [...prev, ...pdfs.map((file) => ({ id: crypto.randomUUID(), file }))]);
    }

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop(appendFiles);

    function moveEntry(id: string, direction: -1 | 1) {
        setEntries((prev) => {
            const index = prev.findIndex((entry) => entry.id === id);
            if (index < 0) return prev;
            const target = index + direction;
            if (target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            const [item] = next.splice(index, 1);
            next.splice(target, 0, item);
            return next;
        });
    }

    function removeEntry(id: string) {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
    }

    async function mergeAndDownload() {
        if (entries.length < 2 || working) return;
        setWorking(true);
        setProgress(0.1);
        try {
            const bytes = await mergePdfFiles(entries.map((entry) => entry.file));
            setProgress(1);
            downloadPdfBytes(bytes, swapBaseFilename(entries[0].file.name, '-zusammengefuegt'));
            toast({ message: `${entries.length} PDFs zusammengeführt`, variant: 'success' });
        } catch {
            toast({ message: 'PDFs konnten nicht zusammengeführt werden.', variant: 'error' });
        } finally {
            setWorking(false);
            setProgress(0);
        }
    }

    return (
        <div
            className="ms-animate-fade mx-auto w-full max-w-3xl space-y-4 px-4 py-6 md:px-6"
            aria-busy={working}
        >
            <section
                className="ms-dropzone rounded-xl p-6 text-center"
                data-drag={dragOver}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <p className="font-display text-[20px] font-bold tracking-[-0.02em]">
                    PDFs hierher ziehen
                </p>
                <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                    Reihenfolge mit ↑/↓ anpassen — mindestens zwei Dateien.
                </p>
                <button
                    type="button"
                    className="ms-btn mt-4"
                    onClick={() => inputRef.current?.click()}
                >
                    PDFs auswählen
                </button>
                <input
                    ref={inputRef}
                    className="ms-sr-only"
                    type="file"
                    multiple
                    accept="application/pdf,.pdf"
                    onChange={(e) => e.target.files && appendFiles(e.target.files)}
                />
            </section>

            {entries.length ? (
                <ul className="space-y-2">
                    {entries.map((entry, index) => (
                        <li
                            key={entry.id}
                            className="flex items-center gap-2 rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm"
                        >
                            <span className="min-w-0 flex-1 truncate text-[14px]">
                                {entry.file.name}
                            </span>
                            <div className="flex shrink-0 gap-1">
                                <button
                                    type="button"
                                    className="ms-btn px-2 py-0.5 text-[11px]"
                                    disabled={index === 0}
                                    onClick={() => moveEntry(entry.id, -1)}
                                    aria-label="Nach oben"
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    className="ms-btn px-2 py-0.5 text-[11px]"
                                    disabled={index === entries.length - 1}
                                    onClick={() => moveEntry(entry.id, 1)}
                                    aria-label="Nach unten"
                                >
                                    ↓
                                </button>
                                <button
                                    type="button"
                                    className="ms-btn px-2 py-0.5 text-[11px]"
                                    onClick={() => removeEntry(entry.id)}
                                    aria-label="Entfernen"
                                >
                                    ×
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : null}

            {working ? <ProgressBar value={progress} max={1} /> : null}

            <button
                type="button"
                className="ms-btn-primary w-full"
                disabled={entries.length < 2 || working}
                onClick={() => void mergeAndDownload()}
            >
                {entries.length} PDFs zusammenfügen
            </button>

            <StateHint>{tool.trust} · Verarbeitung läuft vollständig im Browser.</StateHint>
        </div>
    );
}
