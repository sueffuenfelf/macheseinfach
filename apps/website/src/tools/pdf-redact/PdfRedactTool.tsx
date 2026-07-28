import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import {
    ToolStickyFooter,
    ToolStickyFooterActions,
    ToolStickyFooterLayout,
    ToolStickyFooterMeta,
} from '../_shared/ToolStickyFooter';
import { downloadPdfBytes, loadPdfDocument, swapBaseFilename } from '../_shared/pdf/io';
import { loadPdfJsDocument, renderPdfPageToDataUrl } from '../_shared/pdf/pdfjs';
import { exportRedactedPdf, type RedactionBox } from '../_shared/pdf/redact';
import { isEditableTarget, isModKey, useUndoRedo } from '../_shared/useUndoRedo';

type PdfRedactToolProps = {
    tool: Tool;
};

type UiRedactionBox = RedactionBox & { id: string };

type DragDraft = {
    startRelX: number;
    startRelY: number;
    currentRelX: number;
    currentRelY: number;
};

const PREVIEW_SCALE = 1.5;
const MIN_BOX_PT = 8;

function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

function relToPdfBox(
    startRelX: number,
    startRelY: number,
    endRelX: number,
    endRelY: number,
    pageSize: { width: number; height: number },
): Pick<RedactionBox, 'x' | 'y' | 'width' | 'height'> {
    const minRelX = Math.min(startRelX, endRelX);
    const maxRelX = Math.max(startRelX, endRelX);
    const minRelY = Math.min(startRelY, endRelY);
    const maxRelY = Math.max(startRelY, endRelY);

    return {
        x: minRelX * pageSize.width,
        y: pageSize.height - maxRelY * pageSize.height,
        width: (maxRelX - minRelX) * pageSize.width,
        height: (maxRelY - minRelY) * pageSize.height,
    };
}

function draftOverlayStyle(draft: DragDraft): CSSProperties {
    const minRelX = Math.min(draft.startRelX, draft.currentRelX);
    const maxRelX = Math.max(draft.startRelX, draft.currentRelX);
    const minRelY = Math.min(draft.startRelY, draft.currentRelY);
    const maxRelY = Math.max(draft.startRelY, draft.currentRelY);

    return {
        left: `${minRelX * 100}%`,
        top: `${minRelY * 100}%`,
        width: `${(maxRelX - minRelX) * 100}%`,
        height: `${(maxRelY - minRelY) * 100}%`,
    };
}

function ShortcutKeys({ keys }: { keys: string[] }) {
    return (
        <span className="ml-2 inline-flex items-center gap-1">
            {keys.map((key) => (
                <kbd
                    key={key}
                    className="rounded border border-black/30 bg-white px-1.5 py-0.5 font-mono text-[10px] font-normal"
                >
                    {key}
                </kbd>
            ))}
        </span>
    );
}

