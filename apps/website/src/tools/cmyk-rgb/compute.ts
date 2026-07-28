import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import { cmykToRgb, parseColor, rgbToCmyk, rgbToHex } from '../_shared/color';

export function computeCmykRgb(values: FieldValues): CalcResult {
    const mode = values.mode ?? 'cmyk-to-rgb';
    if (mode === 'cmyk-to-rgb') {
        const c = parseFieldNumber(values.c ?? '');
        const m = parseFieldNumber(values.m ?? '');
        const y = parseFieldNumber(values.y ?? '');
        const k = parseFieldNumber(values.k ?? '');
        if ([c,m,y,k].some((v) => v === null)) return { rows: [], error: 'CMYK-Werte 0–100 eingeben.' };
        const rgb = cmykToRgb(c!, m!, y!, k!);
        return { rows: [
            { label: 'CMYK', value: `${c} / ${m} / ${y} / ${k}` },
            { label: 'RGB', value: rgbToHex(rgb) },
        ]};
    }
    const rgb = parseColor(values.hex ?? '');
    if (!rgb) return { rows: [], error: 'Gültige Hex- oder RGB-Farbe eingeben.' };
    const cmyk = rgbToCmyk(rgb);
    return { rows: [
        { label: 'RGB', value: rgbToHex(rgb) },
        { label: 'CMYK', value: `${cmyk.c}% / ${cmyk.m}% / ${cmyk.y}% / ${cmyk.k}%` },
    ], hint: 'Näherung für Bildschirm — Druckprofil kann abweichen.' };
}
