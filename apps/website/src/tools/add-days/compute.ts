import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldDate, parseFieldNumber } from '../_shared/shells';
import {
    addDays,
    addMonths,
    formatGermanDateLong,
    formatGermanDateShort,
} from '../_shared/zeit/date';

/** Startdatum + X Tage oder Monate. */
export function computeAddDays(values: FieldValues): CalcResult {
    const start = parseFieldDate(values.start ?? '');
    if (!start) {
        return { rows: [], error: 'Bitte ein gültiges Startdatum wählen.' };
    }

    const amount = parseFieldNumber(values.amount ?? '');
    if (amount === null || !Number.isInteger(amount)) {
        return { rows: [], error: 'Bitte eine ganze Zahl eingeben (z. B. 14 oder -1).' };
    }

    const unit = values.unit ?? 'days';
    const result = unit === 'months' ? addMonths(start, amount) : addDays(start, amount);

    return {
        tone: 'info',
        heading: 'Zieldatum berechnet',
        rows: [
            { label: 'Startdatum', value: formatGermanDateShort(start) },
            {
                label: 'Addition',
                value: `${amount >= 0 ? '+' : ''}${amount} ${unit === 'months' ? 'Monate' : 'Tage'}`,
            },
            { label: 'Ergebnis', value: formatGermanDateLong(result) },
        ],
        hint: 'Monate werden kalenderbasiert addiert (z. B. 31.01. + 1 Monat → 28./29.02.).',
    };
}
