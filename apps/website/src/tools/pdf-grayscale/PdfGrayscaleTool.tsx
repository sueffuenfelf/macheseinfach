import { useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { formatBytes } from '../../lib/format';
import { useToast } from '../../shell/toast';
import { InfoGrid, ResultCard, StateHint } from '../_shared/_shared';
import { downloadPdfBytes, swapBaseFilename } from '../_shared/pdf/io';
import { grayscalePdf } from '../_shared/pdf/ops';

type Props = { tool: Tool };

export function PdfGrayscaleTool({ tool }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [working, setWorking] = useState(false);
    const [resultSize, setResultSize] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        const next = Array.from(files)[0];
        if (!next) return;
        setFile(next);
        setResultSize(null);
    });

    async function run() {
        if (!file || working) return;
        setWorking(true);
        try {
            const bytes = await grayscalePdf(file);
            setResultSize(bytes.length);
            downloadPdfBytes(bytes, swapBaseFilename(file.name, '-grau'));
            toast({ message: 'Graustufen-PDF gespeichert', variant: 'success' });
        } catch {
            toast({ message: 'Konvertierung fehlgeschlagen.', variant: 'error' });
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
                >
                    <p className="font-display text-[20px] font-bold">Farb-PDF laden</p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                        Wird seitenweise als Graustufen gerendert (für kleinere Uploads).
                    </p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="ms-sr-only"
                        onChange={(e) => {
                            const next = e.target.files?.[0];
                            if (next) {
                                setFile(next);
                                setResultSize(null);
                            }
                        }}
                    />
                </section>
            ) : (
                <>
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                        <div>
                            <p className="text-[14px] font-semibold">{file.name}</p>
                            <p className="text-[12px] text-[var(--color-ink-soft)]">
                                Original: {formatBytes(file.size)}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="ms-btn"
                            onClick={() => {
                                setFile(null);
                                setResultSize(null);
                            }}
                        >
                            Wechseln
                        </button>
                    </div>

                    {resultSize !== null ? (
                        <ResultCard tone="success" heading="Ergebnis">
                            <InfoGrid
                                items={[
                                    { label: 'Original', value: formatBytes(file.size) },
                                    { label: 'Graustufen', value: formatBytes(resultSize) },
                                ]}
                            />
                        </ResultCard>
                    ) : null}

                    <button
                        type="button"
                        className="ms-btn-primary w-full disabled:opacity-50"
                        disabled={working}
                        onClick={() => void run()}
                    >
                        {working ? 'Konvertiere …' : 'Als Graustufen herunterladen'}
                    </button>
                </>
            )}
            <StateHint>
                {tool.trust} · Text kann danach nicht mehr markiert werden (gerastert).
            </StateHint>
        </div>
    );
}