export function PdfRedactTool({ tool }: PdfRedactToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(1);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState({ width: 595, height: 842 });
    const [pagePreviewUrl, setPagePreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const {
        value: boxes,
        update: updateBoxes,
        undo,
        redo,
        reset: resetBoxes,
        canUndo,
        canRedo,
    } = useUndoRedo<UiRedactionBox[]>([]);
    const [draft, setDraft] = useState<DragDraft | null>(null);
    const [working, setWorking] = useState(false);
    const previewRef = useRef<HTMLDivElement | null>(null);
    const jsDocRef = useRef<Awaited<ReturnType<typeof loadPdfJsDocument>> | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const pageCountRef = useRef(pageCount);
    const { toast } = useToast();

    pageCountRef.current = pageCount;

    useEffect(() => {
        if (!file) return;
        void loadPdfDocument(file).then((pdf) => {
            const page = pdf.getPage(pageIndex);
            setPageSize(page.getSize());
        });
    }, [file, pageIndex]);

    useEffect(() => {
        if (!file || !jsDocRef.current) {
            setPagePreviewUrl(null);
            return;
        }

        let cancelled = false;
        setPreviewLoading(true);
        void renderPdfPageToDataUrl(jsDocRef.current, pageIndex, PREVIEW_SCALE)
            .then((url) => {
                if (!cancelled) setPagePreviewUrl(url);
            })
            .catch(() => {
                if (!cancelled) setPagePreviewUrl(null);
            })
            .finally(() => {
                if (!cancelled) setPreviewLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [file, pageIndex]);

    useEffect(() => {
        if (!file) return;

        function onKeyDown(event: KeyboardEvent) {
            if (isEditableTarget(event.target)) return;

            const mod = isModKey(event);

            if (mod && event.key.toLowerCase() === 'z' && !event.shiftKey) {
                event.preventDefault();
                undo();
                return;
            }

            if (
                mod &&
                (event.key.toLowerCase() === 'y' ||
                    (event.key.toLowerCase() === 'z' && event.shiftKey))
            ) {
                event.preventDefault();
                redo();
                return;
            }

            if (draft) return;

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                setPageIndex((page) => Math.max(0, page - 1));
                return;
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                setPageIndex((page) => Math.min(pageCountRef.current - 1, page + 1));
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [draft, file, redo, undo]);

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        void loadFile(Array.from(files)[0]);
    });

    async function loadFile(next: File | undefined) {
        if (!next) return;
        try {
            const pdf = await loadPdfDocument(next);
            const jsDoc = await loadPdfJsDocument(next);
            jsDocRef.current = jsDoc;
            const first = pdf.getPage(0);
            const { width, height } = first.getSize();
            setFile(next);
            setPageCount(pdf.getPageCount());
            setPageIndex(0);
            setPageSize({ width, height });
            resetBoxes([]);
            setDraft(null);
        } catch {
            toast({ message: 'PDF konnte nicht geladen werden.', variant: 'error' });
        }
    }

    function clientToRel(clientX: number, clientY: number): { relX: number; relY: number } | null {
        if (!previewRef.current) return null;
        const rect = previewRef.current.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return null;
        return {
            relX: clamp01((clientX - rect.left) / rect.width),
            relY: clamp01((clientY - rect.top) / rect.height),
        };
    }

    function onPreviewPointerDown(event: React.PointerEvent<HTMLDivElement>) {
        if (!file || previewLoading || event.button !== 0) return;
        event.preventDefault();
        const rel = clientToRel(event.clientX, event.clientY);
        if (!rel) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        setDraft({
            startRelX: rel.relX,
            startRelY: rel.relY,
            currentRelX: rel.relX,
            currentRelY: rel.relY,
        });
    }

    function onPreviewPointerMove(event: React.PointerEvent<HTMLDivElement>) {
        if (!draft) return;
        const rel = clientToRel(event.clientX, event.clientY);
        if (!rel) return;
        setDraft((current) =>
            current ? { ...current, currentRelX: rel.relX, currentRelY: rel.relY } : null,
        );
    }

    function finishDraft(event: React.PointerEvent<HTMLDivElement>) {
        if (!draft) return;

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        const nextBox = relToPdfBox(
            draft.startRelX,
            draft.startRelY,
            draft.currentRelX,
            draft.currentRelY,
            pageSize,
        );

        if (nextBox.width >= MIN_BOX_PT && nextBox.height >= MIN_BOX_PT) {
            updateBoxes((current) => [
                ...current,
                { id: crypto.randomUUID(), pageIndex, ...nextBox },
            ]);
        }

        setDraft(null);
    }

    async function exportPdf() {
        if (!file || working) return;
        setWorking(true);
        try {
            const bytes = await exportRedactedPdf(
                file,
                boxes.map(({ pageIndex, x, y, width, height }) => ({
                    pageIndex,
                    x,
                    y,
                    width,
                    height,
                })),
            );
            downloadPdfBytes(bytes, swapBaseFilename(file.name, '-geschwaerzt'));
            toast({ message: 'Geschwärzte PDF heruntergeladen', variant: 'success' });
        } catch {
            toast({ message: 'Export fehlgeschlagen.', variant: 'error' });
        } finally {
            setWorking(false);
        }
    }

    const pageBoxes = boxes.filter((box) => box.pageIndex === pageIndex);

    const footer = file ? (
        <ToolStickyFooter background="#ffd0f0">
            <ToolStickyFooterMeta
                title={`Schwärzungen: ${boxes.length}`}
                hint="Strg+Z / Strg+⇧+Z · Seiten mit Schwärzungen werden beim Export gerastert"
            />
            <ToolStickyFooterActions>
                <button
                    type="button"
                    className="ms-btn min-w-0 flex-1 text-[13px] sm:flex-none"
                    disabled={!canUndo}
                    onClick={undo}
                >
                    Rückgängig
                    <ShortcutKeys keys={['Strg', 'Z']} />
                </button>
                <button
                    type="button"
                    className="ms-btn min-w-0 flex-1 text-[13px] sm:flex-none"
                    disabled={!canRedo}
                    onClick={redo}
                >
                    Wiederholen
                    <ShortcutKeys keys={['Strg', '⇧', 'Z']} />
                </button>
                <button
                    type="button"
                    className="ms-btn-primary w-full min-w-0 sm:w-auto"
                    disabled={boxes.length === 0 || working}
                    onClick={() => void exportPdf()}
                >
                    PDF exportieren
                </button>
            </ToolStickyFooterActions>
        </ToolStickyFooter>
    ) : undefined;

    return (
        <ToolStickyFooterLayout footer={footer}>
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
                    <p className="font-display text-[20px] font-bold">PDF zum Schwärzen laden</p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                        Gehaltszeilen, Kontonummern oder andere sensible Stellen markieren — der
                        Inhalt darunter wird beim Export entfernt.
                    </p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="ms-sr-only"
                        onChange={(e) => void loadFile(e.target.files?.[0])}
                    />
                </section>
            ) : (
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
                                title="Vorherige Seite (←)"
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
                                title="Nächste Seite (→)"
                            >
                                →
                            </button>
                        </div>
                    </div>
                    <div
                        ref={previewRef}
                        className="relative mt-4 cursor-crosshair touch-none overflow-hidden rounded-md border-2 border-black bg-[var(--color-chip)]"
                        style={{
                            aspectRatio: `${pageSize.width} / ${pageSize.height}`,
                            minHeight: 'min(75vh, 900px)',
                        }}
                        onPointerDown={onPreviewPointerDown}
                        onPointerMove={onPreviewPointerMove}
                        onPointerUp={finishDraft}
                        onPointerCancel={finishDraft}
                        role="presentation"
                    >
                        {previewLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold">
                                Vorschau lädt …
                            </div>
                        ) : pagePreviewUrl ? (
                            <img
                                src={pagePreviewUrl}
                                alt={`Seite ${pageIndex + 1}`}
                                className="pointer-events-none h-full w-full object-contain"
                                draggable={false}
                            />
                        ) : null}
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
                        {draft ? (
                            <div
                                className="absolute border-2 border-black bg-black/70"
                                style={draftOverlayStyle(draft)}
                            />
                        ) : null}
                    </div>
                    <p className="mt-2 text-[12px] text-[var(--color-ink-soft)]">
                        Ziehe ein Rechteck über den Bereich, den du schwärzen willst.{' '}
                        <ShortcutKeys keys={['←', '→']} /> Seiten wechseln.
                    </p>
                </section>
            )}
        </ToolStickyFooterLayout>
    );
}
