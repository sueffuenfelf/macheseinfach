import { useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { StateHint } from '../_shared/_shared';
import { downloadPdfBytes, loadPdfDocument, swapBaseFilename } from '../_shared/pdf/io';
import { rotatePdfPages } from '../_shared/pdf/ops';
import type { RotateDegrees } from '../_shared/pdf/pages';

type Props = { tool: Tool };

export function PdfPageRotateTool({ tool }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(0);
    const [pageSpec, setPageSpec] = useState('alle');
    const [angle, setAngle] = useState<RotateDegrees>(90);
    const [working, setWorking] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        void acceptFile(Array.from(files)[0]);
    });

    async function acceptFile(next: File | undefined) {
        if (!next) return;
        try {
            const pdf = await loadPdfDocument(next);
            setFile(next);
            setPageCount(pdf.getPageCount());
            setPageSpec('alle');
        } catch {
            toast({ message: 'PDF konnte nicht geladen werden.', variant: 'error' });
        }
    }

    async function run() {
        if (!file || working) return;
        setWorking(true);
        try {
            const bytes = await rotatePdfPages(file, { pageSpec, degrees: angle });
            downloadPdfBytes(bytes, swapBaseFilename(file.name, '-gedreht'));
            toast({ message: 'Seiten gedreht', variant: 'success' });
        } catch (err) {
            toast({
                message: err instanceof Error ? err.message : 'Drehen fehlgeschlagen.',
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
                >
                    <p className="font-display text-[20px] font-bold">PDF zum Drehen laden</p>
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
                        <button type="button" className="ms-btn" onClick={() => setFile(null)}>
                            Wechseln
                        </button>
                    </div>

                    <section className="space-y-3 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm">
                        <label className="block">
                            <span className="font-display text-[11px] font-bold uppercase tracking-[0.05em]">
                                Seiten (alle oder z. B. 1,3-4)
                            </span>
                            <input
                                value={pageSpec}
                                onChange={(e) => setPageSpec(e.target.value)}
                                className="mt-1 w-full rounded-md border-2 border-black px-3 py-2"
                            />
                        </label>
                        <p className="font-display text-[11px] font-bold uppercase tracking-[0.05em]">
                            Winkel
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {([90, 180, 270] as const).map((deg) => (
                                <button
                                    key={deg}
                                    type="button"
                                    className={`ms-btn text-[12px] ${angle === deg ? 'ring-2 ring-black' : ''}`}
                                    onClick={() => setAngle(deg)}
                                >
                                    {deg}°
                                </button>
                            ))}
                        </div>
                    </section>

                    <button
                        type="button"
                        className="ms-btn-primary w-full disabled:opacity-50"
                        disabled={working}
                        onClick={() => void run()}
                    >
                        {working ? 'Drehe …' : 'Gedrehtes PDF herunterladen'}
                    </button>
                </>
            )}
            <StateHint>{tool.trust}</StateHint>
        </div>
    );
}
