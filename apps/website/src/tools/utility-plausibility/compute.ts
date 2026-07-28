import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL } from '../_shared/wohnen/theme';

/** Rough €/m²/year bands by heating type (orientation only). */
const BANDS: Record<string, { low: number; mid: number; high: number; label: string }> = {
    fern: { low: 22, mid: 31, high: 42, label: 'Fernwärme / zentral' },
    gas: { low: 18, mid: 26, high: 38, label: 'Gas-Etagenheizung' },
    oil: { low: 20, mid: 29, high: 40, label: 'Öl / gemischt' },
};

/** Plausibility check for annual utility cost per m². */
export function computeUtilityPlausibility(values: FieldValues): CalcResult {
    const annual = parseFieldNumber(values.annual ?? '');
    const sqm = parseFieldNumber(values.sqm ?? '');
    if (annual === null || annual < 0) {
        return { rows: [], error: 'Bitte die Jahres-Nebenkosten eingeben.' };
    }
    if (sqm === null || sqm <= 0) {
        return { rows: [], error: 'Bitte die Wohnfläche in m² eingeben.' };
    }

    const heating = values.heating ?? 'gas';
    const band = BANDS[heating] ?? BANDS.gas;
    const perSqm = Math.round((annual / sqm) * 100) / 100;

    let tone: CalcResult['tone'] = 'success';
    let verdict = 'Im üblichen Rahmen (grobe Orientierung)';
    if (perSqm < band.low) {
        tone = 'warn';
        verdict = 'Eher niedrig — Abrechnung oder Leerstand prüfen';
    } else if (perSqm > band.high) {
        tone = 'danger';
        verdict = 'Eher hoch — Positionen und Verbrauch hinterfragen';
    } else if (perSqm > band.mid) {
        tone = 'warn';
        verdict = 'Am oberen Rand der Orientierungsspanne';
    }

    return {
        tone,
        heading: verdict,
        rows: [
            { label: 'Kosten / m² / Jahr', value: `${perSqm.toLocaleString('de-DE')} €` },
            {
                label: 'Orientierungsspanne',
                value: `${band.low.toLocaleString('de-DE')}–${band.high.toLocaleString('de-DE')} €/m² (${band.label})`,
            },
            { label: 'Jahresbetrag', value: formatEuro(annual) },
            { label: 'Wohnfläche', value: `${sqm.toLocaleString('de-DE')} m²` },
        ],
        hint: `Keine Prüfung einzelner Positionen oder Rechtslage. ${DISCLAIMER_NO_LEGAL}`,
    };
}
