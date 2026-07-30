import { useEffect, useState } from 'react';
import type { ToolDefinition } from '../../../data/catalog/types';
import { consumeToolFilePrefill } from '../../../assistant/tool-prefill';
import { FlowBoundChip } from '../../../flow/FlowBoundChip';
import { useFlowContext } from '../../../flow/FlowContextProvider';
import { useFlowSession } from '../../../flow/FlowWorkspace';
import { chipLabelFromSlot, decodeFile, decodeText } from '../../../flow/slot-codec';
import { useFlowInput } from '../../../flow/useFlowInput';
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
    /** Binding key for file/source — default `source` */
    sourceInputKey?: string;
    /** Binding key for text — default `text` */
    textInputKey?: string;
};

export function ExtractToolShell({
    tool,
    extract,
    mode = 'both',
    accept,
    placeholder = 'Text hier einfügen …',
    submitLabel = 'Auslesen',
    emptyHint = 'Noch keine Daten — Datei oder Text eingeben.',
    sourceInputKey = 'source',
    textInputKey = 'text',
}: ExtractToolShellProps) {
    const fileInput = useFlowInput(tool.id, sourceInputKey, decodeFile);
    const textInput = useFlowInput(tool.id, textInputKey, decodeText);
    const ctx = useFlowContext();
    const flowSession = useFlowSession();

    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(() => consumeToolFilePrefill(tool.id));
    const [fields, setFields] = useState<ExtractField[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { copyText } = useCopyAction();

    const showText = mode === 'text' || mode === 'both';
    const showFile = mode === 'file' || mode === 'both';

    const fileFromFlow = fileInput.source === 'flow' ? fileInput.value : null;
    const textFromFlow = textInput.source === 'flow' ? textInput.value : null;
    const effectiveFile = fileFromFlow ?? file ?? (fileInput.source === 'local' ? fileInput.value : null);
    const effectiveText = textFromFlow ?? text;

    const hideFileControl = fileInput.source === 'flow';
    const hideTextControl = textInput.source === 'flow';

    useEffect(() => {
        if (!file || fileFromFlow) return;
        if (fileInput.source === 'local' && !fileInput.value) {
            fileInput.setValue(file);
        }
    }, [file, fileFromFlow, fileInput]);

    useEffect(() => {
        if (!fileFromFlow && !textFromFlow) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        void Promise.resolve(
            extract({
                text: textFromFlow?.trim() || undefined,
                file: fileFromFlow ?? undefined,
            }),
        )
            .then((next) => {
                if (!cancelled) {
                    setFields(next);
                    if (next.length > 0) flowSession?.reportToolSuccess(tool.id);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setFields(null);
                    setError(err instanceof Error ? err.message : 'Auslesen fehlgeschlagen.');
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [extract, fileFromFlow, flowSession, textFromFlow, tool.id]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!effectiveText.trim() && !effectiveFile) return;
        setLoading(true);
        setError(null);
        try {
            const next = await extract({
                text: effectiveText.trim() || undefined,
                file: effectiveFile ?? undefined,
            });
            setFields(next);
            if (next.length > 0) flowSession?.reportToolSuccess(tool.id);
        } catch (err) {
            setFields(null);
            setError(err instanceof Error ? err.message : 'Auslesen fehlgeschlagen.');
        } finally {
            setLoading(false);
        }
    }

    function onFileChange(next: File | null) {
        setFile(next);
        setFields(null);
        if (fileInput.source === 'local') {
            fileInput.setValue(next);
        }
    }

    function onTextChange(next: string) {
        setText(next);
        setFields(null);
        if (textInput.source === 'local') {
            textInput.setValue(next.trim().length > 0 ? next : null);
        }
    }

    const fileChipLabel =
        fileInput.source === 'flow'
            ? (() => {
                  const raw = ctx?.getSlot(fileInput.slotId) ?? null;
                  return raw ? chipLabelFromSlot(raw) : fileInput.value.name;
              })()
            : '';

    const textChipLabel =
        textInput.source === 'flow'
            ? (() => {
                  const raw = ctx?.getSlot(textInput.slotId) ?? null;
                  return raw ? chipLabelFromSlot(raw) : textInput.value;
              })()
            : '';

    const needsLocalForm = (showFile && !hideFileControl) || (showText && !hideTextControl);

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6">
            {hideFileControl ? (
                <FlowBoundChip label={fileChipLabel} onEdit={fileInput.editInFlow} />
            ) : null}
            {hideTextControl ? (
                <FlowBoundChip label={textChipLabel} onEdit={textInput.editInFlow} />
            ) : null}

            {needsLocalForm ? (
                <form onSubmit={onSubmit} className="space-y-3" data-flow-source="local">
                    {showFile && !hideFileControl ? (
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
                                data-testid="extract-file-input"
                                onChange={(e) => {
                                    onFileChange(e.target.files?.[0] ?? null);
                                }}
                            />
                        </div>
                    ) : null}

                    {showText && !hideTextControl ? (
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
                                data-testid="extract-text-input"
                                onChange={(e) => onTextChange(e.target.value)}
                                placeholder={placeholder}
                            />
                        </div>
                    ) : null}

                    <button type="submit" className="ms-btn-primary h-[44px]" disabled={loading}>
                        {loading ? 'Lese aus …' : submitLabel}
                    </button>
                </form>
            ) : loading ? (
                <p className="ms-pulse text-[14px] font-semibold">Lese aus …</p>
            ) : null}

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
