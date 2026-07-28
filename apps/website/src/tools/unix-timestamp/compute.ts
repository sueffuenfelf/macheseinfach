import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldDate, parseFieldNumber } from '../_shared/shells';
import { parseTimeHHMM } from '../_shared/zeit/date';

function dateTimeToUnix(date: Date, minutes: number): number {
    const d = new Date(date);
    d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return Math.floor(d.getTime() / 1000);
}

/** Unix-Timestamp ↔ Datum umrechnen. */
export function computeUnixTimestamp(values: FieldValues): CalcResult {
    const mode = values.mode ?? 'to-date';

    if (mode === 'to-date') {
        const raw = (values.timestamp ?? '').trim();
        if (!raw) {
            return { rows: [], error: 'Bitte einen Unix-Timestamp eingeben.' };
        }
        const seconds = parseFieldNumber(raw);
        if (seconds === null) {
            return { rows: [], error: 'Ungültiger Timestamp — nur Ziffern.' };
        }
        const ms = raw.length > 10 ? seconds : seconds * 1000;
        const date = new Date(ms);
        if (!Number.isFinite(date.getTime())) {
            return { rows: [], error: 'Timestamp liegt außerhalb des gültigen Bereichs.' };
        }

        return {
            tone: 'info',
            heading: 'Timestamp umgewandelt',
            rows: [
                { label: 'Eingabe', value: raw },
                { label: 'Lokal', value: date.toLocaleString('de-DE') },
                { label: 'UTC', value: date.toISOString() },
                { label: 'Unix (Sekunden)', value: String(Math.floor(date.getTime() / 1000)) },
            ],
        };
    }

    const date = parseFieldDate(values.date ?? '');
    if (!date) {
        return { rows: [], error: 'Bitte ein gültiges Datum wählen.' };
    }

    const time = parseTimeHHMM(values.time ?? '00:00') ?? 0;
    const unix = dateTimeToUnix(date, time);

    return {
        tone: 'info',
        heading: 'Unix-Timestamp',
        rows: [
            { label: 'Datum/Zeit (lokal)', value: new Date(unix * 1000).toLocaleString('de-DE') },
            { label: 'Unix (Sekunden)', value: String(unix) },
            { label: 'Unix (Millisekunden)', value: String(unix * 1000) },
            { label: 'UTC', value: new Date(unix * 1000).toISOString() },
        ],
    };
}
