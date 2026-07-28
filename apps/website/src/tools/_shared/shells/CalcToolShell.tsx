import { useCallback, useEffect, useState } from 'react';
import type { ToolDefinition } from '../../../data/catalog/types';
import { fieldDefaultsWithPrefill } from '../../../assistant/tool-prefill';
import { useFlowSession } from '../../../flow/FlowWorkspace';
import { useFlowMergedFieldValues } from '../../../flow/useFlowMergedFieldValues';
import { InfoGrid, ResultCard } from '../_shared';
import { FlowAwareField } from './FlowAwareField';
import { useLiveCompute } from './hooks/useLiveCompute';
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
    const flowSession = useFlowSession();
    const [localValues, setLocalValues] = useState<FieldValues>(() =>
        fieldDefaultsWithPrefill(tool.id, fields),
    );
    const fieldIds = fields.map((f) => f.id);
    const values = useFlowMergedFieldValues(tool.id, fieldIds, localValues);

    const setField = useCallback((id: string, next: string) => {
        setLocalValues((prev) => ({ ...prev, [id]: next }));
    }, []);

    const result = useLiveCompute(values, compute, debounceMs);
    const hasInput = Object.values(values).some((v) => v.trim().length > 0);
    const success = hasInput && !result.error && result.rows.length > 0;

    useEffect(() => {
        if (success) flowSession?.reportToolSuccess(tool.id);
    }, [success, flowSession, tool.id]);

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6">
            {intro ? (
                <p className="text-[14px] leading-snug text-[var(--color-ink-soft)]">{intro}</p>
            ) : null}

            <div className="space-y-3">
                {fields.map((field) => (
                    <FlowAwareField
                        key={field.id}
                        toolId={tool.id}
                        field={field}
                        value={localValues[field.id] ?? ''}
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
