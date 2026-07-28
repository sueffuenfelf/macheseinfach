import { parseColor, rgbToHex, type Rgb } from './parse';

/** WCAG 2.x relative luminance (sRGB). */
export function relativeLuminance({ r, g, b }: Rgb): number {
    const channel = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio between two sRGB colors (1–21). */
export function contrastRatio(fg: Rgb, bg: Rgb): number {
    const l1 = relativeLuminance(fg);
    const l2 = relativeLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

export type WcagContrastResult = {
    ratio: number;
    ratioLabel: string;
    aaNormal: boolean;
    aaLarge: boolean;
    aaaNormal: boolean;
    aaaLarge: boolean;
    fg: Rgb;
    bg: Rgb;
    fgHex: string;
    bgHex: string;
};

export function checkWcagContrast(fgInput: string, bgInput: string): WcagContrastResult | null {
    const fg = parseColor(fgInput);
    const bg = parseColor(bgInput);
    if (!fg || !bg) return null;

    const ratio = contrastRatio(fg, bg);
    return {
        ratio,
        ratioLabel: `${ratio.toFixed(2)}:1`,
        aaNormal: ratio >= 4.5,
        aaLarge: ratio >= 3,
        aaaNormal: ratio >= 7,
        aaaLarge: ratio >= 4.5,
        fg,
        bg,
        fgHex: rgbToHex(fg),
        bgHex: rgbToHex(bg),
    };
}
