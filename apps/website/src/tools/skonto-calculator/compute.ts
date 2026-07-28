import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

function roundCents(n: number): number {
    return Math.round(n * 100) / 100;
}

/** Skontobetrag und Zahlbetrag nach Skontoabzug. */
export function computeSkonto(values: FieldValues): CalcResult {
    const amount = parseFieldNumber(values.amount ?? '');
    if (amount === null || amount < 0) {
        return {
            rows: [],
            error: 'Bitte einen gültigen Rechnungsbetrag eingeben (z. B. 1.000,00).',
        };
    }

    const ratePct = parseFieldNumber(values.rate ?? '');
    if (ratePct === null || ratePct <= 0 || ratePct > 100) {
        return {
            rows: [],
            error: 'Bitte einen gültigen Skontosatz zwischen 0 und 100 % eingeben.',
        };
    }

    const discount = roundCents(amount * (ratePct / 100));
    const payable = roundCents(amount - discount);

    return {
        tone: 'info',
        heading: 'Skonto berechnet',
        rows: [
            { label: 'Rechnungsbetrag', value: formatEuro(amount) },
            { label: 'Skontosatz', value: `${ratePct.toLocaleString('de-DE')}\u00a0%` },
            { label: 'Skontobetrag', value: formatEuro(discount) },
            { label: 'Zahlbetrag', value: formatEuro(payable) },
        ],
        hint: `${ratePct}\u00a0% Skonto auf ${formatEuro(amount)} — nur zur Orientierung.`,
    };
}
