import { useEffect, useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { formatIban, ibanCountryName, validateIban, type IbanResult } from '../../lib/iban';
import { InfoGrid, ResultCard } from '../_shared/_shared';

type IbanCheckToolProps = {
    tool: Tool;
};

const ERROR_TEXT: Record<'format' | 'length' | 'checksum' | 'country', string> = {
    format: 'Das Format passt nicht zu einer gültigen IBAN.',
    length: 'Die Länge stimmt für dieses Land nicht.',
    checksum: 'Die Prüfsumme ist falsch.',
    country: 'Dieses Länderkürzel wird aktuell nicht unterstützt.',
};

export function IbanCheckTool({ tool }: IbanCheckToolProps) {
    const [value, setValue] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [result, setResult] = useState<IbanResult | null>(null);
    const timerRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        inputRef.current?.focus();
        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, []);

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const next = value.trim();
        if (!next) return;
        if (timerRef.current) window.clearTimeout(timerRef.current);
        setIsChecking(true);
        timerRef.current = window.setTimeout(() => {
            setResult(validateIban(next));
            setIsChecking(false);
        }, 500);
    }

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6">
            <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="w-full">
                    <label htmlFor={`${tool.id}-input`} className="mb-1 block font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                        IBAN
                    </label>
                    <input
                        ref={inputRef}
                        id={`${tool.id}-input`}
                        className="ms-input font-mono [font-variant-numeric:tabular-nums]"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="DE89 3704 0044 0532 0130 00"
                    />
                </div>
                <button type="submit" className="ms-btn-primary h-[44px] sm:min-w-[130px]">
                    Prüfen
                </button>
            </form>

            {isChecking ? <p className="ms-pulse text-[14px] font-semibold">Prüfe …</p> : null}

            {result?.ok ? (
                <ResultCard
                    tone="success"
                    heading={
                        <span className="inline-flex items-center gap-2">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#000" strokeWidth="2.5">
                                <path d="M5 13l4 4L19 7" />
                            </svg>
                            Gültige IBAN
                        </span>
                    }
                >
                    <p className="text-[14px] font-medium">Geprüft: {formatIban(result.iban)}</p>
                    <InfoGrid
                        items={[
                            { label: 'Bank', value: result.bank },
                            { label: 'BIC', value: result.bic },
                            { label: 'Land', value: ibanCountryName(result.country) },
                            { label: 'Prüfsumme', value: 'Korrekt' },
                        ]}
                    />
                </ResultCard>
            ) : null}

            {result && !result.ok ? (
                <ResultCard tone="danger" heading="Ungültige IBAN">
                    <p className="text-[14px]">
                        Geprüft: <span className="font-mono">{formatIban(result.iban)}</span>
                    </p>
                    <p className="font-medium text-[var(--color-danger-ink)]">{ERROR_TEXT[result.reason]}</p>
                </ResultCard>
            ) : null}
        </div>
    );
}
