import type { FieldValues, GenerateOutput } from '../_shared/shells';
import { parseFieldDate } from '../_shared/shells';
import { buildIcsEvent } from '../_shared/kommunikation/ics';

function combineDateTime(date: Date, time: string): Date | null {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
}

export function generateIcsInvite(values: FieldValues): GenerateOutput {
    const title = (values.title ?? '').trim();
    if (!title) return null;

    const date = parseFieldDate(values.date ?? '');
    if (!date) return null;

    const startTime = values.startTime ?? '10:00';
    const endTime = values.endTime ?? '11:00';
    const start = combineDateTime(date, startTime);
    const end = combineDateTime(date, endTime);
    if (!start || !end || end <= start) return null;

    const ics = buildIcsEvent({
        title,
        start,
        end,
        location: values.location,
        description: values.description,
    });

    return { kind: 'text', content: ics, filename: 'einladung.ics' };
}
