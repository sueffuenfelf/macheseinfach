import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldDate } from '../_shared/shells';
import { formatGermanDateLong, formatGermanDateShort } from '../_shared/zeit/date';

function ageParts(birth: Date, reference: Date): { years: number; months: number; days: number } {
    let years = reference.getFullYear() - birth.getFullYear();
    let months = reference.getMonth() - birth.getMonth();
    let days = reference.getDate() - birth.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(reference.getFullYear(), reference.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months, days };
}

/** Alter in Jahren, Monaten und Tagen am Stichtag. */
export function computeAge(values: FieldValues): CalcResult {
    const birth = parseFieldDate(values.birth ?? '');
    if (!birth) {
        return { rows: [], error: 'Bitte ein gültiges Geburtsdatum wählen.' };
    }

    const reference = parseFieldDate(values.reference ?? '') ?? new Date();
    if (birth > reference) {
        return { rows: [], error: 'Geburtsdatum liegt nach dem Stichtag.' };
    }

    const { years, months, days } = ageParts(birth, reference);
    const totalDays = Math.floor((reference.getTime() - birth.getTime()) / 86_400_000);

    return {
        tone: 'info',
        heading: `${years} Jahre`,
        rows: [
            { label: 'Geburtsdatum', value: formatGermanDateShort(birth) },
            { label: 'Stichtag', value: formatGermanDateLong(reference) },
            { label: 'Alter', value: `${years} Jahre, ${months} Monate, ${days} Tage` },
            { label: 'Lebenstage (grob)', value: String(totalDays) },
        ],
    };
}
