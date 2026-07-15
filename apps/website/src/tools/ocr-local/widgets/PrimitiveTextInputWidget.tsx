import { useEffect, useState } from 'react';
import type { WidgetComponentProps } from '../../../shell/widgets/types';
import { WidgetCard } from '../../_shared/widgets/WidgetCard';

export function PrimitiveTextInputWidget({
    embedded,
    linkedInput = '',
    onEmitLinkValue,
}: WidgetComponentProps) {
    const [value, setValue] = useState('');
    const linkedValue = linkedInput
        .split('\n')
        .map((entry) => entry.trim())
        .find((entry) => entry.length > 0);
    const effectiveValue = linkedValue ?? value;

    useEffect(() => {
        onEmitLinkValue?.('text', effectiveValue);
        onEmitLinkValue?.('value', effectiveValue);
        onEmitLinkValue?.('status', effectiveValue ? 'Text gesetzt' : '');
    }, [effectiveValue, onEmitLinkValue]);

    return (
        <WidgetCard title="Textfeld" embedded={embedded}>
            <div className="widget-primitive-text">
                <div className="widget-primitive-text__rows">
                    <div className="widget-primitive-text__row widget-primitive-text__row--input">
                        <textarea
                            value={effectiveValue}
                            onChange={(event) => setValue(event.target.value)}
                            placeholder="Freier Text, URL, Notiz, Prompt …"
                            className="ms-input widget-primitive-text__input"
                            disabled={Boolean(linkedValue)}
                        />
                    </div>
                    <div className="widget-primitive-text__row widget-primitive-text__row--meta">
                        <p className="widget-primitive-text__meta">
                            {linkedValue
                                ? 'Eingang ist verknüpft.'
                                : `${effectiveValue.length} Zeichen`}
                        </p>
                    </div>
                </div>
            </div>
        </WidgetCard>
    );
}
