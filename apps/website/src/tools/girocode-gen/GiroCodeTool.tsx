import { useEffect, useMemo, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { validateIban } from '../../lib/iban';
import { downloadDataUrl, parseGermanNumber } from '../../lib/format';
import { buildEpcPayload, generateQrDataUrl, type GiroCodeData } from '../../lib/qr';
import { useToast } from '../../shell/toast';

type GiroCodeToolProps = {
    tool: Tool;
};

export function GiroCodeTool({ tool }: GiroCodeToolProps) {
    const [name, setName] = useState('');
    const [iban, setIban] = useState('');
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [loadingQr, setLoadingQr] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const { toast } = useToast();

    const ibanResult = useMemo(() => {
        if (!iban.trim()) return null;
        return validateIban(iban);
    }, [iban]);

    const ibanInvalid = Boolean(iban.trim() && ibanResult && !ibanResult.ok);
    const amountValue = parseGermanNumber(amount);
    const isReady =
        name.trim().length > 1 &&
        purpose.trim().length > 1 &&
        amountValue > 0 &&
        ibanResult?.ok === true;

    useEffect(() => {
        if (!isReady) {
            setQrDataUrl(null);
            setLoadingQr(false);
            return;
        }
        const payloadData: GiroCodeData = {
            name: name.trim(),
            iban: iban.trim(),
            amount: amountValue,
            purpose: purpose.trim(),
        };
        const payload = buildEpcPayload(payloadData);
        let cancelled = false;
        setLoadingQr(true);
        void generateQrDataUrl(payload, 300)
            .then((url) => {
                if (!cancelled) setQrDataUrl(url);
            })
            .finally(() => {
                if (!cancelled) setLoadingQr(false);
            });
        return () => {
            cancelled = true;
        };
    }, [amountValue, iban, isReady, name, purpose]);

    return (
        <div className="ms-animate-fade mx-auto grid w-full max-w-3xl gap-5 px-4 py-6 md:grid-cols-[1.2fr_1fr] md:px-6">
            <section className="space-y-3">
                <div>
                    <label htmlFor="giro-name" className="mb-1 block font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                        Empfänger
                    </label>
                    <input
                        id="giro-name"
                        className="ms-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="MacheSeinfach GmbH"
                    />
                </div>
                <div>
                    <label htmlFor="giro-iban" className="mb-1 block font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                        IBAN
                    </label>
                    <input
                        id="giro-iban"
                        className="ms-input font-mono tracking-[0.04em]"
                        data-invalid={ibanInvalid}
                        value={iban}
                        onChange={(e) => setIban(e.target.value)}
                        placeholder="DE89 3704 0044 0532 0130 00"
                    />
                    {ibanInvalid ? (
                        <p className="mt-1 text-[12.5px] font-semibold text-[var(--color-danger-ink)]">
                            IBAN-Format ist ungültig. Bitte prüfen.
                        </p>
                    ) : null}
                </div>
                <div>
                    <label htmlFor="giro-amount" className="mb-1 block font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                        Betrag (€)
                    </label>
                    <input
                        id="giro-amount"
                        className="ms-input"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="149,90"
                    />
                </div>
                <div>
                    <label htmlFor="giro-purpose" className="mb-1 block font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                        Verwendungszweck
                    </label>
                    <input
                        id="giro-purpose"
                        className="ms-input"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="Rechnung 2026-014"
                    />
                </div>
            </section>

            <aside className="rounded-xl border-2 border-black bg-[#ff90e8] p-4 shadow-brutal-lg md:p-5" aria-busy={loadingQr}>
                <p className="font-display text-[12px] font-bold uppercase tracking-[0.05em]">Live-Vorschau</p>
                <div className="mt-3 flex min-h-[300px] items-center justify-center rounded-lg border-2 border-black bg-white p-3">
                    {loadingQr ? (
                        <div className="ms-pulse text-center text-[13px] font-semibold">QR-Code wird erzeugt …</div>
                    ) : qrDataUrl ? (
                        <img src={qrDataUrl} alt={`${tool.title} Vorschau`} className="h-[260px] w-[260px]" />
                    ) : (
                        <div className="text-center">
                            <div className="mx-auto grid h-[220px] w-[220px] place-items-center rounded border-2 border-black bg-[var(--color-chip)]">
                                <span className="font-display text-[13px] font-bold uppercase tracking-[0.05em]">Platzhalter-QR</span>
                            </div>
                        </div>
                    )}
                </div>
                <p className="mt-3 text-[13px] leading-snug">
                    Kamera-App scannen → Überweisung ist vorausgefüllt.
                </p>
                <button
                    type="button"
                    className="ms-btn-primary mt-4 w-full"
                    disabled={!qrDataUrl}
                    onClick={() => {
                        if (!qrDataUrl) return;
                        downloadDataUrl(qrDataUrl, 'girocode.png');
                        toast('PNG wurde heruntergeladen.');
                    }}
                >
                    Als PNG herunterladen
                </button>
            </aside>
        </div>
    );
}
