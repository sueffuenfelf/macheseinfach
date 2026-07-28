import { useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { StateHint } from '../_shared/_shared';
import { downloadPdfBytes, swapBaseFilename } from '../_shared/pdf/io';
import { fitPdfToA4 } from '../_shared/pdf/ops';

type Props = { tool: Tool };

export function PdfA4FitTool({ tool }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [working, setWorking] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        const next = Array.from(files)[0];
        if (next) setFile(next);
    });

    async function run() {
        if (!file || working) return;
        setWorking(true);
        try {
            const bytes = await fitPdfToA4(file);
            downloadPdfBytes(bytes, swapBaseFilename(file.name, '-a4'));
            toast({ message: 'A4-PDF heruntergeladen', variant: 'success' });
        } catch {
            toast({ message: 'A4-Anpassung fehlgeschlagen.', variant: 'error' });
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
                    <p className="font-display text-[20px] font-bold">PDF auf A4 bringen</p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                        Seiten werden zentriert auf DIN A4 eingepasst.
                    </p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="ms-sr-only"
                        onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                    />
                </section>
            ) : (
                <>
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                        <p className="text-[14px] font-semibold">{file.name}</p>
                        <button type="button" className="ms-btn" onClick={() => setFile(null)}>
                            Wechseln
                        </button>
                    </div>
                    <button
                        type="button"
                        className="ms-btn-primary w-full disabled:opacity-50"
                        disabled={working}
                        onClick={() => void run()}
                    >
                        {working ? 'Passe an …' : 'A4-PDF herunterladen'}
                    </button>
                </>
            )}
            <StateHint>{tool.trust}</StateHint>
        </div>
    );
}
