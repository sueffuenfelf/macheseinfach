import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldDate, parseFieldNumber } from '../_shared/shells';
import { formatGermanDateShort } from '../_shared/zeit/date';
import { getGermanHolidayName, isGermanHoliday, listGermanHolidays } from '../_shared/zeit/holidays';

/** Feiertage DE prüfen oder Jahresübersicht. */
export function computeDeHolidays(values: FieldValues): CalcResult {
    const mode = values.mode ?? 'date';
    const region = values.region ?? 'NW';

    if (mode === 'year') {
        const year = parseFieldNumber(values.year ?? '');
        if (year === null || year < 1970 || year > 2100 || !Number.isInteger(year)) {
            return { rows: [], error: 'Bitte ein gültiges Jahr eingeben (z. B. 2026).' };
        }

        const holidays = listGermanHolidays(year, region);
        if (holidays.length === 0) {
            return { rows: [], error: 'Keine Feiertage für dieses Jahr gefunden.' };
        }

        return {
            tone: 'info',
            heading: `Feiertage ${year}`,
            rows: holidays.map((h) => ({
                label: formatGermanDateShort(h.date),
                value: h.name,
            })),
            hint: `Gesetzliche Feiertage in ${region} — Quelle: feiertagejs.`,
        };
    }

    const date = parseFieldDate(values.date ?? '');
    if (!date) {
        return { rows: [], error: 'Bitte ein gültiges Datum wählen.' };
    }

    const holiday = isGermanHoliday(date, region);
    const name = getGermanHolidayName(date, region);

    return {
        tone: holiday ? 'warn' : 'success',
        heading: holiday ? 'Feiertag' : 'Kein Feiertag',
        rows: [
            { label: 'Datum', value: formatGermanDateShort(date) },
            { label: 'Bundesland', value: region },
            { label: 'Status', value: holiday ? `Feiertag: ${name}` : 'Normaler Werktag/Wochenende' },
            {
                label: 'Wochentag',
                value: date.toLocaleDateString('de-DE', { weekday: 'long' }),
            },
        ],
        hint: 'Gesetzliche Feiertage nach Bundesland — keine Schulferien.',
    };
}
