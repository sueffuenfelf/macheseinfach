import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

function roundHalf(value: number): number {
    return Math.round(value * 2) / 2;
}

/** Urlaubsanspruch anteilig: Jahresurlaub × Monate / 12 (grob). */
export function computeVacationEntitlement(values: FieldValues): CalcResult {
    const workDays = values.workDaysPerWeek ?? '5';
    const annualDays = workDays === '6' ? 24 : 20;

    const months = parseFieldNumber(values.months ?? '');
    if (months === null || months < 1 || months > 12) {
        return { rows: [], error: 'Bitte Monate zwischen 1 und 12 eingeben.' };
    }

    const entitlement = roundHalf((annualDays * months) / 12);

    return {
        tone: 'info',
        heading: 'Urlaubsanspruch (grob)',
        rows: [
            { label: 'Arbeitstage pro Woche', value: workDays === '6' ? '6 Tage' : '5 Tage' },
            { label: 'Jahresurlaub (Mindestanspruch)', value: `${annualDays} Tage` },
            { label: 'Monate im Jahr', value: String(months) },
            { label: 'Anteiliger Anspruch (ca.)', value: `${entitlement} Tage` },
        ],
        hint: 'Vereinfachte Teiljahrs-Rechnung — kein Rechtsrat. Sonderregeln bei Ein-/Austritt und Betriebszugehörigkeit möglich.',
    };
}
