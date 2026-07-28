import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import { STEUERN_DISCLAIMER, roundCents } from '../_shared/steuern';

/** Betriebsausgaben-Quote: Ausgaben / Einnahmen × 100. */
export function computeExpenseRatio(values: FieldValues): CalcResult {
    const income = parseFieldNumber(values.income ?? '');
    const expenses = parseFieldNumber(values.expenses ?? '');

    if (income === null || income <= 0) {
        return { rows: [], error: 'Bitte Einnahmen / Umsatz eingeben (größer 0).' };
    }
    if (expenses === null || expenses < 0) {
        return { rows: [], error: 'Bitte Betriebsausgaben eingeben.' };
    }

    const ratio = roundCents((expenses / income) * 100);
    const surplus = roundCents(income - expenses);

    let tone: CalcResult['tone'] = 'info';
    let heading = 'Kostenquote';
    if (ratio > 80) {
        tone = 'warn';
        heading = 'Hohe Kostenquote';
    } else if (surplus < 0) {
        tone = 'danger';
        heading = 'Ausgaben übersteigen Einnahmen';
    }

    return {
        tone,
        heading,
        rows: [
            { label: 'Einnahmen', value: formatEuro(income) },
            { label: 'Betriebsausgaben', value: formatEuro(expenses) },
            { label: 'Überschuss / Fehlbetrag', value: formatEuro(surplus) },
            { label: 'Kostenquote', value: `${ratio.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}\u00a0%` },
        ],
        hint: `Reine Rechenhilfe für Freelancer-Alltag — keine Branchen-Benchmark. ${STEUERN_DISCLAIMER}`,
    };
}
