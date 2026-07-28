import { clamp01, clampByte } from './internal';
import { parseColor, rgbToHex, type Rgb } from './parse';

function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
    return { h: h * 360, s, l };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
    const hue = ((h % 360) + 360) % 360;
    if (s === 0) {
        const v = clampByte(l * 255);
        return { r: v, g: v, b: v };
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hueToRgb = (t: number) => {
        let x = t;
        if (x < 0) x += 1;
        if (x > 1) x -= 1;
        if (x < 1 / 6) return p + (q - p) * 6 * x;
        if (x < 1 / 2) return q;
        if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
        return p;
    };
    return {
        r: clampByte(hueToRgb(hue / 360 + 1 / 3) * 255),
        g: clampByte(hueToRgb(hue / 360) * 255),
        b: clampByte(hueToRgb(hue / 360 - 1 / 3) * 255),
    };
}

export function complementary(input: string): string | null {
    const rgb = parseColor(input);
    if (!rgb) return null;
    const { h, s, l } = rgbToHsl(rgb);
    return rgbToHex(hslToRgb(h + 180, s, l));
}

export function tint(input: string, amountPercent: number): string | null {
    const rgb = parseColor(input);
    if (!rgb) return null;
    const t = clamp01(amountPercent / 100);
    return rgbToHex({
        r: rgb.r + (255 - rgb.r) * t,
        g: rgb.g + (255 - rgb.g) * t,
        b: rgb.b + (255 - rgb.b) * t,
    });
}

export function shade(input: string, amountPercent: number): string | null {
    const rgb = parseColor(input);
    if (!rgb) return null;
    const t = clamp01(amountPercent / 100);
    return rgbToHex({
        r: rgb.r * (1 - t),
        g: rgb.g * (1 - t),
        b: rgb.b * (1 - t),
    });
}

/** Five harmonious colors from a base hex. */
export function paletteFromBase(input: string, count = 5): string[] | null {
    const rgb = parseColor(input);
    if (!rgb) return null;
    const { h, s, l } = rgbToHsl(rgb);
    const hues = [0, 30, 180, 210, 300];
    return hues.slice(0, count).map((offset, i) => {
        const sat = Math.min(1, s + (i % 2 === 0 ? 0.05 : 0));
        const lit = Math.min(0.85, Math.max(0.25, l + (i - 2) * 0.08));
        return rgbToHex(hslToRgb(h + offset, sat, lit));
    });
}
