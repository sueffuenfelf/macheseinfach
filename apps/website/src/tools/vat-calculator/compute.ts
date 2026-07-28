import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

export type VatMode = 'gross-to-net' | 'net-to-gross';

function roundCents(n: number): number {
    return Math.round(n * 100) / 100;
}

/** Pure MwSt compute for CalcToolShell. */
export function computeVat(values: FieldValues): CalcResult {
    const amount = parseFieldNumber(values.amount ?? '');
    if (amount === null || amount < 0) {
        return {
            rows: [],
            error: 'Bitte einen gültigen Betrag eingeben (z. B. 119,00).',
        };
    }

    const ratePct = Number(values.rate ?? '19');
    if (![7, 19].includes(ratePct)) {
        return { rows: [], error: 'Unbekannter MwSt-Satz.' };
    }

    const mode = (values.mode ?? 'gross-to-net') as VatMode;
    const factor = ratePct / 100;

    let net: number;
    let gross: number;
    let vat: number;

    if (mode === 'gross-to-net') {
        gross = amount;
        net = roundCents(gross / (1 + factor));
        vat = roundCents(gross - net);
    } else {
        net = amount;
        vat = roundCents(net * factor);
        gross = roundCents(net + vat);
    }

    return {
        tone: 'info',
        heading: mode === 'gross-to-net' ? 'Brutto → Netto' : 'Netto → Brutto',
        rows: [
            { label: 'Netto', value: formatEuro(net) },
            { label: 'MwSt', value: formatEuro(vat) },
            { label: 'Brutto', value: formatEuro(gross) },
        ],
        hint: `Satz ${ratePct} % · nur zur Orientierung, kein Steuerbescheid.`,
    };
}
