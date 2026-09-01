import { useEffect, useRef, useState } from 'react';
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
import { reorderPdfPages } from '../_shared/pdf/ops';
import { allPageIndices, moveIndex } from '../_shared/pdf/pages';
import { loadPdfJsDocument, renderPdfPageToDataUrl } from '../_shared/pdf/pdfjs';
import { EditorToolShell } from '../_shared/shells/EditorToolShell';

type Props = { tool: Tool };

type Thumb = { index: number; url: string | null };

export function PdfPageReorderTool({ tool }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [order, setOrder] = useState<number[]>([]);
    const [thumbs, setThumbs] = useState<Record<number, string>>({});
    const [working, setWorking] = useState(false);
    const [loadingThumbs, setLoadingThumbs] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        void acceptFile(Array.from(files)[0]);
    });

    useEffect(() => {
        if (!file || !order.length) {
            setThumbs({});
            return;
        }
        let cancelled = false;
        setLoadingThumbs(true);
        void (async () => {
            try {
                const doc = await loadPdfJsDocument(file);
                const next: Record<number, string> = {};
                for (const index of order) {
                    if (cancelled) break;
                    next[index] = await renderPdfPageToDataUrl(doc, index, 0.35);
                }
                await doc.destroy?.();
                if (!cancelled) setThumbs(next);
            } catch {
                if (!cancelled)
                    toast({ message: 'Vorschaubilder fehlgeschlagen.', variant: 'error' });
            } finally {
                if (!cancelled) setLoadingThumbs(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // Only reload thumbs when file changes — order moves reuse same urls
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    async function acceptFile(next: File | undefined) {
        if (!next) return;
        try {
            const pdf = await loadPdfDocument(next);
            const count = pdf.getPageCount();
            setFile(next);
            setOrder(allPageIndices(count));
            setThumbs({});
        } catch {
            toast({ message: 'PDF konnte nicht geladen werden.', variant: 'error' });
        }
    }

    async function save() {
        if (!file || working || order.length < 1) return;
        setWorking(true);
        try {
            const bytes = await reorderPdfPages(file, order);
            downloadPdfBytes(bytes, swapBaseFilename(file.name, '-sortiert'));
            toast({ message: 'Sortiertes PDF gespeichert', variant: 'success' });
        } catch {
            toast({ message: 'Sortieren fehlgeschlagen.', variant: 'error' });
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
                    <p className="font-display text-[20px] font-bold">PDF zum Sortieren laden</p>
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

    const items: Thumb[] = order.map((index) => ({ index, url: thumbs[index] ?? null }));

    return (
        <EditorToolShell
            tool={tool}
            toolbar={
                <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                    <p className="truncate text-[14px] font-semibold">{file.name}</p>
                    <button
                        type="button"
                        className="ms-btn text-[12px]"
                        onClick={() => {
                            setFile(null);
                            setOrder([]);
                            setThumbs({});
                        }}
                    >
                        Wechseln
                    </button>
                </div>
            }
            footer={
                <ToolStickyFooter>
                    <ToolStickyFooterMeta>
                        {order.length} Seiten
                        {loadingThumbs ? ' · Lade Vorschau …' : ''}
                    </ToolStickyFooterMeta>
                    <ToolStickyFooterActions>
                        <button
                            type="button"
                            className="ms-btn text-[12px]"
                            onClick={() => setOrder(allPageIndices(order.length))}
                        >
                            Zurücksetzen
                        </button>
                        <button
                            type="button"
                            className="ms-btn-primary disabled:opacity-50"
                            disabled={working}
                            onClick={() => void save()}
                        >
                            {working ? 'Speichere …' : 'Sortiertes PDF herunterladen'}
                        </button>
                    </ToolStickyFooterActions>
                </ToolStickyFooter>
            }
        >
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {items.map((item, position) => (
                    <li
                        key={`${item.index}-${position}`}
                        className="rounded-lg border-2 border-black bg-white p-2 shadow-brutal-sm"
                    >
                        <div className="mb-2 aspect-[210/297] overflow-hidden rounded border border-black/20 bg-[#eee]">
                            {item.url ? (
                                <img
                                    src={item.url}
                                    alt={`Seite ${item.index + 1}`}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-[12px]">
                                    …
                                </div>
                            )}
                        </div>
                        <p className="mb-2 text-center text-[12px] font-semibold">
                            Seite {item.index + 1}
                        </p>
                        <div className="flex justify-center gap-1">
                            <button
                                type="button"
                                className="ms-btn px-2 py-0.5 text-[11px]"
                                disabled={position === 0}
                                onClick={() =>
                                    setOrder((prev) => moveIndex(prev, position, position - 1))
                                }
                                aria-label="Nach vorne"
                            >
                                ↑
                            </button>
                            <button
                                type="button"
                                className="ms-btn px-2 py-0.5 text-[11px]"
                                disabled={position === items.length - 1}
                                onClick={() =>
                                    setOrder((prev) => moveIndex(prev, position, position + 1))
                                }
                                aria-label="Nach hinten"
                            >
                                ↓
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="mt-3">
                <StateHint>Mit ↑/↓ die Reihenfolge anpassen, dann speichern.</StateHint>
            </div>
        </EditorToolShell>
    );
}
