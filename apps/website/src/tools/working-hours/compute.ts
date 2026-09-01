import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import { formatMinutesAsHHMM, parseTimeHHMM } from '../_shared/zeit/date';

/** Arbeitsstunden zwischen zwei Uhrzeiten — optional mit Pause. */
export function computeWorkingHours(values: FieldValues): CalcResult {
    const start = parseTimeHHMM(values.start ?? '');
    const end = parseTimeHHMM(values.end ?? '');
    if (start === null || end === null) {
        return { rows: [], error: 'Bitte gültige Uhrzeiten eingeben (HH:MM).' };
    }

    const breakMin = parseFieldNumber(values.breakMin ?? '') ?? 0;
    if (breakMin < 0) {
        return { rows: [], error: 'Pause darf nicht negativ sein.' };
    }

    let endMinutes = end;
    if (endMinutes <= start) {
        endMinutes += 24 * 60;
    }

    const gross = endMinutes - start;
    const net = Math.max(0, gross - breakMin);
    const hours = Math.floor(net / 60);
    const minutes = net % 60;

    return {
        tone: 'info',
        heading: `${hours}h ${minutes}min`,
        rows: [
            { label: 'Beginn', value: formatMinutesAsHHMM(start) },
            { label: 'Ende', value: formatMinutesAsHHMM(end % (24 * 60)) },
            { label: 'Brutto', value: `${Math.floor(gross / 60)}h ${gross % 60}min` },
            { label: 'Pause', value: breakMin ? `${breakMin} min` : 'Keine' },
            {
                label: 'Netto-Arbeitszeit',
                value: `${hours}h ${minutes}min (${(net / 60).toFixed(2)} h)`,
            },
        ],
        hint: end <= start ? 'Ende liegt am Folgetag (Nachtschicht).' : undefined,
    };
}
