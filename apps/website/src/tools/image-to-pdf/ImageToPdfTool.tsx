import { useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { PageHead } from '../../seo/PageHead';
import { ProgressBar, ResultCard, StateHint } from '../_shared/_shared';
import { IMAGE_ACCEPT, isAcceptedImageFile } from '../_shared/image/accept';
import { imagesPdfFilename, imagesToPdf } from '../_shared/image/to-pdf';
import { downloadPdfBytes } from '../_shared/pdf/io';

type ImageToPdfToolProps = {
    tool: Tool;
};

type ImageEntry = {
    id: string;
    file: File;
};

export function ImageToPdfTool({ tool }: ImageToPdfToolProps) {
    const [entries, setEntries] = useState<ImageEntry[]>([]);
    const [working, setWorking] = useState(false);
    const [progress, setProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    function appendFiles(list: FileList) {
        const images = Array.from(list).filter(isAcceptedImageFile);
        if (!images.length) {
            toast({ message: 'Bitte Bilddateien auswählen.', variant: 'error' });
            return;
        }
        setEntries((prev) => [
            ...prev,
            ...images.map((file) => ({ id: crypto.randomUUID(), file })),
        ]);
    }

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop(appendFiles);

    function moveEntry(id: string, direction: -1 | 1) {
        setEntries((prev) => {
            const index = prev.findIndex((entry) => entry.id === id);
            if (index < 0) return prev;
            const target = index + direction;
            if (target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            const [item] = next.splice(index, 1);
            next.splice(target, 0, item);
            return next;
        });
    }

    function removeEntry(id: string) {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
    }

    async function buildPdf() {
        if (!entries.length || working) return;
        setWorking(true);
        setProgress(0.15);
        try {
            const bytes = await imagesToPdf(entries.map((entry) => entry.file));
            setProgress(1);
            downloadPdfBytes(bytes, imagesPdfFilename(entries[0].file.name));
            toast({
                message: `${entries.length} Bilder als PDF heruntergeladen`,
                variant: 'success',
            });
        } catch {
            toast({ message: 'PDF konnte nicht erstellt werden.', variant: 'error' });
        } finally {
            setWorking(false);
            setProgress(0);
        }
    }

    return (
        <>
            <PageHead fallbackTitle={tool.title} />
            <div
                className="ms-animate-fade mx-auto w-full max-w-3xl space-y-4 px-4 py-6 md:px-6"
                aria-busy={working}
            >
                <section
                    className="ms-dropzone rounded-xl p-6 text-center"
                    data-drag={dragOver}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <p className="font-display text-[20px] font-bold tracking-[-0.02em]">
                        {tool.title}
                    </p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                        Mehrere Fotos zu einer PDF — eine Seite pro Bild.
                    </p>
                    <button
                        type="button"
                        className="ms-btn mt-4"
                        onClick={() => inputRef.current?.click()}
                    >
                        Bilder auswählen
                    </button>
                    <input
                        ref={inputRef}
                        className="ms-sr-only"
                        type="file"
                        multiple
                        accept={IMAGE_ACCEPT}
                        onChange={(e) => e.target.files && appendFiles(e.target.files)}
                    />
                </section>

                {entries.length ? (
                    <ul className="space-y-2">
                        {entries.map((entry, index) => (
                            <li
                                key={entry.id}
                                className="flex items-center gap-2 rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm"
                            >
                                <span className="min-w-0 flex-1 truncate text-[14px]">
                                    {entry.file.name}
                                </span>
                                <div className="flex shrink-0 gap-1">
                                    <button
                                        type="button"
                                        className="ms-btn px-2 py-0.5 text-[11px]"
                                        disabled={index === 0}
                                        onClick={() => moveEntry(entry.id, -1)}
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        className="ms-btn px-2 py-0.5 text-[11px]"
                                        disabled={index === entries.length - 1}
                                        onClick={() => moveEntry(entry.id, 1)}
                                    >
                                        ↓
                                    </button>
                                    <button
                                        type="button"
                                        className="ms-btn px-2 py-0.5 text-[11px]"
                                        onClick={() => removeEntry(entry.id)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : null}

                {working ? <ProgressBar value={progress} max={1} /> : null}

                {entries.length > 0 && !working ? (
                    <ResultCard tone="info" heading={`${entries.length} Bilder bereit`}>
                        <p className="text-[14px]">
                            Reihenfolge mit ↑/↓ anpassen — jede Seite behält die Originalgröße in
                            Pixeln.
                        </p>
                    </ResultCard>
                ) : null}

                <button
                    type="button"
                    className="ms-btn-primary w-full"
                    disabled={!entries.length || working}
                    onClick={() => void buildPdf()}
                >
                    {entries.length ? `${entries.length} Bilder als PDF` : 'PDF erstellen'}
                </button>

                <StateHint>
                    HEIC/WebP werden vor dem Einbetten zu JPG konvertiert. Läuft im Browser.
                </StateHint>
            </div>
        </>
    );
}
