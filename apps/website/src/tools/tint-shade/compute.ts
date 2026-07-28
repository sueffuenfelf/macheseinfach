import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import { shade, tint } from '../_shared/color';

export function computeTintShade(values: FieldValues): CalcResult {
    const color = (values.color ?? '').trim();
    const amount = parseFieldNumber(values.amount ?? '25') ?? 25;
    const mode = values.mode ?? 'tint';
    if (!color) return { rows: [], error: 'Basisfarbe eingeben.' };
    const result = mode === 'tint' ? tint(color, amount) : shade(color, amount);
    if (!result) return { rows: [], error: 'Ungültige Farbe.' };
    return {
        rows: [
            { label: 'Basis', value: color },
            { label: mode === 'tint' ? 'Aufhellung' : 'Abdunklung', value: `${amount}%` },
            { label: 'Ergebnis', value: result },
        ],
    };
}
