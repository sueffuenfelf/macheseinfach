import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import {
    STEUERN_DISCLAIMER,
    childBenefitMonthly,
    parseTaxYear,
    roundCents,
} from '../_shared/steuern';

/** Kindergeld-Orientierung — Höhe × Anzahl, keine Anspruchsprüfung. */
export function computeChildBenefitHint(values: FieldValues): CalcResult {
    const year = parseTaxYear(values.year);
    const count = parseFieldNumber(values.count ?? '');
    const age = parseFieldNumber(values.age ?? '');

    if (count === null || count <= 0 || !Number.isInteger(count)) {
        return { rows: [], error: 'Bitte Anzahl der Kinder eingeben (ganze Zahl).' };
    }
    if (age !== null && (age < 0 || age > 30)) {
        return { rows: [], error: 'Alter bitte zwischen 0 und 30 eingeben (oder leer lassen).' };
    }

    const monthly = childBenefitMonthly(year);
    const monthTotal = roundCents(monthly * count);
    const yearTotal = roundCents(monthTotal * 12);

    const ageNote =
        age === null
            ? 'Keine Altersprüfung — Anspruch hängt u. a. von Alter und Ausbildung ab.'
            : age < 18
              ? 'Unter 18: in der Regel Anspruch möglich (Orientierung).'
              : age <= 25
                ? '18–25: oft nur bei Ausbildung/Studium — Einzelfall prüfen.'
                : 'Über 25: Kindergeld ist die Ausnahme — Anspruch genau prüfen.';

    return {
        tone: 'info',
        heading: 'Kindergeld-Orientierung',
        rows: [
            { label: 'Steuerjahr', value: String(year) },
            { label: 'Kinder', value: String(count) },
            ...(age !== null ? [{ label: 'Alter (Hinweis)', value: `${age} Jahre` }] : []),
            { label: 'Satz pro Kind / Monat', value: formatEuro(monthly) },
            { label: 'Monatlich gesamt', value: formatEuro(monthTotal) },
            { label: 'Jährlich gesamt', value: formatEuro(yearTotal) },
        ],
        hint: `${ageNote} Keine Anspruchsprüfung. Stand ${year}. ${STEUERN_DISCLAIMER}`,
    };
}
