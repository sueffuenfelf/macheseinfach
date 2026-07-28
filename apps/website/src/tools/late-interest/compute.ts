import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldCurrency, parseFieldNumber } from '../_shared/shells';

function formatEuro(amount: number): string {
    return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

/** Verzugszinsen grob: Betrag × Zinssatz × Tage / 365. */
export function computeLateInterest(values: FieldValues): CalcResult {
    const amount = parseFieldCurrency(values.amount ?? '');
    if (amount === null || amount <= 0) {
        return { rows: [], error: 'Bitte einen gültigen Betrag eingeben.' };
    }

    const days = parseFieldNumber(values.days ?? '');
    if (days === null || days < 1 || !Number.isInteger(days)) {
        return { rows: [], error: 'Bitte eine gültige Anzahl Tage eingeben.' };
    }

    const rate = parseFieldNumber(values.ratePercent ?? '');
    const annualRate = rate === null ? 8.12 : rate;
    if (annualRate < 0) {
        return { rows: [], error: 'Bitte einen gültigen Zinssatz eingeben.' };
    }

    const interest = (amount * (annualRate / 100) * days) / 365;
    const total = amount + interest;

    return {
        tone: 'info',
        heading: 'Verzugszinsen (grob)',
        rows: [
            { label: 'Hauptforderung', value: formatEuro(amount) },
            { label: 'Verzugstage', value: String(days) },
            { label: 'Zinssatz p. a.', value: `${annualRate.toLocaleString('de-DE')}\u00a0%` },
            { label: 'Zinsen (ca.)', value: formatEuro(interest) },
            { label: 'Summe (ca.)', value: formatEuro(total) },
        ],
        hint: 'Vereinfachte Zinsesrechnung ohne Kalendermonats-Logik — kein Rechtsrat. Basiszins und Verbraucher/B2B können abweichen.',
    };
}
