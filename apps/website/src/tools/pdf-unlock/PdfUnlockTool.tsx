import { useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { StateHint } from '../_shared/_shared';
import { downloadPdfBytes, swapBaseFilename } from '../_shared/pdf/io';
import { unlockPdf } from '../_shared/pdf/ops';

type Props = { tool: Tool };

export function PdfUnlockTool({ tool }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [working, setWorking] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        const next = Array.from(files)[0];
        if (next) setFile(next);
    });

    async function run() {
        if (!file || working) return;
        if (!password.trim()) {
            toast({ message: 'Bitte das PDF-Passwort eingeben.', variant: 'error' });
            return;
        }
        setWorking(true);
        try {
            const bytes = await unlockPdf(file, password);
            downloadPdfBytes(bytes, swapBaseFilename(file.name, '-entsperrt'));
            toast({ message: 'Unverschlüsseltes PDF gespeichert', variant: 'success' });
        } catch {
            toast({
                message: 'Entsperren fehlgeschlagen — Passwort prüfen.',
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
                    <p className="font-display text-[20px] font-bold">Geschütztes PDF laden</p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                        Nur mit dem Passwort, das du kennst — alles bleibt lokal.
                    </p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="ms-sr-only"
                        onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                    />
                </section>
            ) : (
                <>
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                        <p className="text-[14px] font-semibold">{file.name}</p>
                        <button
                            type="button"
                            className="ms-btn"
                            onClick={() => {
                                setFile(null);
                                setPassword('');
                            }}
                        >
                            Wechseln
                        </button>
                    </div>

                    <label className="block rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm">
                        <span className="font-display text-[11px] font-bold uppercase tracking-[0.05em]">
                            Passwort
                        </span>
                        <input
                            type="password"
                            autoComplete="off"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full rounded-md border-2 border-black px-3 py-2"
                            placeholder="PDF-Passwort"
                        />
                    </label>

                    <button
                        type="button"
                        className="ms-btn-primary w-full disabled:opacity-50"
                        disabled={working || !password.trim()}
                        onClick={() => void run()}
                    >
                        {working ? 'Entsperre …' : 'Entsperren & herunterladen'}
                    </button>
                </>
            )}
            <StateHint>
                {tool.trust} · Seiten werden neu gerendert (Text ggf. nicht mehr markierbar).
            </StateHint>
        </div>
    );
}
