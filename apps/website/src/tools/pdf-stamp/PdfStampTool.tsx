import { useEffect, useMemo, useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import {
    ToolStickyFooter,
    ToolStickyFooterActions,
    ToolStickyFooterMeta,
} from '../_shared/ToolStickyFooter';
import { StateHint } from '../_shared/_shared';
import { downloadPdfBytes, loadPdfDocument, swapBaseFilename } from '../_shared/pdf/io';
import { stampPdf } from '../_shared/pdf/ops';
import { loadPdfJsDocument, renderPdfPageToDataUrl } from '../_shared/pdf/pdfjs';
import { EditorToolShell } from '../_shared/shells/EditorToolShell';

type Props = { tool: Tool };

function todayDe(): string {
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date());
}

export function PdfStampTool({ tool }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(1);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState({ width: 595, height: 842 });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [text, setText] = useState(() => `Eingereicht am ${todayDe()}`);
    const [placement, setPlacement] = useState<{ x: number; y: number } | null>(null);
    const [working, setWorking] = useState(false);
    const previewRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    const fontSize = useMemo(
        () => Math.max(10, Math.min(28, Math.round(pageSize.width * 0.028))),
        [pageSize.width],
    );

    useEffect(() => {
        if (!file) return;
        void loadPdfDocument(file).then((pdf) => {
            setPageSize(pdf.getPage(pageIndex).getSize());
        });
    }, [file, pageIndex]);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        let cancelled = false;
        void loadPdfJsDocument(file)
            .then(async (doc) => {
                const url = await renderPdfPageToDataUrl(doc, pageIndex, 1.4);
                await doc.destroy?.();
                return url;
            })
            .then((url) => {
                if (!cancelled) setPreviewUrl(url);
            })
            .catch(() => {
                if (!cancelled) setPreviewUrl(null);
            });
        return () => {
            cancelled = true;
        };
    }, [file, pageIndex]);

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        void acceptFile(Array.from(files)[0]);
    });

    async function acceptFile(next: File | undefined) {
        if (!next) return;
        try {
            const pdf = await loadPdfDocument(next);
            setFile(next);
            setPageCount(pdf.getPageCount());
            setPageIndex(0);
            setPlacement(null);
            setPageSize(pdf.getPage(0).getSize());
        } catch {
            toast({ message: 'PDF konnte nicht geladen werden.', variant: 'error' });
        }
    }

    function placeStamp(event: React.MouseEvent<HTMLDivElement>) {
        if (!previewRef.current) return;
        const rect = previewRef.current.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width;
        const relY = (event.clientY - rect.top) / rect.height;
        const x = Math.max(8, Math.min(pageSize.width - 40, relX * pageSize.width));
        const y = Math.max(
            8,
            Math.min(pageSize.height - 16, pageSize.height - relY * pageSize.height),
        );
        setPlacement({ x, y });
    }

    async function apply() {
        if (!file || !placement || working) return;
        setWorking(true);
        try {
            const bytes = await stampPdf(file, {
                text,
                pageIndex,
                x: placement.x,
                y: placement.y,
                fontSize,
            });
            downloadPdfBytes(bytes, swapBaseFilename(file.name, '-gestempelt'));
            toast({ message: 'Gestempeltes PDF gespeichert', variant: 'success' });
        } catch (err) {
            toast({
                message: err instanceof Error ? err.message : 'Stempel fehlgeschlagen.',
                variant: 'error',
            });
        } finally {
            setWorking(false);
        }
    }

    if (!file) {
        return (
            <div className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6">
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
                    <p className="font-display text-[20px] font-bold">PDF zum Stempeln laden</p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="ms-sr-only"
                        onChange={(e) => void acceptFile(e.target.files?.[0])}
                    />
                </section>
                <StateHint>{tool.trust}</StateHint>
            </div>
        );
    }

    const stampRel = placement
        ? {
              left: `${(placement.x / pageSize.width) * 100}%`,
              bottom: `${(placement.y / pageSize.height) * 100}%`,
          }
        : null;

    return (
        <EditorToolShell
            tool={tool}
            toolbar={
                <div className="flex flex-wrap items-end gap-3 rounded-lg border-2 border-black bg-white p-3 shadow-brutal-sm">
                    <label className="min-w-[200px] flex-1">
                        <span className="font-display text-[11px] font-bold uppercase tracking-[0.05em]">
                            Stempeltext
                        </span>
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="mt-1 w-full rounded-md border-2 border-black px-3 py-2 text-[14px]"
                        />
                    </label>
                    <button
                        type="button"
                        className="ms-btn text-[12px]"
                        onClick={() => setText(`Eingereicht am ${todayDe()}`)}
                    >
                        Heutiges Datum
                    </button>
                    <button type="button" className="ms-btn text-[12px]" onClick={() => setFile(null)}>
                        Andere Datei
                    </button>
                </div>
            }
            footer={
                <ToolStickyFooter>
                    <ToolStickyFooterMeta>
                        Seite {pageIndex + 1} / {pageCount}
                        {placement ? ' · Stempel gesetzt' : ' · Klicke zum Platzieren'}
                    </ToolStickyFooterMeta>
                    <ToolStickyFooterActions>
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
                        <button
                            type="button"
                            className="ms-btn-primary disabled:opacity-50"
                            disabled={!placement || !text.trim() || working}
                            onClick={() => void apply()}
                        >
                            {working ? 'Speichere …' : 'Stempeln & Download'}
                        </button>
                    </ToolStickyFooterActions>
                </ToolStickyFooter>
            }
        >
            <div
                ref={previewRef}
                className="relative mx-auto max-w-[720px] cursor-crosshair overflow-hidden rounded-lg border-2 border-black bg-[#f3f3f3] shadow-brutal-sm"
                onClick={placeStamp}
                role="presentation"
            >
                {previewUrl ? (
                    <img src={previewUrl} alt={`Seite ${pageIndex + 1}`} className="block w-full" />
                ) : (
                    <div className="flex aspect-[210/297] items-center justify-center text-[14px]">
                        Lade Vorschau …
                    </div>
                )}
                {stampRel ? (
                    <span
                        className="pointer-events-none absolute -translate-y-1/2 font-bold text-[rgb(190,25,25)]"
                        style={{
                            left: stampRel.left,
                            bottom: stampRel.bottom,
                            fontSize: `${Math.max(11, fontSize * 0.9)}px`,
                        }}
                    >
                        {text || '…'}
                    </span>
                ) : null}
            </div>
            <div className="mt-3">
                <StateHint>Klicke in die Vorschau, um den Stempel zu setzen.</StateHint>
            </div>
        </EditorToolShell>
    );
}
