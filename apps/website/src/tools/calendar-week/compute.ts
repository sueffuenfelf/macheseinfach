import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldDate } from '../_shared/shells';
import { formatGermanDateLong, getISOWeek } from '../_shared/zeit/date';

/** ISO-Kalenderwoche für ein Datum. */
export function computeCalendarWeek(values: FieldValues): CalcResult {
    const date = parseFieldDate(values.date ?? '');
    if (!date) {
        return { rows: [], error: 'Bitte ein gültiges Datum wählen.' };
    }

    const { week, year } = getISOWeek(date);

    return {
        tone: 'info',
        heading: `KW ${week}`,
        rows: [
            { label: 'Datum', value: formatGermanDateLong(date) },
            { label: 'Kalenderwoche (ISO)', value: `KW ${week}` },
            { label: 'ISO-Jahr', value: String(year) },
            {
                label: 'Wochentag',
                value: date.toLocaleDateString('de-DE', { weekday: 'long' }),
            },
        ],
        hint: 'ISO 8601: Woche beginnt Montag; KW 1 enthält den ersten Donnerstag des Jahres.',
    };
}
