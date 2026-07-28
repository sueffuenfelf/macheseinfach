import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldDate } from '../_shared/shells';

function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Calendar-day difference (B − A), inclusive optional. */
export function computeDateDiff(values: FieldValues): CalcResult {
    const a = parseFieldDate(values.a ?? '');
    const b = parseFieldDate(values.b ?? '');
    if (!a || !b) {
        return { rows: [], error: 'Bitte zwei gültige Daten wählen.' };
    }

    const start = startOfDay(a);
    const end = startOfDay(b);
    const ms = end.getTime() - start.getTime();
    const days = Math.round(ms / 86_400_000);
    const inclusive = (values.inclusive ?? 'no') === 'yes';
    const span = inclusive ? Math.abs(days) + 1 : Math.abs(days);

    return {
        tone: 'info',
        heading: days === 0 ? 'Gleiches Datum' : days > 0 ? 'Später' : 'Früher',
        rows: [
            { label: 'Differenz (Tage)', value: String(days) },
            {
                label: inclusive ? 'Spanne inkl. beider Tage' : 'Spanne (exklusiv)',
                value: String(span),
            },
            { label: 'Wochen (grob)', value: (Math.abs(days) / 7).toFixed(1) },
        ],
    };
}
