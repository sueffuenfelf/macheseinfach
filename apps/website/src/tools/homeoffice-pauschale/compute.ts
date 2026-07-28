import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import {
    HOMEOFFICE_EUR_PER_DAY,
    HOMEOFFICE_MAX_DAYS,
    HOMEOFFICE_MAX_EUR,
    STEUERN_DISCLAIMER,
    parseTaxYear,
} from '../_shared/steuern';

/** Homeoffice-Pauschale: Tage × 6 €, max 210 Tage. */
export function computeHomeofficePauschale(values: FieldValues): CalcResult {
    const year = parseTaxYear(values.year);
    const days = parseFieldNumber(values.days ?? '');

    if (days === null || days < 0 || !Number.isInteger(days)) {
        return { rows: [], error: 'Bitte eine gültige Anzahl Homeoffice-Tage eingeben.' };
    }

    const cappedDays = Math.min(days, HOMEOFFICE_MAX_DAYS);
    const amount = cappedDays * HOMEOFFICE_EUR_PER_DAY;
    const capped = days > HOMEOFFICE_MAX_DAYS;

    return {
        tone: capped ? 'warn' : 'info',
        heading: capped ? 'Obergrenze erreicht' : 'Homeoffice-Pauschale',
        rows: [
            { label: 'Steuerjahr', value: String(year) },
            { label: 'Tage eingegeben', value: String(days) },
            { label: 'Tage angesetzt', value: String(cappedDays) },
            { label: 'Satz', value: `${HOMEOFFICE_EUR_PER_DAY}\u00a0€/Tag` },
            { label: 'Pauschale', value: formatEuro(amount) },
            { label: 'Maximum', value: `${HOMEOFFICE_MAX_DAYS} Tage / ${formatEuro(HOMEOFFICE_MAX_EUR)}` },
        ],
        hint: `Stand ${year}: ${HOMEOFFICE_EUR_PER_DAY}\u00a0€/Tag, max. ${HOMEOFFICE_MAX_DAYS} Tage. Nicht mit Pendlerpauschale am selben Tag kombinieren. ${STEUERN_DISCLAIMER}`,
    };
}
