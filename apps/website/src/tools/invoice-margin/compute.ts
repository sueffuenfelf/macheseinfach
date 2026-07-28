import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import { STEUERN_DISCLAIMER, roundCents } from '../_shared/steuern';

/** Verkaufskalkulation: EK → Marge → Netto-VK → Brutto inkl. MwSt. */
export function computeInvoiceMargin(values: FieldValues): CalcResult {
    const cost = parseFieldNumber(values.cost ?? '');
    const marginPct = parseFieldNumber(values.margin ?? '');
    const vatPct = Number(values.vat ?? '19');

    if (cost === null || cost < 0) {
        return { rows: [], error: 'Bitte Einkaufspreis (EK) eingeben.' };
    }
    if (marginPct === null || marginPct < 0) {
        return { rows: [], error: 'Bitte Marge in % eingeben.' };
    }
    if (![0, 7, 19].includes(vatPct)) {
        return { rows: [], error: 'Unbekannter MwSt-Satz.' };
    }

    const net = roundCents(cost * (1 + marginPct / 100));
    const vat = roundCents(net * (vatPct / 100));
    const gross = roundCents(net + vat);
    const marginAbs = roundCents(net - cost);

    return {
        tone: 'info',
        heading: 'Verkaufskalkulation',
        rows: [
            { label: 'Einkauf (EK)', value: formatEuro(cost) },
            { label: 'Marge', value: `${marginPct}\u00a0% (${formatEuro(marginAbs)})` },
            { label: 'Verkauf netto', value: formatEuro(net) },
            { label: `MwSt ${vatPct}\u00a0%`, value: formatEuro(vat) },
            { label: 'Verkauf brutto', value: formatEuro(gross) },
        ],
        hint: `Handelsspanne auf den EK. ${STEUERN_DISCLAIMER}`,
    };
}
