import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL } from '../_shared/wohnen/theme';

/** Index rent increase from baseline rent and VPI change %. */
export function computeRentIncreaseIndex(values: FieldValues): CalcResult {
    const rent = parseFieldNumber(values.rent ?? '');
    const changePct = parseFieldNumber(values.changePct ?? '');
    if (rent === null || rent < 0) {
        return { rows: [], error: 'Bitte die aktuelle Miete eingeben.' };
    }
    if (changePct === null) {
        return {
            rows: [],
            error: 'Bitte die Index-Änderung in Prozent eingeben (z. B. 3,5).',
        };
    }

    const factor = 1 + changePct / 100;
    const newRent = Math.round(rent * factor * 100) / 100;
    const delta = Math.round((newRent - rent) * 100) / 100;

    return {
        tone: 'info',
        heading: 'Indexmiete (grob)',
        rows: [
            { label: 'Aktuelle Miete', value: formatEuro(rent) },
            {
                label: 'Index-Änderung',
                value: `${changePct.toLocaleString('de-DE')} %`,
            },
            { label: 'Neue Miete (grob)', value: formatEuro(newRent) },
            { label: 'Differenz', value: formatEuro(delta) },
        ],
        hint: `Nur arithmetische Orientierung — Vertragsindex, Basisjahr und Caps prüfen. ${DISCLAIMER_NO_LEGAL}`,
    };
}
