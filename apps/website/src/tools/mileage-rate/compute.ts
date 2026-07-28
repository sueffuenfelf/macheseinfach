import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import { MILEAGE_EUR_PER_KM, STEUERN_DISCLAIMER, roundCents } from '../_shared/steuern';

/** Kilometerpauschale für Dienstreisen / betrieblich genutzten Pkw. */
export function computeMileageRate(values: FieldValues): CalcResult {
    const km = parseFieldNumber(values.km ?? '');
    if (km === null || km < 0) {
        return { rows: [], error: 'Bitte gefahrene Kilometer eingeben.' };
    }

    const total = roundCents(km * MILEAGE_EUR_PER_KM);

    return {
        tone: 'info',
        heading: 'Kilometerpauschale',
        rows: [
            { label: 'Kilometer', value: `${km} km` },
            { label: 'Satz', value: `${MILEAGE_EUR_PER_KM.toFixed(2).replace('.', ',')}\u00a0€/km` },
            { label: 'Pauschale', value: formatEuro(total) },
        ],
        hint: `Pauschbetrag 0,30\u00a0€/km (Orientierung). Einzelnachweis kann höher liegen. ${STEUERN_DISCLAIMER}`,
    };
}
