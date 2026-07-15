import { useEffect, useRef, useState } from 'react';
import { rgb } from 'pdf-lib';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { StateHint } from '../_shared/_shared';
import { downloadPdfBytes, loadPdfDocument, swapBaseFilename } from '../_shared/pdf/io';

type PdfRedactToolProps = {
    tool: Tool;
};

type RedactionBox = {
    id: string;
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
};

const BOX_HEIGHT_PT = 14;
const BOX_WIDTH_RATIO = 0.75;

export function PdfRedactTool({ tool }: PdfRedactToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(1);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState({ width: 595, height: 842 });
    const [boxes, setBoxes] = useState<RedactionBox[]>([]);
    const [working, setWorking] = useState(false);
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
            setBoxes([]);
        } catch {
            toast({ message: 'PDF konnte nicht geladen werden.', variant: 'error' });
        }
    }

    function addBoxAtClick(event: React.MouseEvent<HTMLDivElement>) {
        if (!file || !previewRef.current) return;
        const rect = previewRef.current.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width;
        const relY = (event.clientY - rect.top) / rect.height;
        const width = pageSize.width * BOX_WIDTH_RATIO;
        const height = BOX_HEIGHT_PT;
        const x = Math.max(0, Math.min(pageSize.width - width, relX * pageSize.width - width / 2));
        const y = Math.max(
            0,
            Math.min(
                pageSize.height - height,
                pageSize.height - relY * pageSize.height - height / 2,
            ),
        );
        setBoxes((prev) => [...prev, { id: crypto.randomUUID(), pageIndex, x, y, width, height }]);
    }

    function undoLast() {
        setBoxes((prev) => prev.slice(0, -1));
    }

    async function exportPdf() {
        if (!file || working) return;
        setWorking(true);
        try {
            const pdf = await loadPdfDocument(file);
            for (const box of boxes) {
                const page = pdf.getPage(box.pageIndex);
                page.drawRectangle({
                    x: box.x,
                    y: box.y,
                    width: box.width,
                    height: box.height,
                    color: rgb(0, 0, 0),
                });
            }
            const bytes = await pdf.save();
            downloadPdfBytes(bytes, swapBaseFilename(file.name, '-geschwaerzt'));
            toast({ message: 'Geschwärzte PDF heruntergeladen', variant: 'success' });
        } catch {
            toast({ message: 'Export fehlgeschlagen.', variant: 'error' });
        } finally {
            setWorking(false);
        }
    }

    const pageBoxes = boxes.filter((box) => box.pageIndex === pageIndex);

    return (
        <div className="ms-animate-fade mx-auto grid w-full max-w-3xl gap-5 px-4 py-6 md:grid-cols-[1.2fr_0.8fr] md:px-6">
            {!file ? (
                <section
                    className="ms-dropzone rounded-xl p-8 text-center md:col-span-2"
                    data-drag={dragOver}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                >
                    <p className="font-display text-[20px] font-bold">PDF zum Schwärzen laden</p>
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
                    <section className="rounded-xl border-2 border-black bg-white p-4 shadow-brutal-lg md:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-display text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-soft)]">
                                {file.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="ms-btn px-2 py-0.5 text-[11px]"
                                    disabled={pageIndex <= 0}
                                    onClick={() => setPageIndex((p) => p - 1)}
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
                                    onClick={() => setPageIndex((p) => p + 1)}
                                >
                                    →
                                </button>
                            </div>
                        </div>
                        <div
                            ref={previewRef}
                            className="relative mt-4 cursor-crosshair overflow-hidden rounded-md border-2 border-black bg-[var(--color-chip)]"
                            style={{ aspectRatio: `${pageSize.width} / ${pageSize.height}` }}
                            onClick={addBoxAtClick}
                            role="presentation"
                        >
                            {pageBoxes.map((box) => (
                                <div
                                    key={box.id}
                                    className="absolute bg-black"
                                    style={{
                                        left: `${(box.x / pageSize.width) * 100}%`,
                                        bottom: `${(box.y / pageSize.height) * 100}%`,
                                        width: `${(box.width / pageSize.width) * 100}%`,
                                        height: `${(box.height / pageSize.height) * 100}%`,
                                    }}
                                />
                            ))}
                        </div>
                        <p className="mt-2 text-[12px] text-[var(--color-ink-soft)]">
                            Klicke auf die Vorschau, um einen Schwärzungsbereich zu setzen.
                        </p>
                    </section>

                    <aside className="rounded-xl border-2 border-black bg-[#ffd0f0] p-4 shadow-brutal-lg md:p-5">
                        <p className="font-display text-[18px] font-bold tracking-[-0.02em]">
                            Werkzeug
                        </p>
                        <p className="mt-3 rounded-md border-2 border-black bg-white px-3 py-2 text-[14px] font-semibold">
                            Schwärzungen: {boxes.length}
                        </p>
                        <div className="mt-3 space-y-2">
                            <button
                                type="button"
                                className="ms-btn w-full"
                                disabled={boxes.length === 0}
                                onClick={undoLast}
                            >
                                Letzte Schwärzung rückgängig
                            </button>
                            <button
                                type="button"
                                className="ms-btn-primary w-full"
                                disabled={boxes.length === 0 || working}
                                onClick={() => void exportPdf()}
                            >
                                PDF exportieren
                            </button>
                        </div>
                        <div className="mt-3">
                            <StateHint>
                                Schwärzung wird sichtbar eingebrannt — für rechtssichere Entfernung
                                aus dem Inhaltsstrom folgt v0.2.
                            </StateHint>
                        </div>
                    </aside>
                </>
            )}
        </div>
    );
}
