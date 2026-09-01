import { useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { ProgressBar, StateHint } from '../_shared/_shared';
import { downloadPdfBytes, swapBaseFilename } from '../_shared/pdf/io';
import { addPdfWatermark } from '../_shared/pdf/watermark';

type PdfWatermarkToolProps = {
    tool: Tool;
};

const PRESETS = ['ENTWURF', 'VERTRAULICH', 'KOPIE', 'MUSTER'];

export function PdfWatermarkTool({ tool }: PdfWatermarkToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('ENTWURF');
    const [working, setWorking] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        const next = Array.from(files).find(
            (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
        );
        if (!next) {
            toast({ message: 'Bitte eine PDF-Datei wählen.', variant: 'error' });
            return;
        }
        setFile(next);
    });

    async function applyAndDownload() {
        if (!file || working) return;
        if (!text.trim()) {
            toast({ message: 'Bitte Wasserzeichen-Text eingeben.', variant: 'error' });
            return;
        }
        setWorking(true);
        try {
            const bytes = await addPdfWatermark(file, text);
            downloadPdfBytes(bytes, swapBaseFilename(file.name, '-wasserzeichen'));
            toast({ message: 'Wasserzeichen eingefügt', variant: 'success' });
        } catch (err) {
            toast({
                message:
                    err instanceof Error
                        ? err.message
                        : 'Wasserzeichen konnte nicht eingefügt werden.',
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
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                </section>
            ) : (
                <>
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                        <p className="text-[14px]">{file.name}</p>
                        <button type="button" className="ms-btn" onClick={() => setFile(null)}>
                            Wechseln
                        </button>
                    </div>

                    <label className="block">
                        <span className="font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                            Wasserzeichen-Text
                        </span>
                        <input
                            type="text"
                            className="mt-1 w-full rounded-md border-2 border-black px-3 py-2 font-display text-[16px] font-bold uppercase"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </label>

                    <div className="flex flex-wrap gap-2">
                        {PRESETS.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                className={`ms-btn text-[12px] ${text === preset ? 'ring-2 ring-black' : ''}`}
                                onClick={() => setText(preset)}
                            >
                                {preset}
                            </button>
                        ))}
                    </div>

                    {working ? <ProgressBar value={0.5} max={1} /> : null}

                    <button
                        type="button"
                        className="ms-btn-primary w-full"
                        disabled={working || !text.trim()}
                        onClick={() => void applyAndDownload()}
                    >
                        Wasserzeichen einfügen & herunterladen
                    </button>
                </>
            )}

            <StateHint>{tool.trust} · Verarbeitung läuft vollständig im Browser.</StateHint>
        </div>
    );
}
