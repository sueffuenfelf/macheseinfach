import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import { pxToRem, remToPx } from '../_shared/color';

export function computeRemPx(values: FieldValues): CalcResult {
    const mode = values.mode ?? 'rem-to-px';
    const value = parseFieldNumber(values.value ?? '');
    const base = parseFieldNumber(values.base ?? '16') ?? 16;
    if (value === null) return { rows: [], error: 'Bitte einen Wert eingeben.' };
    if (base <= 0) return { rows: [], error: 'Basis-Pixel müssen > 0 sein.' };
    const result = mode === 'rem-to-px' ? remToPx(value, base) : pxToRem(value, base);
    const unit = mode === 'rem-to-px' ? 'px' : 'rem';
    return {
        rows: [
            { label: 'Eingabe', value: `${value} ${mode === 'rem-to-px' ? 'rem' : 'px'}` },
            { label: 'Basis', value: `${base} px` },
            { label: 'Ergebnis', value: `${result.toFixed(4).replace(/\.?0+$/, '')} ${unit}` },
        ],
        hint: 'Standard-Browser: 1 rem = 16 px (wenn root font-size nicht geändert).',
    };
}
