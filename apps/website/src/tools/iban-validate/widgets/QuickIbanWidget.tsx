import { useEffect, useMemo, useState } from 'react';
import { validateIban } from '../../../lib/iban';
import type { WidgetComponentProps } from '../../../shell/widgets/types';
import { WidgetCard } from '../../_shared/widgets/WidgetCard';

export function QuickIbanWidget({
    embedded,
    sharedInput = '',
    useSharedInput = false,
    linkedInput = '',
    onEmitLinkValue,
}: WidgetComponentProps) {
    const [input, setInput] = useState('');
    const linkedValue = linkedInput
        .split('\n')
        .map((entry) => entry.trim())
        .find((entry) => entry.length > 0);
    const linkedFromWorkspace = useSharedInput && sharedInput.trim().length > 0;
    const linked = Boolean(linkedValue) || linkedFromWorkspace;
    const effectiveInput = linkedValue ?? (linkedFromWorkspace ? sharedInput : input);

    useEffect(() => {
        if (useSharedInput) setInput(sharedInput);
    }, [sharedInput, useSharedInput]);

    const result = useMemo(
        () => (effectiveInput.trim() ? validateIban(effectiveInput) : null),
        [effectiveInput],
    );
    const state = !effectiveInput.trim() ? null : result?.ok ? 'ok' : 'bad';

    const statusText =
        state === null
            ? 'Prueft lokal ohne Netzwerkzugriff.'
            : state === 'ok'
              ? 'Gueltige IBAN.'
              : 'IBAN ist ungueltig.';

    useEffect(() => {
        onEmitLinkValue?.('value', effectiveInput);
        onEmitLinkValue?.('status', state === null ? '' : statusText);
    }, [effectiveInput, onEmitLinkValue, state, statusText]);

    return (
        <WidgetCard title="IBAN Quick Check" embedded={embedded}>
            <div className={`widget-iban${linked ? ' widget-iban--linked' : ''}`}>
                <div className="widget-iban__rows">
                    {!linked ? (
                        <div className="widget-iban__row widget-iban__row--input">
                            <input
                                value={effectiveInput}
                                onChange={(event) => setInput(event.target.value)}
                                placeholder="DE89 3704 0044 0532 0130 00"
                                className="widget-iban__input widget-no-drag ms-input font-mono"
                            />
                        </div>
                    ) : null}
                    <div className="widget-iban__row widget-iban__row--status">
                        <p
                            className={`widget-iban__status${
                                state === null ? ' widget-iban__status--decorative' : ''
                            }${state === 'ok' ? ' widget-iban__status--ok' : ''}${
                                state === 'bad' ? ' widget-iban__status--bad' : ''
                            }`}
                            aria-live="polite"
                        >
                            {linked && state === null ? 'Gemeinsame Eingabe leer' : statusText}
                        </p>
                    </div>
                </div>
            </div>
        </WidgetCard>
    );
}
