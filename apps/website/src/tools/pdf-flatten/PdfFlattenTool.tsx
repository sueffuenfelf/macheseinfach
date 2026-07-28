import { useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { InfoGrid, ProgressBar, ResultCard, StateHint } from '../_shared/_shared';
import { listPdfFormFields } from '../_shared/pdf/form-fill';
import { flattenPdf } from '../_shared/pdf/flatten';
import { downloadPdfBytes, loadPdfDocument, swapBaseFilename } from '../_shared/pdf/io';

type PdfFlattenToolProps = {
    tool: Tool;
};

export function PdfFlattenTool({ tool }: PdfFlattenToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [fieldCount, setFieldCount] = useState<number | null>(null);
    const [working, setWorking] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    async function inspectFile(next: File) {
        setFile(next);
        setFieldCount(null);
        setWorking(true);
        try {
            const pdf = await loadPdfDocument(next);
            setFieldCount(listPdfFormFields(pdf).length);
        } catch {
            toast({ message: 'PDF konnte nicht gelesen werden.', variant: 'error' });
            setFile(null);
        } finally {
            setWorking(false);
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
        void inspectFile(next);
    });

    async function flattenAndDownload() {
        if (!file || working) return;
        setWorking(true);
        try {
            const result = await flattenPdf(file);
            downloadPdfBytes(result.bytes, swapBaseFilename(file.name, '-flatten'));
            toast({
                message:
                    result.fieldCount > 0
                        ? `${result.fieldCount} Feld(er) eingebettet`
                        : 'PDF gespeichert (keine Formularfelder)',
                variant: 'success',
            });
        } catch {
            toast({ message: 'PDF konnte nicht flatten werden.', variant: 'error' });
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
                        PDF-Formular hierher ziehen
                    </p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                        Ausfüllbare Felder werden ins Druckbild eingebettet — nicht mehr editierbar.
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
                            if (next) void inspectFile(next);
                        }}
                    />
                </section>
            ) : (
                <>
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                        <p className="text-[14px]">{file.name}</p>
                        <button
                            type="button"
                            className="ms-btn"
                            onClick={() => {
                                setFile(null);
                                setFieldCount(null);
                            }}
                        >
                            Wechseln
                        </button>
                    </div>

                    {fieldCount !== null ? (
                        <ResultCard
                            tone={fieldCount > 0 ? 'info' : 'warn'}
                            heading="Formularfelder"
                        >
                            <InfoGrid
                                items={[
                                    {
                                        label: 'Erkannte Felder',
                                        value: String(fieldCount),
                                    },
                                ]}
                            />
                            {fieldCount === 0 ? (
                                <p className="mt-2 text-[13px]">
                                    Keine ausfüllbaren Felder gefunden — Flatten ändert nichts
                                    Sichtbares.
                                </p>
                            ) : null}
                        </ResultCard>
                    ) : null}

                    {working ? <ProgressBar value={0.5} max={1} /> : null}

                    <button
                        type="button"
                        className="ms-btn-primary w-full"
                        disabled={working}
                        onClick={() => void flattenAndDownload()}
                    >
                        Flatten & herunterladen
                    </button>
                </>
            )}

            <StateHint>{tool.trust} · Verarbeitung läuft vollständig im Browser.</StateHint>
        </div>
    );
}
