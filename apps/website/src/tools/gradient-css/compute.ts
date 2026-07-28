import type { FieldValues, GenerateOutput } from '../_shared/shells';
import { parseColor, rgbToHex } from '../_shared/color';

export function generateGradientCss(values: FieldValues): GenerateOutput {
    const from = (values.from ?? '#9b5de5').trim();
    const to = (values.to ?? '#e9c46a').trim();
    const type = values.type ?? 'linear';
    const angle = values.angle ?? '135';
    const c1 = parseColor(from);
    const c2 = parseColor(to);
    if (!c1 || !c2) return null;
    const h1 = rgbToHex(c1);
    const h2 = rgbToHex(c2);
    const css = type === 'radial'
        ? `background: radial-gradient(circle, ${h1}, ${h2});`
        : `background: linear-gradient(${angle}deg, ${h1}, ${h2});`;
    return { kind: 'code', content: css, language: 'css', filename: 'gradient.css' };
}
