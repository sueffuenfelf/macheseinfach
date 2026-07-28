import { useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { InfoGrid, ResultCard, StateHint } from '../_shared/_shared';
import type { CheckResult } from '../_shared/shells/types';
import { checkIdPhoto, loadImageDimensions } from './compute';

type Props = { tool: Tool };

const ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

export function IdPhotoCheckTool({ tool }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [result, setResult] = useState<CheckResult | null>(null);
    const [checking, setChecking] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        void acceptFile(Array.from(files)[0]);
    });

    async function acceptFile(next: File | undefined) {
        if (!next) return;
        if (!next.type.startsWith('image/')) {
            toast({ message: 'Bitte ein Bild (JPG/PNG/WebP) wählen.', variant: 'error' });
            return;
        }
        setChecking(true);
        setFile(next);
        setPreviewUrl(URL.createObjectURL(next));
        try {
            const dims = await loadImageDimensions(next);
            setResult(
                checkIdPhoto({
                    widthPx: dims.width,
                    heightPx: dims.height,
                    bytes: next.size,
                    mime: next.type,
                }),
            );
        } catch {
            setResult(null);
            toast({ message: 'Bild konnte nicht gelesen werden.', variant: 'error' });
        } finally {
            setChecking(false);
        }
    }

    function clear() {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(null);
        setPreviewUrl(null);
        setResult(null);
    }

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6">
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
                    <p className="font-display text-[20px] font-bold">Passfoto laden</p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                        Prüft 35×45-mm-Seitenverhältnis, Mindestpixel und Dateigröße.
                    </p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPT}
                        className="ms-sr-only"
                        onChange={(e) => void acceptFile(e.target.files?.[0])}
                    />
                </section>
            ) : (
                <>
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                        <p className="truncate text-[14px] font-semibold">{file.name}</p>
                        <button type="button" className="ms-btn" onClick={clear}>
                            Wechseln
                        </button>
                    </div>

                    {previewUrl ? (
                        <div className="mx-auto w-[160px] overflow-hidden rounded-lg border-2 border-black bg-white shadow-brutal-sm">
                            <img
                                src={previewUrl}
                                alt="Passfoto-Vorschau"
                                className="block w-full object-cover"
                            />
                        </div>
                    ) : null}

                    {checking ? <p className="ms-pulse text-[14px] font-semibold">Prüfe …</p> : null}

                    {result ? (
                        <ResultCard tone={result.tone} heading={result.heading}>
                            {result.summary ? (
                                <p className="text-[14px] font-medium">{result.summary}</p>
                            ) : null}
                            {result.message ? <p className="text-[14px]">{result.message}</p> : null}
                            {result.details?.length ? <InfoGrid items={result.details} /> : null}
                        </ResultCard>
                    ) : null}
                </>
            )}
            <StateHint>
                {tool.trust} · Kein Ersatz für biometrische Vorgaben der Behörde.
            </StateHint>
        </div>
    );
}
