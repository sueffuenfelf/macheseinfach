import type { FieldValues, GenerateOutput } from '../_shared/shells';
import { paletteFromBase } from '../_shared/color';

export function generateColorPalette(values: FieldValues): GenerateOutput {
    const base = (values.base ?? '').trim();
    if (!base) return null;
    const colors = paletteFromBase(base, 5);
    if (!colors) return null;
    const css = colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n');
    const content = [
        'Farbpalette (5 Harmoniefarben):',
        ...colors.map((c, i) => `${i + 1}. ${c}`),
        '',
        'CSS Custom Properties:',
        ':root {',
        css,
        '}',
    ].join('\n');
    return { kind: 'text', content, filename: 'palette.txt' };
}
