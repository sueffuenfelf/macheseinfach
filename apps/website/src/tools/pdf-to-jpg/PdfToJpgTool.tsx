import { useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { StateHint } from '../_shared/_shared';
import { downloadBlobsSequential, loadPdfDocument } from '../_shared/pdf/io';
import { pdfPagesToJpg } from '../_shared/pdf/ops';
import { parsePageSpec } from '../_shared/pdf/pages';

type Props = { tool: Tool };

export function PdfToJpgTool({ tool }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(0);
    const [spec, setSpec] = useState('alle');
    const [quality, setQuality] = useState(88);
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
            setSpec('alle');
        } catch {
            toast({ message: 'PDF konnte nicht geladen werden.', variant: 'error' });
        }
    }

    async function run() {
        if (!file || working) return;
        setWorking(true);
        try {
            const pageIndices =
                !spec.trim() || spec.trim().toLowerCase() === 'alle'
                    ? undefined
                    : parsePageSpec(spec, pageCount);
            if (pageIndices && !pageIndices.length) {
                throw new Error('Keine gültigen Seiten angegeben.');
            }
            const pages = await pdfPagesToJpg(file, {
                pageIndices,
                quality: quality / 100,
                scale: 2,
            });
            const base = file.name.replace(/\.pdf$/i, '') || 'seite';
            await downloadBlobsSequential(
                pages.map((page) => ({
                    blob: page.blob,
                    filename: `${base}-seite-${page.pageIndex + 1}.jpg`,
                })),
            );
            toast({ message: `${pages.length} JPG(s) heruntergeladen`, variant: 'success' });
        } catch (err) {
            toast({
                message: err instanceof Error ? err.message : 'Export fehlgeschlagen.',
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
                    <p className="font-display text-[20px] font-bold">PDF → JPG</p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                        Seiten werden mit pdf.js gerendert und als JPEG gespeichert.
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
                        <button type="button" className="ms-btn" onClick={() => setFile(null)}>
                            Wechseln
                        </button>
                    </div>

                    <section className="space-y-3 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm">
                        <label className="block">
                            <span className="font-display text-[11px] font-bold uppercase tracking-[0.05em]">
                                Seiten (alle oder z. B. 1-3)
                            </span>
                            <input
                                value={spec}
                                onChange={(e) => setSpec(e.target.value)}
                                className="mt-1 w-full rounded-md border-2 border-black px-3 py-2"
                            />
                        </label>
                        <label className="block">
                            <span className="font-display text-[11px] font-bold uppercase tracking-[0.05em]">
                                JPEG-Qualität ({quality}%)
                            </span>
                            <input
                                type="range"
                                min={50}
                                max={100}
                                value={quality}
                                onChange={(e) => setQuality(Number(e.target.value))}
                                className="mt-2 w-full"
                                style={{ accentColor: '#000' }}
                            />
                        </label>
                    </section>

                    <button
                        type="button"
                        className="ms-btn-primary w-full disabled:opacity-50"
                        disabled={working}
                        onClick={() => void run()}
                    >
                        {working ? 'Rendere …' : 'Als JPG herunterladen'}
                    </button>
                </>
            )}
            <StateHint>{tool.trust}</StateHint>
        </div>
    );
}
