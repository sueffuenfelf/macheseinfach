import type { CalcResult, FieldValues } from '../_shared/shells';
import { convertHexRgb } from '../_shared/color';

export function computeHexRgb(values: FieldValues): CalcResult {
    const mode = (values.mode ?? 'hex-to-rgb') as 'hex-to-rgb' | 'rgb-to-hex';
    const input = (values.input ?? '').trim();
    if (!input) return { rows: [], error: 'Bitte Farbwert eingeben.' };
    const result = convertHexRgb(mode, input);
    if (!result) return { rows: [], error: 'Ungültiges Format — #RRGGBB oder rgb(r,g,b).' };
    return {
        rows: [
            { label: 'Eingabe', value: input },
            { label: 'Ergebnis', value: result },
        ],
    };
}
