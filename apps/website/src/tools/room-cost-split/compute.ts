import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

/** Split rent/utilities among roommates equally or by room size. */
export function computeRoomCostSplit(values: FieldValues): CalcResult {
    const total = parseFieldNumber(values.total ?? '');
    const people = parseFieldNumber(values.people ?? '');
    if (total === null || total < 0) {
        return { rows: [], error: 'Bitte den Gesamtbetrag (Miete + NK) eingeben.' };
    }
    if (people === null || people < 1 || !Number.isInteger(people)) {
        return { rows: [], error: 'Bitte die Anzahl der Personen (ganze Zahl ≥ 1) eingeben.' };
    }

    const mode = values.mode ?? 'equal';
    if (mode === 'equal') {
        const share = Math.round((total / people) * 100) / 100;
        return {
            tone: 'info',
            heading: 'Gleicher Anteil',
            rows: [
                { label: 'Gesamt / Monat', value: formatEuro(total) },
                { label: 'Personen', value: String(people) },
                { label: 'Pro Person', value: formatEuro(share) },
            ],
            hint: 'Einfache Teilung — Sonderabsprachen (größeres Zimmer) separat regeln.',
        };
    }

    const sizesRaw = (values.sizes ?? '')
        .split(/[,;\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    const sizes = sizesRaw.map((s) => parseFieldNumber(s));
    if (sizes.length !== people || sizes.some((s) => s === null || s! <= 0)) {
        return {
            rows: [],
            error: `Bitte ${people} positive Zimmerflächen angeben (z. B. 12, 14, 16).`,
        };
    }
    const nums = sizes as number[];
    const sumSqm = nums.reduce((a, b) => a + b, 0);
    const rows = nums.map((sqm, i) => {
        const share = Math.round(((total * sqm) / sumSqm) * 100) / 100;
        return {
            label: `Person ${i + 1} (${sqm.toLocaleString('de-DE')} m²)`,
            value: formatEuro(share),
        };
    });

    return {
        tone: 'info',
        heading: 'Nach Zimmerfläche',
        rows: [{ label: 'Gesamt / Monat', value: formatEuro(total) }, ...rows],
        hint: 'Anteil proportional zur angegebenen Zimmerfläche.',
    };
}
