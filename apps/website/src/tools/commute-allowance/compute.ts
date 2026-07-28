import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import {
    STEUERN_DISCLAIMER,
    commuteAnnual,
    parseTaxYear,
} from '../_shared/steuern';

/** Pendlerpauschale / Entfernungspauschale (einfache Strecke). */
export function computeCommuteAllowance(values: FieldValues): CalcResult {
    const year = parseTaxYear(values.year);
    const km = parseFieldNumber(values.km ?? '');
    const days = parseFieldNumber(values.days ?? '');

    if (km === null || km <= 0) {
        return { rows: [], error: 'Bitte Entfernung in km (einfache Strecke) eingeben.' };
    }
    if (days === null || days <= 0 || !Number.isInteger(days)) {
        return { rows: [], error: 'Bitte eine gültige Anzahl Arbeitstage eingeben.' };
    }

    const distance = Math.floor(km);
    const total = commuteAnnual(year, distance, days);
    const rateHint =
        year >= 2026
            ? '0,38\u00a0€/km ab dem 1. km'
            : '0,30\u00a0€/km (1.–20.), 0,38\u00a0€/km ab 21.';

    return {
        tone: 'info',
        heading: 'Entfernungspauschale (grob)',
        rows: [
            { label: 'Steuerjahr', value: String(year) },
            { label: 'Einfache Strecke', value: `${distance} km` },
            { label: 'Arbeitstage', value: String(days) },
            { label: 'Satz', value: rateHint },
            { label: 'Jahresbetrag', value: formatEuro(total) },
        ],
        hint: `Nur volle Kilometer der einfachen Entfernung. Stand ${year}. ${STEUERN_DISCLAIMER}`,
    };
}
