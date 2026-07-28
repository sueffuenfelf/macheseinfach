import { clampByte } from './internal';
import { parseColor, rgbToCss, rgbToHex, type Rgb } from './parse';

export function remToPx(rem: number, basePx = 16): number {
    return rem * basePx;
}

export function pxToRem(px: number, basePx = 16): number {
    return px / basePx;
}

export function rgbToCmyk({ r, g, b }: Rgb): { c: number; m: number; y: number; k: number } {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const k = 1 - Math.max(rn, gn, bn);
    if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 };
    const c = ((1 - rn - k) / (1 - k)) * 100;
    const m = ((1 - gn - k) / (1 - k)) * 100;
    const y = ((1 - bn - k) / (1 - k)) * 100;
    return {
        c: Math.round(c),
        m: Math.round(m),
        y: Math.round(y),
        k: Math.round(k * 100),
    };
}

export function cmykToRgb(
    c: number,
    m: number,
    y: number,
    k: number,
): Rgb {
    const cn = c / 100;
    const mn = m / 100;
    const yn = y / 100;
    const kn = k / 100;
    return {
        r: clampByte(255 * (1 - cn) * (1 - kn)),
        g: clampByte(255 * (1 - mn) * (1 - kn)),
        b: clampByte(255 * (1 - yn) * (1 - kn)),
    };
}

export type HexRgbMode = 'hex-to-rgb' | 'rgb-to-hex';

export function convertHexRgb(mode: HexRgbMode, input: string): string | null {
    if (mode === 'hex-to-rgb') {
        const rgb = parseColor(input);
        return rgb ? rgbToCss(rgb) : null;
    }
    const rgb = parseColor(input);
    return rgb ? rgbToHex(rgb) : null;
}
