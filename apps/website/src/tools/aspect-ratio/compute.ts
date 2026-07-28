import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

function gcd(a: number, b: number): number {
    let x = Math.abs(Math.round(a));
    let y = Math.abs(Math.round(b));
    while (y) { const t = y; y = x % y; x = t; }
    return x || 1;
}

export function computeAspectRatio(values: FieldValues): CalcResult {
    const mode = values.mode ?? 'ratio-to-size';
    if (mode === 'ratio-to-size') {
        const w = parseFieldNumber(values.width ?? '');
        const h = parseFieldNumber(values.height ?? '');
        const rw = parseFieldNumber(values.ratioW ?? '16');
        const rh = parseFieldNumber(values.ratioH ?? '9');
        if (!w || !h || !rw || !rh) return { rows: [], error: 'Breite, Höhe und Seitenverhältnis angeben.' };
        const targetH = Math.round((w * rh) / rw);
        const targetW = Math.round((h * rw) / rh);
        return {
            rows: [
                { label: 'Verhältnis', value: `${rw}:${rh}` },
                { label: `Bei Breite ${w}px`, value: `${targetH}px Höhe` },
                { label: `Bei Höhe ${h}px`, value: `${targetW}px Breite` },
                { label: 'CSS', value: `aspect-ratio: ${rw} / ${rh};` },
            ],
        };
    }
    const w = parseFieldNumber(values.width ?? '');
    const h = parseFieldNumber(values.height ?? '');
    if (!w || !h) return { rows: [], error: 'Breite und Höhe in Pixel eingeben.' };
    const g = gcd(w, h);
    return {
        rows: [
            { label: 'Pixel', value: `${w} × ${h}` },
            { label: 'Verhältnis', value: `${w / g}:${h / g}` },
            { label: 'Dezimal', value: (w / h).toFixed(4) },
            { label: 'CSS', value: `aspect-ratio: ${w / g} / ${h / g};` },
        ],
    };
}
