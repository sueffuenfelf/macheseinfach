import { useEffect, useState } from 'react';
import { generateQrDataUrl } from '../../../lib/qr';
import type { WidgetComponentProps } from '../../../shell/widgets/types';
import { WidgetCard } from '../../_shared/widgets/WidgetCard';

export function QuickQrWidget({
    embedded,
    sharedInput = '',
    useSharedInput = false,
    linkedInput = '',
    onEmitLinkValue,
}: WidgetComponentProps) {
    const [text, setText] = useState('https://macheseinfa.ch');
    const [image, setImage] = useState<string | null>(null);
    const linkedValue = linkedInput
        .split('\n')
        .map((entry) => entry.trim())
        .find((entry) => entry.length > 0);
    const linkedFromWorkspace = useSharedInput && sharedInput.trim().length > 0;
    const linked = Boolean(linkedValue) || linkedFromWorkspace;
    const effectiveText = linkedValue ?? (linkedFromWorkspace ? sharedInput : text);

    useEffect(() => {
        if (useSharedInput) setText(sharedInput);
    }, [sharedInput, useSharedInput]);

    useEffect(() => {
        onEmitLinkValue?.('value', effectiveText);
        onEmitLinkValue?.('status', image ? 'QR erzeugt' : '');
    }, [effectiveText, image, onEmitLinkValue]);

    useEffect(() => {
        const value = effectiveText.trim();
        if (!value) {
            setImage(null);
            return;
        }
        let cancelled = false;
        const timer = window.setTimeout(
            () => {
                void generateQrDataUrl(value, 128).then((url) => {
                    if (!cancelled) setImage(url);
                });
            },
            linked ? 0 : 280,
        );
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [effectiveText, linked]);

    return (
        <WidgetCard title="QR Mini" embedded={embedded}>
            <div className={`widget-qr${linked ? ' widget-qr--linked' : ''}`}>
                <div className="widget-qr__rows">
                    {!linked ? (
                        <div className="widget-qr__row widget-qr__row--controls">
                            <div className="widget-qr__controls widget-no-drag">
                                <input
                                    value={effectiveText}
                                    onChange={(event) => setText(event.target.value)}
                                    placeholder="URL oder Text"
                                    className="widget-qr__input ms-input"
                                />
                                <button
                                    type="button"
                                    className="widget-qr__generate ms-btn"
                                    aria-label="QR-Code erzeugen"
                                    disabled={!effectiveText.trim()}
                                    onClick={() => {
                                        const value = effectiveText.trim();
                                        if (!value) return;
                                        void generateQrDataUrl(value, 128).then(setImage);
                                    }}
                                >
                                    <span className="widget-qr__generate-label widget-qr__generate-label--full">
                                        QR erzeugen
                                    </span>
                                    <span
                                        className="widget-qr__generate-label widget-qr__generate-label--short"
                                        aria-hidden
                                    >
                                        QR
                                    </span>
                                </button>
                            </div>
                        </div>
                    ) : null}
                    <div className="widget-qr__row widget-qr__row--preview">
                        <div className="widget-qr__preview">
                            {image ? (
                                <img src={image} alt="QR Vorschau" className="widget-qr__image" />
                            ) : (
                                <span className="widget-qr__placeholder widget-qr__placeholder--decorative">
                                    {linked ? 'Gemeinsame Eingabe leer' : 'Noch kein QR'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </WidgetCard>
    );
}
