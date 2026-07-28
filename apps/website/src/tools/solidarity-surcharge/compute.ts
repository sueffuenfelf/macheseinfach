import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import {
    SOLI_RATE,
    STEUERN_DISCLAIMER,
    parseTaxYear,
    roundCents,
    soliFreigrenze,
} from '../_shared/steuern';

/** Solidaritätszuschlag — Freigrenzen-Hinweis + grobe 5,5 %. */
export function computeSolidaritySurcharge(values: FieldValues): CalcResult {
    const year = parseTaxYear(values.year);
    const est = parseFieldNumber(values.incomeTax ?? '');
    const filing = (values.filing ?? 'single') as 'single' | 'joint';

    if (est === null || est < 0) {
        return {
            rows: [],
            error: 'Bitte festgesetzte Einkommensteuer (ESt) eingeben.',
        };
    }

    const limit = soliFreigrenze(year, filing);
    const under = est <= limit;
    // Simplified: full rate above Freigrenze (Milderungszone not modelled).
    const soli = under ? 0 : roundCents(est * SOLI_RATE);

    return {
        tone: under ? 'success' : 'warn',
        heading: under ? 'Voraussichtlich kein Soli' : 'Soli grob anfallend',
        rows: [
            { label: 'Steuerjahr', value: String(year) },
            {
                label: 'Veranlagung',
                value: filing === 'joint' ? 'Zusammenveranlagung' : 'Einzelveranlagung',
            },
            { label: 'Festgesetzte ESt', value: formatEuro(est) },
            { label: 'Freigrenze (Nullzone)', value: formatEuro(limit) },
            { label: 'Soli (5,5\u00a0%, grob)', value: formatEuro(soli) },
        ],
        hint: `Freigrenze Stand ${year}. Milderungszone nicht modelliert — nur Orientierung. ${STEUERN_DISCLAIMER}`,
    };
}
