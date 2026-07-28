import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldDate, parseFieldNumber } from '../_shared/shells';
import {
    addDays,
    endOfMonth,
    formatGermanDateLong,
    formatGermanDateShort,
} from '../_shared/zeit/date';

/**
 * Generische Kündigungsfrist: X Wochen zum Monatsende.
 * Frühestes Enddatum = Monatsende des Monats, in dem (Kündigung + X Wochen) liegt.
 */
export function computeNoticePeriod(values: FieldValues): CalcResult {
    const noticeDate = parseFieldDate(values.noticeDate ?? '');
    if (!noticeDate) {
        return { rows: [], error: 'Bitte ein gültiges Kündigungsdatum wählen.' };
    }

    const weeks = parseFieldNumber(values.weeks ?? '');
    if (weeks === null || weeks < 1 || !Number.isInteger(weeks)) {
        return { rows: [], error: 'Bitte eine gültige Anzahl Wochen eingeben (z. B. 4).' };
    }

    const minDate = addDays(noticeDate, weeks * 7);
    const terminationDate = endOfMonth(minDate);

    return {
        tone: 'warn',
        heading: 'Fristende (grob)',
        rows: [
            { label: 'Kündigung am', value: formatGermanDateShort(noticeDate) },
            { label: 'Frist', value: `${weeks} Wochen zum Monatsende` },
            { label: 'Frühestes Datum + Frist', value: formatGermanDateShort(minDate) },
            { label: 'Ende des Monats', value: formatGermanDateLong(terminationDate) },
        ],
        hint: 'Vereinfachte Berechnung — kein Rechtsrat. Vertragliche Sonderregeln können abweichen.',
    };
}
