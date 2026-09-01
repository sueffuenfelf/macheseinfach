import { useCallback, useEffect, useState } from 'react';
import type { ToolDefinition } from '../../../data/catalog/types';
import { fieldDefaultsWithPrefill } from '../../../assistant/tool-prefill';
import { FieldRenderer } from './fields';
import { useCopyAction } from './hooks/useCopyAction';
import type { FieldDef, FieldValues, GenerateOutput } from './types';

export type GenerateToolShellProps = {
    tool: ToolDefinition;
    fields: readonly FieldDef[];
    generate: (values: FieldValues) => GenerateOutput | Promise<GenerateOutput>;
    /** Gate generation — default: all fields non-empty */
    isReady?: (values: FieldValues) => boolean;
    outputTitle?: string;
    emptyHint?: string;
};

function defaultIsReady(values: FieldValues): boolean {
    return Object.values(values).every((v) => v.trim().length > 0);
}

export function GenerateToolShell({
    tool,
    fields,
    generate,
    isReady = defaultIsReady,
    outputTitle = 'Ausgabe',
    emptyHint = 'Fülle das Formular aus — die Ausgabe erscheint hier.',
}: GenerateToolShellProps) {
    const [localValues, setLocalValues] = useState<FieldValues>(() =>
        fieldDefaultsWithPrefill(tool.id, fields),
    );
    const values = localValues;
    const [output, setOutput] = useState<GenerateOutput>(null);
    const [loading, setLoading] = useState(false);
    const { copyText, downloadAsText, downloadAsDataUrl } = useCopyAction();

    const setField = useCallback((id: string, next: string) => {
        setLocalValues((prev) => ({ ...prev, [id]: next }));
    }, []);

    const ready = isReady(values);

    useEffect(() => {
        if (!ready) {
            setOutput(null);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        void Promise.resolve(generate(values))
            .then((next) => {
                if (!cancelled) {
                    setOutput(next);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [generate, ready, values]);

    return (
        <div className="ms-animate-fade mx-auto grid w-full max-w-3xl gap-5 px-4 py-6 md:grid-cols-[1.2fr_1fr] md:px-6">
            <section className="space-y-3">
                {fields.map((field) => (
                    <FieldRenderer
                        key={field.id}
                        field={field}
                        value={localValues[field.id] ?? ''}
                        onChange={(next) => setField(field.id, next)}
                        idPrefix={tool.id}
                    />
                ))}
            </section>

            <aside
                className="rounded-xl border-2 border-black bg-[#ff90e8] p-4 shadow-brutal-lg md:p-5"
                aria-busy={loading}
            >
                <p className="font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                    {outputTitle}
                </p>
                <div className="mt-3 flex min-h-[220px] items-center justify-center rounded-lg border-2 border-black bg-white p-3">
                    {loading ? (
                        <div className="ms-pulse text-center text-[13px] font-semibold">
                            Wird erzeugt …
                        </div>
                    ) : output?.kind === 'qr' ? (
                        <img
                            src={output.dataUrl}
                            alt={`${tool.title} Vorschau`}
                            className="h-[220px] w-[220px]"
                        />
                    ) : output?.kind === 'text' || output?.kind === 'code' ? (
                        <pre className="max-h-[280px] w-full overflow-auto whitespace-pre-wrap break-all font-mono text-[12px] leading-relaxed">
                            {output.content}
                        </pre>
                    ) : (
                        <p className="text-center text-[13px] font-semibold text-[var(--color-ink-soft)]">
                            {emptyHint}
                        </p>
                    )}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                    {output?.kind === 'text' || output?.kind === 'code' ? (
                        <>
                            <button
                                type="button"
                                className="ms-btn-primary w-full"
                                onClick={() => void copyText(output.content)}
                            >
                                Kopieren
                            </button>
                            {output.filename ? (
                                <button
                                    type="button"
                                    className="ms-btn w-full"
                                    onClick={() => {
                                        const filename = output.filename;
                                        if (!filename) return;
                                        downloadAsText(output.content, filename);
                                    }}
                                >
                                    Herunterladen
                                </button>
                            ) : null}
                        </>
                    ) : null}
                    {output?.kind === 'qr' ? (
                        <button
                            type="button"
                            className="ms-btn-primary w-full"
                            onClick={() =>
                                downloadAsDataUrl(
                                    output.dataUrl,
                                    output.filename ?? 'qr-code.png',
                                    'PNG wurde heruntergeladen.',
                                )
                            }
                        >
                            Als PNG herunterladen
                        </button>
                    ) : null}
                </div>
            </aside>
        </div>
    );
}
