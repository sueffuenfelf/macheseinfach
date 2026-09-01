import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldDate } from '../_shared/shells';
import { formatGermanDateLong, startOfDay } from '../_shared/zeit/date';

/** Tage bis (oder seit) einem Zieldatum. */
export function computeCountdown(values: FieldValues): CalcResult {
    const target = parseFieldDate(values.target ?? '');
    if (!target) {
        return { rows: [], error: 'Bitte ein gültiges Zieldatum wählen.' };
    }

    const reference = parseFieldDate(values.reference ?? '') ?? startOfDay(new Date());
    const diffMs = startOfDay(target).getTime() - startOfDay(reference).getTime();
    const days = Math.round(diffMs / 86_400_000);
    const absDays = Math.abs(days);
    const weeks = (absDays / 7).toFixed(1);

    let heading: string;
    let tone: CalcResult['tone'] = 'info';
    if (days === 0) {
        heading = 'Heute';
        tone = 'warn';
    } else if (days > 0) {
        heading = `Noch ${absDays} Tage`;
        tone = 'success';
    } else {
        heading = `Vor ${absDays} Tagen`;
        tone = 'info';
    }

    return {
        tone,
        heading,
        rows: [
            { label: 'Zieldatum', value: formatGermanDateLong(target) },
            {
                label: 'Bezugsdatum',
                value: formatGermanDateLong(reference),
            },
            { label: 'Tage', value: String(days) },
            { label: 'Wochen (grob)', value: weeks },
        ],
        hint:
            days > 0
                ? 'Countdown bis zum Zieldatum.'
                : days < 0
                  ? 'Das Datum liegt in der Vergangenheit.'
                  : undefined,
    };
}
