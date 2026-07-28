import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import { STEUERN_DISCLAIMER, roundCents } from '../_shared/steuern';

/** Lineare AfA: Anschaffungskosten / Nutzungsdauer. */
export function computeAfaLinear(values: FieldValues): CalcResult {
    const cost = parseFieldNumber(values.cost ?? '');
    const years = parseFieldNumber(values.years ?? '');

    if (cost === null || cost <= 0) {
        return { rows: [], error: 'Bitte Anschaffungskosten eingeben (z. B. 1.200,00).' };
    }
    if (years === null || years <= 0) {
        return { rows: [], error: 'Bitte Nutzungsdauer in Jahren eingeben (z. B. 3 oder 13).' };
    }

    const annual = roundCents(cost / years);
    const monthly = roundCents(annual / 12);

    return {
        tone: 'info',
        heading: 'Lineare AfA (grob)',
        rows: [
            { label: 'Anschaffungskosten', value: formatEuro(cost) },
            { label: 'Nutzungsdauer', value: `${years} Jahre` },
            { label: 'AfA pro Jahr', value: formatEuro(annual) },
            { label: 'AfA pro Monat', value: formatEuro(monthly) },
        ],
        hint: `Vereinfachte lineare Abschreibung. ${STEUERN_DISCLAIMER}`,
    };
}
