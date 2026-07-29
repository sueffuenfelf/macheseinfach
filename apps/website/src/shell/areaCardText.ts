import { contrastRatio } from '../tools/_shared/color/contrast';
import { parseHex } from '../tools/_shared/color/parse';

const BLACK = { r: 0, g: 0, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

/** Ink-soft on light surfaces; white/85 on dark accent cards. */
export type AreaCardTextColors = {
    title: string;
    description: string;
};

/**
 * High-contrast title + description for area cards on `accent` backgrounds.
 * Picks black or white based on WCAG contrast against the fill color.
 */
export function areaCardTextColors(accent: string): AreaCardTextColors {
    const bg = parseHex(accent);
    if (!bg) {
        return { title: '#000000', description: '#333333' };
    }

    const useLightText = contrastRatio(WHITE, bg) >= contrastRatio(BLACK, bg);

    return useLightText
        ? { title: '#ffffff', description: 'rgba(255, 255, 255, 0.88)' }
        : { title: '#000000', description: '#333333' };
}
