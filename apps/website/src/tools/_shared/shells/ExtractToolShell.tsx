import { useState } from 'react';
import type { ToolDefinition } from '../../../data/catalog/types';
import { ResultCard } from '../_shared';
import { useCopyAction } from './hooks/useCopyAction';
import type { ExtractField } from './types';

export type ExtractToolShellProps = {
    tool: ToolDefinition;
    extract: (input: { text?: string; file?: File }) => ExtractField[] | Promise<ExtractField[]>;
    mode?: 'text' | 'file' | 'both';
    accept?: string;
    placeholder?: string;
    submitLabel?: string;
    emptyHint?: string;
};

export function ExtractToolShell({
    tool,
    extract,
    mode = 'both',
    accept,
    placeholder = 'Text hier einfügen …',
    submitLabel = 'Auslesen',
    emptyHint = 'Noch keine Daten — Datei oder Text eingeben.',
}: ExtractToolShellProps) {
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [fields, setFields] = useState<ExtractField[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { copyText } = useCopyAction();

    const showText = mode === 'text' || mode === 'both';
    const showFile = mode === 'file' || mode === 'both';

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!text.trim() && !file) return;
        setLoading(true);
        setError(null);
        try {
            const next = await extract({
                text: text.trim() || undefined,
                file: file ?? undefined,
            });
            setFields(next);
        } catch (err) {
            setFields(null);
            setError(err instanceof Error ? err.message : 'Auslesen fehlgeschlagen.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6">
            <form onSubmit={onSubmit} className="space-y-3">
                {showFile ? (
                    <div>
                        <label
                            htmlFor={`${tool.id}-file`}
                            className="mb-1 block font-display text-[12px] font-bold uppercase tracking-[0.05em]"
                        >
                            Datei
                        </label>
                        <input
                            id={`${tool.id}-file`}
                            type="file"
                            accept={accept}
                            className="ms-input py-2"
                            onChange={(e) => {
                                setFile(e.target.files?.[0] ?? null);
                                setFields(null);
                            }}
                        />
                    </div>
                ) : null}

                {showText ? (
                    <div>
                        <label
                            htmlFor={`${tool.id}-text`}
                            className="mb-1 block font-display text-[12px] font-bold uppercase tracking-[0.05em]"
                        >
                            Text
                        </label>
                        <textarea
                            id={`${tool.id}-text`}
                            className="ms-input min-h-[140px] resize-y py-3 font-mono text-[13px] leading-relaxed"
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                setFields(null);
                            }}
                            placeholder={placeholder}
                        />
                    </div>
                ) : null}

                <button type="submit" className="ms-btn-primary h-[44px]" disabled={loading}>
                    {loading ? 'Lese aus …' : submitLabel}
                </button>
            </form>

            {error ? (
                <ResultCard tone="danger" heading="Fehler">
                    <p className="text-[14px] font-medium">{error}</p>
                </ResultCard>
            ) : null}

            {fields ? (
                fields.length === 0 ? (
                    <ResultCard tone="warn" heading="Nichts gefunden">
                        <p className="text-[14px]">{emptyHint}</p>
                    </ResultCard>
                ) : (
                    <ResultCard tone="success" heading="Gefundene Felder">
                        <div className="space-y-2">
                            {fields.map((field) => (
                                <div
                                    key={field.id}
                                    className="flex flex-col gap-2 rounded-md border-2 border-black bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <p className="font-display text-[11px] font-bold tracking-[0.05em] uppercase text-[var(--color-ink-soft)]">
                                            {field.label}
                                        </p>
                                        <p
                                            className={`mt-1 break-all text-[14px] leading-tight ${
                                                field.mono ? 'font-mono' : ''
                                            }`}
                                        >
                                            {field.value}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="ms-btn shrink-0"
                                        onClick={() =>
                                            void copyText(field.value, `${field.label} kopiert.`)
                                        }
                                    >
                                        Kopieren
                                    </button>
                                </div>
                            ))}
                        </div>
                    </ResultCard>
                )
            ) : null}
        </div>
    );
}
