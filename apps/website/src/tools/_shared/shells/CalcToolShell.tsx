import { useCallback, useState } from 'react';
import type { ToolDefinition } from '../../../data/catalog/types';
import { InfoGrid, ResultCard } from '../_shared';
import { FieldRenderer } from './fields';
import { useLiveCompute } from './hooks/useLiveCompute';
import { defaultsFromFields } from './parse';
import type { CalcResult, FieldDef, FieldValues } from './types';

export type CalcToolShellProps = {
    tool: ToolDefinition;
    fields: readonly FieldDef[];
    compute: (values: FieldValues) => CalcResult;
    /** Debounce for live compute (ms). Default 180. */
    debounceMs?: number;
    /** Optional intro above the form */
    intro?: string;
};

export function CalcToolShell({
    tool,
    fields,
    compute,
    debounceMs = 180,
    intro,
}: CalcToolShellProps) {
    const [values, setValues] = useState<FieldValues>(() => defaultsFromFields(fields));

    const setField = useCallback((id: string, next: string) => {
        setValues((prev) => ({ ...prev, [id]: next }));
    }, []);

    const result = useLiveCompute(values, compute, debounceMs);
    const hasInput = Object.values(values).some((v) => v.trim().length > 0);

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6">
            {intro ? (
                <p className="text-[14px] leading-snug text-[var(--color-ink-soft)]">{intro}</p>
            ) : null}

            <div className="space-y-3">
                {fields.map((field) => (
                    <FieldRenderer
                        key={field.id}
                        field={field}
                        value={values[field.id] ?? ''}
                        onChange={(next) => setField(field.id, next)}
                        idPrefix={tool.id}
                    />
                ))}
            </div>

            {!hasInput ? (
                <p className="text-[13px] text-[var(--color-ink-soft)]">
                    Ergebnis erscheint live, sobald du Werte eingibst.
                </p>
            ) : null}

            {hasInput && result.error ? (
                <ResultCard tone="danger" heading="Eingabe prüfen">
                    <p className="text-[14px] font-medium">{result.error}</p>
                </ResultCard>
            ) : null}

            {hasInput && !result.error && result.rows.length > 0 ? (
                <ResultCard tone={result.tone ?? 'info'} heading={result.heading ?? 'Ergebnis'}>
                    <InfoGrid items={result.rows} />
                    {result.hint ? (
                        <p className="text-[13px] leading-snug text-[var(--color-ink-soft)]">
                            {result.hint}
                        </p>
                    ) : null}
                </ResultCard>
            ) : null}
        </div>
    );
}
