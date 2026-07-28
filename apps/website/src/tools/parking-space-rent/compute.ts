import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

/** Typical parking share of rent or absolute garage rent. */
export function computeParkingSpaceRent(values: FieldValues): CalcResult {
    const mode = values.mode ?? 'share';
    if (mode === 'share') {
        const rent = parseFieldNumber(values.rent ?? '');
        const pct = parseFieldNumber(values.pct ?? '') ?? 8;
        if (rent === null || rent < 0) {
            return { rows: [], error: 'Bitte die Gesamtmiete eingeben.' };
        }
        const share = Math.round(((rent * pct) / 100) * 100) / 100;
        return {
            tone: 'info',
            heading: 'Stellplatz-Anteil (Schätzung)',
            rows: [
                { label: 'Miete gesamt', value: formatEuro(rent) },
                { label: 'Angenommener Anteil', value: `${pct.toLocaleString('de-DE')} %` },
                { label: 'Stellplatz grob', value: formatEuro(share) },
            ],
            hint: 'Üblich oft einstelliger Prozentanteil oder feste Garagenmiete — lokal stark unterschiedlich.',
        };
    }

    const garage = parseFieldNumber(values.garage ?? '');
    const rent = parseFieldNumber(values.rent ?? '');
    if (garage === null || garage < 0) {
        return { rows: [], error: 'Bitte die Stellplatz-/Garagenmiete eingeben.' };
    }
    if (rent === null || rent <= 0) {
        return { rows: [], error: 'Bitte die Gesamtmiete eingeben.' };
    }
    const pct = Math.round((garage / rent) * 1000) / 10;
    return {
        tone: 'info',
        heading: 'Anteil der Garagenmiete',
        rows: [
            { label: 'Stellplatz', value: formatEuro(garage) },
            { label: 'Miete gesamt', value: formatEuro(rent) },
            { label: 'Anteil', value: `${pct.toLocaleString('de-DE')} %` },
        ],
        hint: 'Nur Verhältnisrechnung — keine Marktbewertung.',
    };
}
