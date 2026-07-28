import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldDate, parseFieldNumber } from '../_shared/shells';
import {
    addDays,
    formatGermanDateLong,
    formatGermanDateShort,
} from '../_shared/zeit/date';

/** Widerrufsfrist: Startdatum + X Tage (Standard 14). */
export function computeWithdrawalPeriod(values: FieldValues): CalcResult {
    const start = parseFieldDate(values.startDate ?? '');
    if (!start) {
        return { rows: [], error: 'Bitte ein gültiges Startdatum wählen.' };
    }

    const days = parseFieldNumber(values.days ?? '');
    const periodDays = days === null ? 14 : days;
    if (periodDays < 1 || !Number.isInteger(periodDays)) {
        return { rows: [], error: 'Bitte eine gültige Anzahl Tage eingeben (z. B. 14).' };
    }

    const lastDay = addDays(start, periodDays);

    return {
        tone: 'info',
        heading: 'Widerrufsfrist (grob)',
        rows: [
            { label: 'Beginn (z. B. Warenerhalt)', value: formatGermanDateShort(start) },
            { label: 'Frist', value: `${periodDays} Tage` },
            { label: 'Letzter Tag der Frist', value: formatGermanDateLong(lastDay) },
        ],
        hint: 'Vereinfachte Kalendertags-Rechnung — kein Rechtsrat. Sonderregeln (Dienstleistungen, B2B) können abweichen.',
    };
}
