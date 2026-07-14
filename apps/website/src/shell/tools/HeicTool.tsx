import { useRef, useState } from 'react';
import type { Tool } from '../../data/catalog';
import { useFileDrop } from '../../hooks/useFileDrop';
import { ProgressBar, ResultCard, StateHint } from './_shared';
import { useToast } from '../toast';

type HeicToolProps = {
    tool: Tool;
};

type FormatTarget = 'jpg' | 'png';

export function HeicTool({ tool }: HeicToolProps) {
    const [files, setFiles] = useState<string[]>([]);
    const [target, setTarget] = useState<FormatTarget>('jpg');
    const [working, setWorking] = useState(false);
    const [doneCount, setDoneCount] = useState(0);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    function appendFiles(list: FileList) {
        const names = Array.from(list).map((file) => file.name);
        if (!names.length) return;
        setFiles((prev) => [...prev, ...names]);
        setDoneCount(0);
    }

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((incoming) => appendFiles(incoming));

    function startConvert() {
        if (!files.length || working) return;
        setWorking(true);
        setProgress(0);
        setDoneCount(0);
        const started = Date.now();
        const duration = 1200;
        const timer = window.setInterval(() => {
            const ratio = Math.min(1, (Date.now() - started) / duration);
            setProgress(ratio);
            if (ratio >= 1) {
                window.clearInterval(timer);
                setWorking(false);
                setDoneCount(files.length);
            }
        }, 90);
    }

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-3xl space-y-4 px-4 py-6 md:px-6" aria-busy={working}>
            <section
                className="ms-dropzone rounded-xl p-6 text-center"
                data-drag={dragOver}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <p className="font-display text-[20px] font-bold tracking-[-0.02em]">HEIC-Fotos hierher ziehen</p>
                <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">Mehrere Dateien werden gesammelt und zusammen konvertiert.</p>
                <button type="button" className="ms-btn mt-4" onClick={() => fileInputRef.current?.click()}>
                    Dateien auswählen
                </button>
                <input
                    ref={fileInputRef}
                    className="ms-sr-only"
                    type="file"
                    multiple
                    accept=".heic,.heif"
                    onChange={(e) => {
                        if (e.target.files) appendFiles(e.target.files);
                    }}
                />
            </section>

            {files.length ? (
                <div className="flex flex-wrap gap-2">
                    {files.map((name, idx) => (
                        <span key={`${name}-${idx}`} className="ms-badge bg-[var(--color-chip)] px-3 py-1 text-[12px]">
                            {name}
                        </span>
                    ))}
                </div>
            ) : null}

            <section className="grid gap-4 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm md:grid-cols-[1fr_auto] md:items-center">
                <div className="inline-flex rounded-[999px] border-2 border-black bg-white p-1">
                    <button
                        type="button"
                        className="ms-focus rounded-[999px] px-4 py-1 font-display text-[13px] font-bold"
                        style={{ background: target === 'jpg' ? 'var(--color-info)' : 'transparent' }}
                        onClick={() => setTarget('jpg')}
                    >
                        JPG
                    </button>
                    <button
                        type="button"
                        className="ms-focus rounded-[999px] px-4 py-1 font-display text-[13px] font-bold"
                        style={{ background: target === 'png' ? 'var(--color-info)' : 'transparent' }}
                        onClick={() => setTarget('png')}
                    >
                        PNG
                    </button>
                </div>
                <div className="mx-auto h-[150px] w-[150px] rounded-lg border-2 border-black shadow-brutal-sm md:mx-0">
                    <div
                        className="h-full w-full rounded-md"
                        style={{ background: 'linear-gradient(135deg,#ffd0f0,#dfe6ff)' }}
                        aria-label="Vorschau"
                    />
                </div>
            </section>

            {working ? <ProgressBar value={progress} max={1} /> : null}

            {!working && doneCount > 0 ? (
                <ResultCard tone="success" heading={`Fertig: ${doneCount} Dateien konvertiert`}>
                    <button type="button" className="ms-btn-primary" onClick={() => toast('Download gestartet (Demo)')}>
                        Herunterladen (Demo)
                    </button>
                </ResultCard>
            ) : null}

            <button type="button" className="ms-btn-primary w-full" disabled={!files.length || working} onClick={startConvert}>
                {files.length} Fotos umwandeln
            </button>

            <StateHint>Ziel-Format: {target.toUpperCase()} · Demo-Vorschau.</StateHint>
        </div>
    );
}
