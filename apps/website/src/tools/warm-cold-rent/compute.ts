import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

/** Convert between warm and cold rent given utilities. */
export function computeWarmColdRent(values: FieldValues): CalcResult {
    const mode = values.mode ?? 'cold-to-warm';
    const utilities = parseFieldNumber(values.utilities ?? '');
    if (utilities === null || utilities < 0) {
        return { rows: [], error: 'Bitte Nebenkostenvorauszahlung eingeben.' };
    }

    if (mode === 'cold-to-warm') {
        const cold = parseFieldNumber(values.amount ?? '');
        if (cold === null || cold < 0) {
            return { rows: [], error: 'Bitte die Kaltmiete eingeben.' };
        }
        const warm = Math.round((cold + utilities) * 100) / 100;
        const share = warm > 0 ? Math.round((utilities / warm) * 1000) / 10 : 0;
        return {
            tone: 'info',
            heading: 'Kalt → Warm',
            rows: [
                { label: 'Kaltmiete', value: formatEuro(cold) },
                { label: 'Nebenkosten (VZ)', value: formatEuro(utilities) },
                { label: 'Warmmiete', value: formatEuro(warm) },
                { label: 'NK-Anteil', value: `${share.toLocaleString('de-DE')} %` },
            ],
            hint: 'Nur Addition der Vorauszahlung — keine Abrechnung.',
        };
    }

    const warm = parseFieldNumber(values.amount ?? '');
    if (warm === null || warm < 0) {
        return { rows: [], error: 'Bitte die Warmmiete eingeben.' };
    }
    if (utilities > warm) {
        return { rows: [], error: 'Nebenkosten können nicht höher als die Warmmiete sein.' };
    }
    const cold = Math.round((warm - utilities) * 100) / 100;
    const share = warm > 0 ? Math.round((utilities / warm) * 1000) / 10 : 0;
    return {
        tone: 'info',
        heading: 'Warm → Kalt',
        rows: [
            { label: 'Warmmiete', value: formatEuro(warm) },
            { label: 'Nebenkosten (VZ)', value: formatEuro(utilities) },
            { label: 'Kaltmiete', value: formatEuro(cold) },
            { label: 'NK-Anteil', value: `${share.toLocaleString('de-DE')} %` },
        ],
        hint: 'Nur Subtraktion der Vorauszahlung — keine Abrechnung.',
    };
}
