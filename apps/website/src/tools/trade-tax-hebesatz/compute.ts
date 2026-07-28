import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import {
    STEUERN_DISCLAIMER,
    TRADE_TAX_ALLOWANCE,
    TRADE_TAX_MESSZAHL,
    roundCents,
} from '../_shared/steuern';

/** Gewerbesteuer grob: (Gewinn − Freibetrag) × 3,5 % × Hebesatz/100. */
export function computeTradeTaxHebesatz(values: FieldValues): CalcResult {
    const profit = parseFieldNumber(values.profit ?? '');
    const hebesatz = parseFieldNumber(values.hebesatz ?? '');
    const entity = values.entity ?? 'sole';

    if (profit === null || profit < 0) {
        return { rows: [], error: 'Bitte Gewerbeertrag / Gewinn eingeben.' };
    }
    if (hebesatz === null || hebesatz <= 0) {
        return { rows: [], error: 'Bitte Hebesatz in % eingeben (z. B. 400).' };
    }

    const allowance = entity === 'corp' ? 0 : TRADE_TAX_ALLOWANCE;
    const taxableBase = Math.max(0, profit - allowance);
    const messbetrag = roundCents(taxableBase * TRADE_TAX_MESSZAHL);
    const tax = roundCents(messbetrag * (hebesatz / 100));

    return {
        tone: 'info',
        heading: 'Gewerbesteuer (grob)',
        rows: [
            { label: 'Gewinn / Gewerbeertrag', value: formatEuro(profit) },
            {
                label: 'Freibetrag',
                value: entity === 'corp' ? '0\u00a0€ (Kapitalgesellschaft)' : formatEuro(allowance),
            },
            { label: 'Steuerbemessungsgrundlage', value: formatEuro(taxableBase) },
            { label: 'Steuermesszahl', value: '3,5\u00a0%' },
            { label: 'Hebesatz', value: `${hebesatz}\u00a0%` },
            { label: 'Gewerbesteuer grob', value: formatEuro(tax) },
        ],
        hint: `Vereinfachte Formel ohne Zerlegung/Hinzurechnungen. ${STEUERN_DISCLAIMER}`,
    };
}
