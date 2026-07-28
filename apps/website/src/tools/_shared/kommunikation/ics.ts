function foldLine(line: string): string {
    if (line.length <= 75) return line;
    const parts: string[] = [];
    let rest = line;
    parts.push(rest.slice(0, 75));
    rest = rest.slice(75);
    while (rest.length > 0) {
        parts.push(` ${rest.slice(0, 74)}`);
        rest = rest.slice(74);
    }
    return parts.join('\r\n');
}

function escapeIcs(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function toIcsUtc(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

export type IcsEventInput = {
    title: string;
    start: Date;
    end: Date;
    location?: string;
    description?: string;
};

/** Build a minimal RFC 5545 calendar invite (.ics). */
export function buildIcsEvent(input: IcsEventInput): string {
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@macheseinfach.local`;
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//macheseinfach//Kalender//DE',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${toIcsUtc(new Date())}`,
        `DTSTART:${toIcsUtc(input.start)}`,
        `DTEND:${toIcsUtc(input.end)}`,
        foldLine(`SUMMARY:${escapeIcs(input.title)}`),
    ];

    if (input.location?.trim()) {
        lines.push(foldLine(`LOCATION:${escapeIcs(input.location.trim())}`));
    }
    if (input.description?.trim()) {
        lines.push(foldLine(`DESCRIPTION:${escapeIcs(input.description.trim())}`));
    }

    lines.push('END:VEVENT', 'END:VCALENDAR');
    return lines.join('\r\n');
}
