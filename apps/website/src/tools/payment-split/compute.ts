import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

/** Split total into N cent-exact parts; remainder cents go to first payments. */
export function splitPaymentAmount(total: number, count: number): number[] {
    const totalCents = Math.round(total * 100);
    const baseCents = Math.floor(totalCents / count);
    const remainder = totalCents - baseCents * count;
    return Array.from({ length: count }, (_, i) => (baseCents + (i < remainder ? 1 : 0)) / 100);
}

/** Betrag auf N Teilzahlungen aufteilen. */
export function computePaymentSplit(values: FieldValues): CalcResult {
    const amount = parseFieldNumber(values.amount ?? '');
    if (amount === null || amount <= 0) {
        return {
            rows: [],
            error: 'Bitte einen gültigen Betrag größer als 0 eingeben (z. B. 1.200,00).',
        };
    }

    const count = parseFieldNumber(values.count ?? '');
    if (count === null || count < 2 || !Number.isInteger(count) || count > 99) {
        return {
            rows: [],
            error: 'Bitte eine Anzahl zwischen 2 und 99 Teilzahlungen eingeben.',
        };
    }

    const parts = splitPaymentAmount(amount, count);
    const sum = parts.reduce((acc, p) => acc + p, 0);

    return {
        tone: 'info',
        heading: `${count} Teilzahlungen`,
        rows: [
            { label: 'Gesamtbetrag', value: formatEuro(amount) },
            ...parts.map((part, index) => ({
                label: `Rate ${index + 1}`,
                value: formatEuro(part),
            })),
            { label: 'Summe', value: formatEuro(Math.round(sum * 100) / 100) },
        ],
        hint: 'Cent-Reste werden auf die ersten Raten verteilt — Summe entspricht dem Gesamtbetrag.',
    };
}
