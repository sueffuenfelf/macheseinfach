import { useEffect, useState } from 'react';
import type { WidgetComponentProps } from '../../../shell/widgets/types';
import { WidgetCard } from '../../_shared/widgets/WidgetCard';

export function QuickLeakWidget({ embedded, linkedInput = '', onEmitLinkValue }: WidgetComponentProps) {
    const [value, setValue] = useState('');
    const [status, setStatus] = useState<'idle' | 'clean' | 'risk'>('idle');
    const linkedValue = linkedInput
        .split('\n')
        .map((entry) => entry.trim())
        .find((entry) => entry.length > 0);
    const effectiveValue = linkedValue ?? value;

    function runCheck() {
        if (!effectiveValue.trim()) return;
        setStatus(effectiveValue.toLowerCase().includes('test') ? 'risk' : 'clean');
    }

    useEffect(() => {
        onEmitLinkValue?.('value', effectiveValue);
        onEmitLinkValue?.(
            'status',
            status === 'idle' ? '' : status === 'clean' ? 'Keine Hinweise gefunden.' : 'Hinweise gefunden.',
        );
    }, [effectiveValue, onEmitLinkValue, status]);

    return (
        <WidgetCard title="Leak-Check" embedded={embedded}>
            <input
                type="email"
                value={effectiveValue}
                onChange={(event) => setValue(event.target.value)}
                placeholder="name@beispiel.de"
                className="ms-input min-h-11 text-[12px] sm:min-h-0"
                disabled={Boolean(linkedValue)}
            />
            <button type="button" className="ms-btn mt-2 min-h-11 w-full py-1 text-[12px] sm:min-h-0" onClick={runCheck}>
                Pruefen
            </button>
            <p className="mt-2 text-[12px] text-[var(--color-ink-soft)]">
                {status === 'idle' ? 'Schneller Risiko-Check.' : status === 'clean' ? 'Keine Hinweise gefunden.' : 'Hinweise gefunden - bitte Tool oeffnen.'}
            </p>
        </WidgetCard>
    );
}
