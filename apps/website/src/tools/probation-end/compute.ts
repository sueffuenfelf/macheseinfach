import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldDate, parseFieldNumber } from '../_shared/shells';
import {
    addDays,
    addMonths,
    formatGermanDateLong,
    formatGermanDateShort,
} from '../_shared/zeit/date';

/** Probezeit-Ende: Eintrittsdatum + X Monate (max. 6 Monate üblich). */
export function computeProbationEnd(values: FieldValues): CalcResult {
    const start = parseFieldDate(values.startDate ?? '');
    if (!start) {
        return { rows: [], error: 'Bitte ein gültiges Eintrittsdatum wählen.' };
    }

    const months = parseFieldNumber(values.months ?? '');
    const probationMonths = months === null ? 6 : months;
    if (probationMonths < 1 || probationMonths > 6 || !Number.isInteger(probationMonths)) {
        return { rows: [], error: 'Bitte Monate zwischen 1 und 6 eingeben.' };
    }

    const endDate = addDays(addMonths(start, probationMonths), -1);

    return {
        tone: 'info',
        heading: 'Probezeit-Ende (grob)',
        rows: [
            { label: 'Eintritt', value: formatGermanDateShort(start) },
            { label: 'Probezeit', value: `${probationMonths} Monate` },
            { label: 'Letzter Tag Probezeit (ca.)', value: formatGermanDateLong(endDate) },
        ],
        hint: 'Vereinfachte Berechnung (Monat + Tag davor) — kein Rechtsrat. Vertragliche Abweichungen möglich.',
    };
}
