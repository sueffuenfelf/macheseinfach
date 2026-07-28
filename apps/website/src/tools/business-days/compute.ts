import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldDate } from '../_shared/shells';
import { addDays, formatGermanDateShort, isWeekend, startOfDay } from '../_shared/zeit/date';
import { isGermanHoliday } from '../_shared/zeit/holidays';

function countBusinessDays(
    from: Date,
    to: Date,
    excludeHolidays: boolean,
    region: string,
): { count: number; direction: 'forward' | 'backward' | 'same' } {
    const start = startOfDay(from);
    const end = startOfDay(to);
    if (start.getTime() === end.getTime()) {
        return { count: 0, direction: 'same' };
    }

    const forward = start < end;
    const step = forward ? 1 : -1;
    let current = new Date(start);
    let count = 0;

    while (current.getTime() !== end.getTime()) {
        current = addDays(current, step);
        const weekend = isWeekend(current);
        const holiday = excludeHolidays && isGermanHoliday(current, region);
        if (!weekend && !holiday) count++;
    }

    return { count, direction: forward ? 'forward' : 'backward' };
}

/** Werktage zwischen zwei Daten (Mo–Fr, optional ohne Feiertage). */
export function computeBusinessDays(values: FieldValues): CalcResult {
    const from = parseFieldDate(values.from ?? '');
    const to = parseFieldDate(values.to ?? '');
    if (!from || !to) {
        return { rows: [], error: 'Bitte zwei gültige Daten wählen.' };
    }

    const excludeHolidays = (values.holidays ?? 'no') === 'yes';
    const region = values.region ?? 'NW';
    const { count, direction } = countBusinessDays(from, to, excludeHolidays, region);

    return {
        tone: 'info',
        heading: direction === 'same' ? 'Gleiches Datum' : 'Werktage berechnet',
        rows: [
            { label: 'Von', value: formatGermanDateShort(from) },
            { label: 'Bis', value: formatGermanDateShort(to) },
            { label: 'Werktage', value: String(count) },
            {
                label: 'Feiertage',
                value: excludeHolidays ? `Ausgeschlossen (${region})` : 'Nicht berücksichtigt',
            },
        ],
        hint: 'Werktage = Montag–Freitag. Wochenenden werden immer ausgeschlossen.',
    };
}
