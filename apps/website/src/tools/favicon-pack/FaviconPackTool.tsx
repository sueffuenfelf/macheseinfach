import { useRef, useState } from 'react';
import type { ToolDefinition } from '../../data/catalog/types';
import { PageHead } from '../../seo/PageHead';
import { ResultCard, StateHint } from '../_shared/_shared';
import { downloadBlob } from '../_shared/pdf/io';
import { EditorToolShell } from '../_shared/shells';
import {
    FAVICON_SIZES,
    faviconFilename,
    loadImageFile,
    resizeToPng,
    type FaviconSize,
} from './compute';

export function FaviconPackTool({ tool }: { tool: ToolDefinition }) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onFileSelected(list: FileList | null) {
        const next = list?.[0];
        if (!next) return;
        setError(null);
        setFile(next);
        setPreview(URL.createObjectURL(next));
    }

    async function downloadSize(size: FaviconSize) {
        if (!file) return;
        setBusy(true);
        setError(null);
        try {
            const img = await loadImageFile(file);
            const blob = await resizeToPng(img, size);
            downloadBlob(blob, faviconFilename(size));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Export fehlgeschlagen');
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <PageHead tool={tool} />
            <EditorToolShell tool={tool}>
                <p className="mb-4 text-sm text-ink-soft">
                    Quadratisches Logo oder Icon hochladen — PNG in Standardgrößen exportieren.
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => void onFileSelected(e.target.files)}
                />
                <button
                    type="button"
                    className="mb-4 rounded-md border-2 border-black bg-[var(--tool-accent-soft)] px-4 py-2 text-sm font-semibold shadow-brutal-sm"
                    onClick={() => inputRef.current?.click()}
                >
                    Bild wählen
                </button>
                {file ? (
                    <p className="mb-4 text-sm">
                        Datei: <strong>{file.name}</strong>
                    </p>
                ) : (
                    <StateHint>PNG, JPG oder WebP — idealerweise quadratisch.</StateHint>
                )}
                {preview ? (
                    <img
                        src={preview}
                        alt="Vorschau"
                        className="mb-6 max-h-32 rounded-md border-2 border-black shadow-brutal-sm"
                    />
                ) : null}
                <ResultCard title="Empfohlene Größen" tone="info">
                    <ul className="mb-4 list-inside list-disc text-sm text-ink-soft">
                        <li>16×16, 32×32, 48×48 — klassische Favicons</li>
                        <li>180×180 — Apple Touch Icon</li>
                        <li>192×192, 512×512 — PWA / Manifest</li>
                    </ul>
                    <div className="flex flex-wrap gap-2">
                        {FAVICON_SIZES.map((size) => (
                            <button
                                key={size}
                                type="button"
                                disabled={!file || busy}
                                className="rounded-md border-2 border-black bg-surface px-3 py-1.5 text-sm font-medium shadow-brutal-sm disabled:opacity-50"
                                onClick={() => void downloadSize(size)}
                            >
                                {size}px
                            </button>
                        ))}
                    </div>
                </ResultCard>
                {error ? <p className="mt-3 text-sm text-danger-ink">{error}</p> : null}
                <p className="mt-4 text-xs text-ink-muted">
                    ICO-Dateien: PNGs in Online-Konverter packen oder{' '}
                    <code className="rounded bg-chip px-1">rel="icon"</code> mit 32px PNG nutzen.
                </p>
            </EditorToolShell>
        </>
    );
}
