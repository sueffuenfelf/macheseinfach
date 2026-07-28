import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldDate } from '../_shared/shells';
import { formatGermanDateLong, formatGermanDateShort } from '../_shared/zeit/date';

/** Regelverjährung grob: Ende des Jahres des Ereignisses + 3 Jahre (§ 199 BGB vereinfacht). */
export function computeLimitationPeriodHint(values: FieldValues): CalcResult {
    const eventDate = parseFieldDate(values.eventDate ?? '');
    if (!eventDate) {
        return { rows: [], error: 'Bitte ein gültiges Datum wählen.' };
    }

    const yearEnd = new Date(eventDate.getFullYear(), 11, 31);
    const limitationEnd = new Date(eventDate.getFullYear() + 3, 11, 31);

    return {
        tone: 'warn',
        heading: 'Verjährung (grob)',
        rows: [
            { label: 'Ereignis / Forderung entstanden', value: formatGermanDateShort(eventDate) },
            { label: 'Jahresende des Ereignisjahres', value: formatGermanDateShort(yearEnd) },
            { label: 'Regelverjährung endet (ca.)', value: formatGermanDateLong(limitationEnd) },
            { label: 'Frist', value: '3 Jahre ab Jahresende' },
        ],
        hint: 'Vereinfachte Orientierung nach § 199 BGB — kürzere Fristen (z. B. 2 Jahre) und Hemmung möglich.',
    };
}
