import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldCurrency, parseFieldNumber } from '../_shared/shells';

function formatEuro(amount: number): string {
    return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

/** Vertragsstrafe grob: Auftragswert × Prozentsatz + Plausibilitätshinweis. */
export function computeContractPenaltyHint(values: FieldValues): CalcResult {
    const value = parseFieldCurrency(values.contractValue ?? '');
    if (value === null || value <= 0) {
        return { rows: [], error: 'Bitte einen gültigen Auftragswert eingeben.' };
    }

    const percent = parseFieldNumber(values.penaltyPercent ?? '');
    if (percent === null || percent <= 0 || percent > 100) {
        return { rows: [], error: 'Bitte einen Prozentsatz zwischen 0 und 100 eingeben.' };
    }

    const penalty = (value * percent) / 100;
    let tone: CalcResult['tone'] = 'info';
    let plausibility = 'Im üblichen Rahmen — trotzdem Vertrag prüfen.';
    if (percent > 15) {
        tone = 'danger';
        plausibility = 'Hoch — Vertragsstrafe kann unwirksam oder reduzierbar sein.';
    } else if (percent > 10) {
        tone = 'warn';
        plausibility = 'Erhöht — Gerichte prüfen Angemessenheit streng.';
    }

    return {
        tone,
        heading: 'Vertragsstrafe (grob)',
        rows: [
            { label: 'Auftragswert', value: formatEuro(value) },
            { label: 'Vertragsstrafe', value: `${percent.toLocaleString('de-DE')}\u00a0%` },
            { label: 'Betrag (ca.)', value: formatEuro(penalty) },
            { label: 'Einschätzung', value: plausibility },
        ],
        hint: 'Keine Rechtsberatung — nur grobe Orientierung. Wirksamkeit hängt vom Einzelfall ab.',
    };
}
