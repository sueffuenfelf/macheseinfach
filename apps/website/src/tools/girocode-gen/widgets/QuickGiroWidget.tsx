import { useState } from 'react';
import { validateIban } from '../../../lib/iban';
import { parseGermanNumber } from '../../../lib/format';
import { buildEpcPayload, generateQrDataUrl } from '../../../lib/qr';
import type { WidgetComponentProps } from '../../../shell/widgets/types';
import { WidgetCard } from '../../_shared/widgets/WidgetCard';

export function QuickGiroWidget({ embedded }: WidgetComponentProps) {
    const [name, setName] = useState('');
    const [iban, setIban] = useState('');
    const [amount, setAmount] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const ready = name.trim().length > 1 && validateIban(iban).ok && parseGermanNumber(amount) > 0;

    async function createQr() {
        if (!ready) return;
        const payload = buildEpcPayload({
            name: name.trim(),
            iban: iban.trim(),
            amount: parseGermanNumber(amount),
            purpose: 'Widget',
        });
        setImage(await generateQrDataUrl(payload, 150));
    }

    return (
        <WidgetCard title="GiroCode Mini" embedded={embedded}>
            <div className="space-y-2">
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Empfaenger" className="ms-input min-h-11 text-[12px] sm:min-h-0" />
                <input value={iban} onChange={(event) => setIban(event.target.value)} placeholder="IBAN" className="ms-input min-h-11 font-mono text-[12px] sm:min-h-0" />
                <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="149,90" className="ms-input min-h-11 text-[12px] sm:min-h-0" />
                <button type="button" className="ms-btn min-h-11 w-full py-1 text-[12px] sm:min-h-0" disabled={!ready} onClick={() => void createQr()}>
                    QR erzeugen
                </button>
                <div className="grid min-h-[6.5rem] place-items-center rounded-[8px] border-2 border-black bg-[var(--color-chip)]">
                    {image ? <img src={image} alt="GiroCode Vorschau" className="h-full max-h-[6.25rem] w-full max-w-[6.25rem] object-contain p-1" /> : <span className="text-[11px]">Noch kein QR</span>}
                </div>
            </div>
        </WidgetCard>
    );
}
