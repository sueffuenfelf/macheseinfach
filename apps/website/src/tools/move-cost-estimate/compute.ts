import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

const BASE_PER_SQM: Record<string, number> = {
    self: 8,
    mid: 22,
    full: 35,
};

/** Rough move cost estimate from distance, size, and service level. */
export function computeMoveCost(values: FieldValues): CalcResult {
    const sqm = parseFieldNumber(values.sqm ?? '');
    const km = parseFieldNumber(values.km ?? '');
    if (sqm === null || sqm <= 0) {
        return { rows: [], error: 'Bitte die Wohnfläche eingeben.' };
    }
    if (km === null || km < 0) {
        return { rows: [], error: 'Bitte die Entfernung in km eingeben.' };
    }

    const level = values.level ?? 'mid';
    const perSqm = BASE_PER_SQM[level] ?? BASE_PER_SQM.mid;
    const distanceFactor = 1 + Math.min(km, 500) / 200;
    const low = Math.round(sqm * perSqm * 0.75 * distanceFactor);
    const mid = Math.round(sqm * perSqm * distanceFactor);
    const high = Math.round(sqm * perSqm * 1.35 * distanceFactor);

    const levelLabel =
        level === 'self' ? 'Selbstumzug' : level === 'full' ? 'Vollservice' : 'Spedition mittel';

    return {
        tone: 'info',
        heading: 'Umzugskosten (Schätzung)',
        rows: [
            { label: 'Szenario', value: levelLabel },
            { label: 'Spanne niedrig', value: formatEuro(low) },
            { label: 'Spanne Mitte', value: formatEuro(mid) },
            { label: 'Spanne hoch', value: formatEuro(high) },
        ],
        hint: 'Sehr grobe Budget-Orientierung — Angebote vor Ort einholen. Keine Preisgarantie.',
    };
}
