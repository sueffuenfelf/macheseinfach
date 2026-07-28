import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL } from '../_shared/wohnen/theme';

/** Max deposit orientation: 3× cold rent (§551 BGB). */
export function computeDeposit(values: FieldValues): CalcResult {
    const cold = parseFieldNumber(values.cold ?? '');
    if (cold === null || cold < 0) {
        return { rows: [], error: 'Bitte die Kaltmiete eingeben (z. B. 850,00).' };
    }

    const max = Math.round(cold * 3 * 100) / 100;
    const installment = Math.round((max / 3) * 100) / 100;

    return {
        tone: 'info',
        heading: 'Kaution (Orientierung)',
        rows: [
            { label: 'Kaltmiete', value: formatEuro(cold) },
            { label: 'Maximal (3 Monatsmieten)', value: formatEuro(max) },
            { label: 'Rate bei 3 Teilzahlungen', value: formatEuro(installment) },
        ],
        hint: `Obergrenze oft 3 Kaltmieten; erste Rate mit Beginn, Rest in 2 Monatsraten möglich. ${DISCLAIMER_NO_LEGAL}`,
    };
}
