import { useCallback, useEffect, useRef, useState } from 'react';
import type { ToolDefinition } from '../../../data/catalog/types';
import { fieldDefaultsWithPrefill } from '../../../assistant/tool-prefill';
import { InfoGrid, ResultCard } from '../_shared';
import { FieldRenderer } from './fields';
import type { CheckResult, FieldDef, FieldValues } from './types';

export type CheckToolShellProps = {
    tool: ToolDefinition;
    fields: readonly FieldDef[];
    check: (values: FieldValues) => CheckResult | Promise<CheckResult>;
    /** Default: „Prüfen“ */
    submitLabel?: string;
    /** When true, check runs debounced on change (no submit needed). */
    autoCheck?: boolean;
    autoCheckDelayMs?: number;
    /** Trust / network note below the form */
    trustNote?: string;
};

export function CheckToolShell({
    tool,
    fields,
    check,
    submitLabel = 'Prüfen',
    autoCheck = false,
    autoCheckDelayMs = 500,
    trustNote,
}: CheckToolShellProps) {
    const [localValues, setLocalValues] = useState<FieldValues>(() =>
        fieldDefaultsWithPrefill(tool.id, fields),
    );
    const values = localValues;
    const [isChecking, setIsChecking] = useState(false);
    const [result, setResult] = useState<CheckResult | null>(null);
    const timerRef = useRef<number | null>(null);
    const requestId = useRef(0);

    const setField = useCallback(
        (id: string, next: string) => {
            setLocalValues((prev) => ({ ...prev, [id]: next }));
            if (!autoCheck) setResult(null);
        },
        [autoCheck],
    );

    const runCheck = useCallback(
        async (nextValues: FieldValues) => {
            const hasValue = Object.values(nextValues).some((v) => v.trim().length > 0);
            if (!hasValue) {
                setResult(null);
                setIsChecking(false);
                return;
            }
            const id = ++requestId.current;
            setIsChecking(true);
            try {
                const next = await check(nextValues);
                if (id === requestId.current) {
                    setResult(next);
                }
            } finally {
                if (id === requestId.current) setIsChecking(false);
            }
        },
        [check],
    );

    useEffect(() => {
        if (!autoCheck) return;
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
            void runCheck(values);
        }, autoCheckDelayMs);
        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, [autoCheck, autoCheckDelayMs, runCheck, values]);

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (timerRef.current) window.clearTimeout(timerRef.current);
        void runCheck(values);
    }

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6">
            <form onSubmit={onSubmit} className="space-y-3">
                {fields.map((field) => (
                    <FieldRenderer
                        key={field.id}
                        field={field}
                        value={localValues[field.id] ?? ''}
                        onChange={(next) => setField(field.id, next)}
                        idPrefix={tool.id}
                    />
                ))}
                {!autoCheck ? (
                    <button
                        type="submit"
                        className="ms-btn-primary h-[44px] w-full sm:w-auto sm:min-w-[130px]"
                    >
                        {submitLabel}
                    </button>
                ) : null}
            </form>

            {trustNote ? (
                <p className="text-[12.5px] text-[var(--color-ink-soft)]">{trustNote}</p>
            ) : null}

            {isChecking ? <p className="ms-pulse text-[14px] font-semibold">Prüfe …</p> : null}

            {result ? (
                <ResultCard tone={result.tone} heading={result.heading}>
                    {result.summary ? (
                        <p className="text-[14px] font-medium">{result.summary}</p>
                    ) : null}
                    {result.message ? (
                        <p
                            className={
                                result.ok
                                    ? 'text-[14px]'
                                    : 'font-medium text-[var(--color-danger-ink)]'
                            }
                        >
                            {result.message}
                        </p>
                    ) : null}
                    {result.details?.length ? <InfoGrid items={result.details} /> : null}
                </ResultCard>
            ) : null}
        </div>
    );
}
