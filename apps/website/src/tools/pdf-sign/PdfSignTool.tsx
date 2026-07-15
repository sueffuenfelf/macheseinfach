import { useEffect, useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { StateHint } from '../_shared/_shared';
import { SignaturePad, signaturePadToPng } from '../_shared/SignaturePad';
import { downloadPdfBytes, loadPdfDocument, swapBaseFilename } from '../_shared/pdf/io';

type PdfSignToolProps = {
    tool: Tool;
};

export function PdfSignTool({ tool }: PdfSignToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(1);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState({ width: 595, height: 842 });
    const [placement, setPlacement] = useState<{ x: number; y: number } | null>(null);
    const [hasSignature, setHasSignature] = useState(false);
    const [working, setWorking] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const previewRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!file) return;
        void loadPdfDocument(file).then((pdf) => {
            const page = pdf.getPage(pageIndex);
            setPageSize(page.getSize());
        });
    }, [file, pageIndex]);

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        void loadFile(Array.from(files)[0]);
    });

    async function loadFile(next: File | undefined) {
        if (!next) return;
        try {
            const pdf = await loadPdfDocument(next);
            const first = pdf.getPage(0);
            const { width, height } = first.getSize();
            setFile(next);
            setPageCount(pdf.getPageCount());
            setPageIndex(0);
            setPageSize({ width, height });
            setPlacement(null);
        } catch {
            toast({ message: 'PDF konnte nicht geladen werden.', variant: 'error' });
        }
    }

    function placeSignature(event: React.MouseEvent<HTMLDivElement>) {
        if (!previewRef.current) return;
        const rect = previewRef.current.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width;
        const relY = (event.clientY - rect.top) / rect.height;
        const signW = pageSize.width * 0.28;
        const signH = pageSize.height * 0.08;
        const x = Math.max(0, Math.min(pageSize.width - signW, relX * pageSize.width - signW / 2));
        const y = Math.max(
            0,
            Math.min(pageSize.height - signH, pageSize.height - relY * pageSize.height - signH / 2),
        );
        setPlacement({ x, y });
    }

    async function signAndDownload() {
        if (!file || !placement || !hasSignature || working) return;
        const pngBytes = signaturePadToPng(canvasRef.current);
        if (!pngBytes) {
            toast({ message: 'Bitte zuerst unterschreiben.', variant: 'error' });
            return;
        }
        setWorking(true);
        try {
            const pdf = await loadPdfDocument(file);
            const page = pdf.getPage(pageIndex);
            const image = await pdf.embedPng(pngBytes);
            const signW = pageSize.width * 0.28;
            const signH = (image.height / image.width) * signW;
            page.drawImage(image, {
                x: placement.x,
                y: placement.y,
                width: signW,
                height: signH,
            });
            const bytes = await pdf.save();
            downloadPdfBytes(bytes, swapBaseFilename(file.name, '-signiert'));
            toast({ message: 'Signierte PDF heruntergeladen', variant: 'success' });
        } catch {
            toast({ message: 'Signatur konnte nicht eingefügt werden.', variant: 'error' });
        } finally {
            setWorking(false);
        }
    }

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-3xl space-y-4 px-4 py-6 md:px-6">
            {!file ? (
                <section
                    className="ms-dropzone rounded-xl p-8 text-center"
                    data-drag={dragOver}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                >
                    <p className="font-display text-[20px] font-bold">PDF zum Signieren laden</p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="ms-sr-only"
                        onChange={(e) => void loadFile(e.target.files?.[0])}
                    />
                </section>
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border-2 border-black bg-white px-3 py-2">
                        <p className="text-[14px] font-semibold">{file.name}</p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="ms-btn px-2 py-0.5 text-[11px]"
                                disabled={pageIndex <= 0}
                                onClick={() => {
                                    setPageIndex((p) => p - 1);
                                    setPlacement(null);
                                }}
                            >
                                ←
                            </button>
                            <span className="text-[12px]">
                                Seite {pageIndex + 1} / {pageCount}
                            </span>
                            <button
                                type="button"
                                className="ms-btn px-2 py-0.5 text-[11px]"
                                disabled={pageIndex >= pageCount - 1}
                                onClick={() => {
                                    setPageIndex((p) => p + 1);
                                    setPlacement(null);
                                }}
                            >
                                →
                            </button>
                        </div>
                    </div>

                    <section className="rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm">
                        <p className="font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                            Unterschrift
                        </p>
                        <div className="mt-2">
                            <SignaturePad canvasRef={canvasRef} onChange={setHasSignature} />
                        </div>
                    </section>

                    <section className="rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm">
                        <p className="font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                            Position wählen
                        </p>
                        <div
                            ref={previewRef}
                            className="relative mt-2 cursor-crosshair overflow-hidden rounded-md border-2 border-black bg-[var(--color-chip)]"
                            style={{
                                aspectRatio: `${pageSize.width} / ${pageSize.height}`,
                                maxHeight: '420px',
                            }}
                            onClick={placeSignature}
                        >
                            {placement ? (
                                <div
                                    className="absolute rounded border-2 border-dashed border-black bg-white/40"
                                    style={{
                                        left: `${(placement.x / pageSize.width) * 100}%`,
                                        bottom: `${(placement.y / pageSize.height) * 100}%`,
                                        width: '28%',
                                        height: '8%',
                                    }}
                                />
                            ) : null}
                        </div>
                    </section>

                    <button
                        type="button"
                        className="ms-btn-primary w-full"
                        disabled={!placement || !hasSignature || working}
                        onClick={() => void signAndDownload()}
                    >
                        Signierte PDF herunterladen
                    </button>
                </>
            )}
            <StateHint>{tool.trust}</StateHint>
        </div>
    );
}
