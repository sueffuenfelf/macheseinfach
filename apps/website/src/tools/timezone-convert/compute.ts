import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldDate } from '../_shared/shells';
import { parseTimeHHMM } from '../_shared/zeit/date';

export const TIME_ZONES = [
    { value: 'Europe/Berlin', label: 'Berlin (MEZ/MESZ)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Europe/Vienna', label: 'Wien' },
    { value: 'Europe/Zurich', label: 'Zürich' },
    { value: 'America/New_York', label: 'New York' },
    { value: 'America/Los_Angeles', label: 'Los Angeles' },
    { value: 'Asia/Tokyo', label: 'Tokio' },
    { value: 'Asia/Dubai', label: 'Dubai' },
    { value: 'Australia/Sydney', label: 'Sydney' },
] as const;

function zonedToUtc(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    timeZone: string,
): Date {
    const pad = (n: number) => String(n).padStart(2, '0');
    const target = `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}`;
    let utc = Date.UTC(year, month - 1, day, hour, minute);

    for (let i = 0; i < 5; i++) {
        const got = new Intl.DateTimeFormat('sv-SE', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
            .format(new Date(utc))
            .replace('T', ' ')
            .slice(0, 16);
        if (got === target) return new Date(utc);
        const gotMs = Date.parse(`${got.replace(' ', 'T')}:00Z`);
        const wantMs = Date.parse(`${target.replace(' ', 'T')}:00Z`);
        utc -= gotMs - wantMs;
    }
    return new Date(utc);
}

function formatInZone(utc: Date, timeZone: string): string {
    return new Intl.DateTimeFormat('de-DE', {
        timeZone,
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(utc);
}

/** Zeitzone A → Zeitzone B umrechnen. */
export function computeTimezoneConvert(values: FieldValues): CalcResult {
    const date = parseFieldDate(values.date ?? '');
    if (!date) {
        return { rows: [], error: 'Bitte ein gültiges Datum wählen.' };
    }

    const time = parseTimeHHMM(values.time ?? '');
    if (time === null) {
        return { rows: [], error: 'Bitte eine gültige Uhrzeit eingeben (HH:MM).' };
    }

    const fromZone = values.fromZone ?? 'Europe/Berlin';
    const toZone = values.toZone ?? 'UTC';
    const hour = Math.floor(time / 60);
    const minute = time % 60;

    const utc = zonedToUtc(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        hour,
        minute,
        fromZone,
    );

    const fromLabel = TIME_ZONES.find((z) => z.value === fromZone)?.label ?? fromZone;
    const toLabel = TIME_ZONES.find((z) => z.value === toZone)?.label ?? toZone;

    return {
        tone: 'info',
        heading: 'Uhrzeit umgerechnet',
        rows: [
            { label: 'Quelle', value: `${formatInZone(utc, fromZone)} (${fromLabel})` },
            { label: 'Ziel', value: `${formatInZone(utc, toZone)} (${toLabel})` },
            { label: 'UTC', value: utc.toISOString().replace('T', ' ').slice(0, 16) },
        ],
        hint: 'Sommer-/Winterzeit wird über die IANA-Zeitzone berücksichtigt.',
    };
}
